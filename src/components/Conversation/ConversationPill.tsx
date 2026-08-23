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
import ModelPicker from './ModelPicker/index'
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
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { MCPServerSelector } from '@/components/MCP/MCPServerSelector'
import { DareToolSelector } from '@/components/DareTools/DareToolSelector'
import { QuillPicker } from './QuillPicker'

const QUILLMARK_SERVER_SLUG = 'quillmark'

interface ConversationPillProps {
  editMessageId?: string | null
  onCancelEdit?: () => void
  onMessageSent?: () => void
  disabled?: boolean
}

const ConversationPill: React.FC<ConversationPillProps> = ({
  editMessageId,
  onCancelEdit,
  onMessageSent,
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const conversationInput = useSelector(
    (state: RootState) => state.conversation.conversationInput
  )
  const enableMcp = useFeatureFlag('enableMcp')
  const enableArtifacts = useFeatureFlag('enableArtifacts')
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const isSocketConnected = useSelector(
    (state: RootState) => state.socket.connected
  )
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedModel = useSelector(
    (state: RootState) => state.conversation.selectedModel
  )
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [showModelWarning, setShowModelWarning] = useState(false)
  const [selectedQuill, setSelectedQuill] = useState<string | null>(null)
  const mcpServers = useSelector((state: RootState) => state.mcp.servers)
  const mcpConnections = useSelector(
    (state: RootState) => state.mcp.connections
  )
  const hasQuillmarkConnection = mcpConnections.some(
    (connection) =>
      connection.isActive &&
      connection.hasCredentials &&
      connection.server.isActive &&
      connection.server.slug === QUILLMARK_SERVER_SLUG
  )
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

  const handleQuillChange = (quillName: string | null) => {
    setSelectedQuill(quillName)

    // Return focus to the composer so the next Enter sends the message
    // (the picker popover otherwise keeps keyboard focus)
    textareaRef.current?.focus()

    // Ensure the quillmark MCP server is enabled when a quill is selected
    if (quillName && activeConversation) {
      const quillmarkServer = mcpServers.find(
        (server) => server.slug === QUILLMARK_SERVER_SLUG
      )
      const currentServerIds = activeConversation.selectedMcpServerIds || []
      if (quillmarkServer && !currentServerIds.includes(quillmarkServer.id)) {
        const serverIds = [...currentServerIds, quillmarkServer.id]
        dispatch(updateSelectedMcpServers(serverIds))
        dispatch(
          updateConversation({
            conversationId: activeConversation.conversationId,
            updates: { selectedMcpServerIds: serverIds },
          })
        )
      }
    }
  }

  const handleSendMessage = () => {
    if (disabled || conversationInput.trim() === '') return

    if (selectedModel === null) {
      setShowModelWarning(true)
      return
    }

    setShowModelWarning(false)
    clearPendingDraftSave()

    const messageText = selectedQuill
      ? `${conversationInput}\n\n[Selected CMU document template: "${selectedQuill}"]`
      : conversationInput

    const newMessage: Partial<Message> = {
      message: messageText,
    }

    onMessageSent?.()

    if (!activeConversation) {
      setPendingMessage(messageText)
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

    // Quill hint is attached to the outgoing message — clear the selection
    setSelectedQuill(null)
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
          'flex w-full max-w-4xl flex-col justify-end rounded-2xl transition-all duration-300',
          imageGenerationEnabled || artifactsEnabled
            ? 'gradient-border'
            : 'border-2 border-border',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        {editMessageId && (
          <div className='mb-2 flex w-full items-center gap-2 rounded-t-2xl rounded-b-sm border-b bg-muted px-6 py-3'>
            <Pencil className='mr-1 h-4 w-4 text-muted-foreground' />
            <span className='flex-1 text-base font-bold text-foreground'>
              Editing message
            </span>
            <button
              onClick={onCancelEdit}
              className='ml-2 rounded-full p-1 hover:bg-accent'
            >
              <X className='-mr-2 h-5 w-5 text-muted-foreground' />
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
              'h-14 w-full resize-none overflow-y-auto rounded-2xl bg-transparent py-4 pr-12 pl-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:outline-hidden',
              disabled && 'cursor-not-allowed opacity-60'
            )}
            rows={1}
            style={{ minHeight: '3.5rem', maxHeight: '10rem' }}
          />
          <div className='absolute top-1/2 right-[16px] flex -translate-y-1/2 items-center gap-2'>
            {/* Voice Mode Button */}
            <VoiceModeButton disabled={disabled} />
            {/* Send Button */}
            <div
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                disabled
                  ? 'cursor-not-allowed bg-muted text-muted-foreground'
                  : 'cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80'
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
            'relative mb-1 flex w-full flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <div className='flex min-w-0 flex-1 flex-wrap items-center gap-1.5 overflow-x-auto py-1 sm:flex-nowrap'>
            <ConversationFileSelect />
            <PromptSet />
            <div className='h-8 w-[2px] shrink-0 rounded-lg bg-border'></div>
            <ConversationReferenceSelect />

            <ModelPicker />
            {enableMcp && (
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
            {enableMcp && hasQuillmarkConnection && (
              <QuillPicker
                selectedQuill={selectedQuill}
                onChange={handleQuillChange}
                disabled={!activeConversation}
              />
            )}
            {enableArtifacts && (
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
          <div className='flex shrink-0 items-center justify-end gap-2 self-end sm:gap-3 sm:self-auto'>
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
        <p className='text-center text-sm text-muted-foreground'>
          {disabled
            ? 'Select a conversation to start chatting'
            : 'DARE Chat can make mistakes. Check important information.'}
        </p>
      </div>
    </>
  )
}

export default ConversationPill
