import { useDispatch, useSelector } from 'react-redux'
import {
  updateConversationInput,
  updateActiveConversation,
  updateSelectedTags,
  saveDraftForConversation,
  clearDraftForConversation,
  addAttachedImage,
  clearAttachedImages,
  updateSelectedMcpServers,
  updateSelectedDareTools,
} from '../../redux/conversationSlice'
import { AppDispatch, RootState } from '../../redux/store'
import ModelPicker from './ModelPicker'
import PromptSet from './PromptSet'
import { Message } from '../../redux/types/conversation'
import { useNavigate } from 'react-router-dom'
import {
  sendMessage,
  createConversation,
  updateConversation,
} from '../../redux/asyncThunks/conversation'
import ConversationFileSelect from './ConversationFileSelect'
import ConversationReferenceSelect from './ConversationReferenceSelect'
import ModelConfigurationPanel from './ModelConfigurationPanel'
import ExportButton from './ExportButton'
import ImagePreview from './ImagePreview'
import ImageGenerationPanel from './ImageGenerationPanel'
import AudioTranscriptionPanel from './AudioTranscriptionPanel'
import VoiceModeButton from './VoiceModeButton'
import { AlertCircle, ArrowUp, Pencil, X } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import clsx from 'clsx'
import { features } from '@/config/environment'
import { MCPServerSelector } from '@/components/MCP/MCPServerSelector'
import { DareToolSelector } from '@/components/DareTools/DareToolSelector'

interface ConversationPillProps {
  editMessageId?: string | null
  onCancelEdit?: () => void
  disabled?: boolean
}

const ConversationPill: React.FC<ConversationPillProps> = ({
  editMessageId,
  onCancelEdit,
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const conversationInput = useSelector(
    (state: RootState) => state.conversation.conversationInput
  )
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const isSocketConnected = useSelector(
    (state: RootState) => state.socket.connected
  )
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const selectedModel = useSelector(
    (state: RootState) => state.conversation.selectedModel
  )
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [showModelWarning, setShowModelWarning] = useState(false)
  const autoSaveEnabled = useSelector(
    (state: RootState) => state.conversation.autoSaveEnabled
  )
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const imageGenerationEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.imageGenerationEnabled ??
      state.conversation.imageGenerationEnabled
  )
  const audioTranscriptionEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.audioTranscriptionEnabled ??
      state.conversation.audioTranscriptionEnabled
  )
  const artifactsEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.artifactsEnabled ??
      state.conversation.artifactsEnabled
  )
  const clearPendingDraftSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
  }, [debounceTimeoutRef])

  const debouncedSaveDraft = useCallback(
    (conversationId: string, text: string) => {
      clearPendingDraftSave()

      debounceTimeoutRef.current = setTimeout(() => {
        if (autoSaveEnabled && text.trim()) {
          dispatch(saveDraftForConversation({ conversationId, text }))
        }
      }, 500)
    },
    [dispatch, autoSaveEnabled, clearPendingDraftSave]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    const newValue = event.target.value
    dispatch(updateConversationInput(newValue))

    if (activeConversation && autoSaveEnabled) {
      if (newValue.trim() === '') {
        // Clear draft if input is empty
        dispatch(clearDraftForConversation(activeConversation.conversationId))
      } else {
        debouncedSaveDraft(activeConversation.conversationId, newValue)
      }
    }
  }

  useEffect(() => {
    if (pendingMessage && isSocketConnected && activeConversation) {
      const newMessage: Partial<Message> = {
        message: pendingMessage,
      }
      dispatch(sendMessage(newMessage))
      dispatch(updateConversationInput(''))
      dispatch(clearDraftForConversation(activeConversation.conversationId))
      dispatch(clearAttachedImages())
      clearPendingDraftSave()
      setPendingMessage(null)
    }
  }, [
    pendingMessage,
    isSocketConnected,
    activeConversation,
    dispatch,
    clearPendingDraftSave,
  ])

  const handleSendMessage = () => {
    if (disabled || conversationInput.trim() === '') return

    if (selectedModel === null) {
      setShowModelWarning(true)
      return
    }

    setShowModelWarning(false)
    clearPendingDraftSave()

    const newMessage: Partial<Message> = {
      message: conversationInput,
    }

    if (!activeConversation) {
      setPendingMessage(conversationInput)
      dispatch(updateSelectedTags([]))
      dispatch(createConversation())
        .unwrap()
        .then((newConversation) => {
          dispatch(updateActiveConversation(newConversation))
          navigate(`/conversation/${newConversation.conversationId}`)
        })
        .catch((error) => {
          console.error('Error creating conversation:', error)
          setPendingMessage(null)
        })
    } else {
      dispatch(sendMessage(newMessage))
      dispatch(updateConversationInput(''))
      dispatch(clearDraftForConversation(activeConversation.conversationId))
      dispatch(clearAttachedImages())
      if (editMessageId && onCancelEdit) {
        onCancelEdit()
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    const items = event.clipboardData?.items
    if (!items) return

    // Check if there's plain text in the clipboard
    // When copying from Word/rich text editors, clipboard contains both text and image
    // We should prioritize text in that case and let the default paste behavior handle it
    const hasText = Array.from(items).some((item) => item.type === 'text/plain')

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        // Only handle image paste if there's no text (i.e., user is pasting a pure image)
        // This prevents Word/rich text clipboard images from being attached
        if (hasText) {
          continue
        }
        event.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const preview = e.target?.result as string
            const id = `${Date.now()}-${Math.random()}`
            // Only store serializable data in Redux (no File object)
            dispatch(
              addAttachedImage({
                id,
                preview,
                name: file.name || 'pasted-image.png',
                size: file.size,
                type: file.type,
              })
            )
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  useEffect(() => {
    if (selectedModel !== null) {
      setShowModelWarning(false)
    }
  }, [selectedModel])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }
  }, [conversationInput])

  useEffect(() => {
    return () => {
      clearPendingDraftSave()
    }
  }, [clearPendingDraftSave])

  return (
    <>
      <div
        className={clsx(
          'flex w-[90%] flex-col justify-end rounded-2xl transition-all duration-300',
          imageGenerationEnabled || artifactsEnabled
            ? 'gradient-border'
            : 'border-2 border-gray-200 dark:border-dark-icon-unselected',
          'dark:bg-transparent',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        {editMessageId && (
          <div className='mb-2 flex w-full items-center gap-2 rounded-b-sm rounded-t-2xl border-b bg-gray-100 px-6 py-3 dark:bg-dark-bg'>
            <Pencil className='mr-1 h-4 w-4 text-gray-600 dark:text-dark-icon-unselected' />
            <span className='flex-1 text-base font-bold text-gray-700 dark:text-white'>
              Editing message
            </span>
            <button
              onClick={onCancelEdit}
              className='ml-2 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-dark-icon-unselected/20'
            >
              <X className='-mr-2 h-5 w-5 text-gray-500 dark:text-dark-icon-unselected' />
            </button>
          </div>
        )}
        {showModelWarning && (
          <div className='mx-4 mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/40'>
            <AlertCircle className='h-4 w-4 shrink-0 text-amber-500' />
            <span className='text-sm text-amber-700 dark:text-amber-400'>
              Please select a model before sending a message.
            </span>
          </div>
        )}
        <ImagePreview />
        <div className='relative flex w-full items-center rounded-md px-4'>
          <textarea
            ref={textareaRef}
            value={conversationInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder={
              disabled
                ? 'Select a conversation to start chatting'
                : 'Type message'
            }
            disabled={disabled}
            className={clsx(
              'h-14 w-full resize-none overflow-y-auto rounded-2xl py-4 pl-2 pr-12 text-sm font-normal focus:outline-none dark:bg-transparent dark:text-white dark:placeholder-dark-icon-unselected',
              disabled && 'cursor-not-allowed opacity-60'
            )}
            rows={1}
            style={{ minHeight: '3.5rem', maxHeight: '10rem' }}
          />
          <div className='absolute right-[16px] top-1/2 flex -translate-y-1/2 items-center gap-2'>
            {/* Voice Mode Button */}
            <VoiceModeButton disabled={disabled} />
            {/* Send Button */}
            <div
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                disabled
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-600'
                  : clsx(
                      'cursor-pointer',
                      isDarkMode
                        ? 'bg-white/30 text-white hover:bg-white/50'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    )
              )}
              onClick={disabled ? undefined : handleSendMessage}
              aria-label='Send message'
            >
              <ArrowUp className='h-4 w-4' />
            </div>
          </div>
        </div>

        <div
          className={clsx(
            'relative mb-1 flex w-full items-center justify-between px-4',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <div className='flex w-full items-center gap-2'>
            <ConversationFileSelect />
            <PromptSet />
            <div className='h-8 w-[2px] rounded-lg bg-gray-300'></div>
            <ConversationReferenceSelect />

            <ModelPicker />
            {features.enableMcp && (
              <MCPServerSelector
                selectedIds={activeConversation?.selectedMcpServerIds || []}
                onChange={(serverIds) => {
                  dispatch(updateSelectedMcpServers(serverIds))
                  if (activeConversation) {
                    dispatch(
                      updateConversation({
                        conversationId: activeConversation.conversationId,
                        updates: { selectedMcpServerIds: serverIds },
                      })
                    )
                  }
                }}
                disabled={!activeConversation}
              />
            )}
            {features.enableMcp && (
              <DareToolSelector
                selectedSlugs={activeConversation?.selectedDareToolSlugs || []}
                onChange={(slugs) => {
                  dispatch(updateSelectedDareTools(slugs))
                  if (activeConversation) {
                    dispatch(
                      updateConversation({
                        conversationId: activeConversation.conversationId,
                        updates: { selectedDareToolSlugs: slugs },
                      })
                    )
                  }
                }}
                disabled={!activeConversation}
              />
            )}
          </div>
          <div className='flex items-center gap-3'>
            <div className={clsx(!imageGenerationEnabled && 'hidden')}>
              <ImageGenerationPanel />
            </div>
            <div className={clsx(!audioTranscriptionEnabled && 'hidden')}>
              <AudioTranscriptionPanel />
            </div>
            <ExportButton />
            <ModelConfigurationPanel />
          </div>
        </div>
      </div>
      <div className='mt-2 flex items-center justify-center gap-2'>
        <span
          className={clsx(
            'h-2 w-2 rounded-full',
            isSocketConnected ? 'bg-green-500' : 'bg-red-500'
          )}
          title={isSocketConnected ? 'Socket connected' : 'Socket disconnected'}
        />
        <p className='text-center text-sm text-gray-500'>
          {disabled
            ? 'Select a conversation to start chatting'
            : 'DARE Chat can make mistakes. Check important information.'}
        </p>
      </div>
    </>
  )
}

export default ConversationPill
