import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import ConversationPill from './ConversationPill'
import NewConversation from './NewConversation'
import { useNavigate, useParams } from 'react-router-dom'
import {
  updateConversationInput,
  updateActiveConversation,
  loadSelectedFilesFromIds,
  loadDraftForConversation,
  saveDraftForConversation,
} from '../../redux/conversationSlice'
import { FEEDBACK_AUTO_TRIGGER_CONFIG } from '@/config/feedback'
import { Conversation } from '@/redux/types/conversation'
import MessageList from './MessageList'
import {
  connectWebSocket,
  disconnectWebSocket,
} from '../../redux/asyncThunks/websocket'
import { updateConversationFeedbackTracking } from '@/redux/asyncThunks/conversation'
import { Card } from '../ui/card'
import EmptyConversation from './EmptyConversation'
import CreditErrorAlert from './CreditErrorAlert'
import ImageDropOverlay from './ImageDropOverlay'
import { useImageDragAndDrop } from '../../hooks/useImageDragAndDrop'

const shouldShowAutoFeedback = (
  conversation: Conversation | null,
  messageCount: number
): boolean => {
  if (!FEEDBACK_AUTO_TRIGGER_CONFIG.ENABLE_AUTO_TRIGGER || !conversation) {
    return false
  }

  // Check max prompts limit
  const promptCount = conversation.feedbackAutoPromptCount || 0
  if (
    promptCount >=
    FEEDBACK_AUTO_TRIGGER_CONFIG.MAX_AUTO_PROMPTS_PER_CONVERSATION
  ) {
    return false
  }

  // Check message interval
  const lastPromptMessageCount =
    conversation.feedbackLastPromptMessageCount || 0
  const messagesSinceLastPrompt = messageCount - lastPromptMessageCount
  if (
    messagesSinceLastPrompt <
    FEEDBACK_AUTO_TRIGGER_CONFIG.MIN_MESSAGES_BETWEEN_AUTO_PROMPTS
  ) {
    return false
  }

  // Check time interval
  if (conversation.feedbackLastPromptTimestamp) {
    const lastPromptTime = new Date(
      conversation.feedbackLastPromptTimestamp
    ).getTime()
    const timeSinceLastPrompt = Date.now() - lastPromptTime
    if (
      timeSinceLastPrompt <
      FEEDBACK_AUTO_TRIGGER_CONFIG.MIN_TIME_BETWEEN_PROMPTS_MS
    ) {
      return false
    }
  }

  return true
}

const ActiveConversation: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const activeConversation = useSelector(
    (state: RootState) => state.conversation?.activeConversation
  )
  const conversationHistory = useSelector(
    (state: RootState) => state.conversation?.activeConversationMessages || []
  )
  const files = useSelector((state: RootState) => state.files.files)
  const conversationInput = useSelector(
    (state: RootState) => state.conversation.conversationInput
  )
  const autoSaveEnabled = useSelector(
    (state: RootState) => state.conversation.autoSaveEnabled
  )

  const { id } = useParams<{ id: string }>()
  const conversations = useSelector(
    (state: RootState) => state.conversation?.conversations || []
  )
  const token = localStorage.getItem('token')
  const isConnected = useSelector(
    (state: RootState) => state.websocket.isConnected
  )

  const [editMessageId, setEditMessageId] = useState<string | null>(null)
  const [shouldShowAutoFeedbackModal, setShouldShowAutoFeedbackModal] =
    useState(false)
  const hasCheckedAutoFeedback = useRef(false)
  const prevActiveConversationRef = useRef<typeof activeConversation>(null)

  // Use custom hook for drag and drop functionality
  const {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useImageDragAndDrop()

  const handleEditMessage = (id: string, content: string) => {
    setEditMessageId(id)
    dispatch(updateConversationInput(content))
  }
  const handleCancelEdit = () => {
    setEditMessageId(null)
    dispatch(updateConversationInput(''))
  }

  useEffect(() => {
    if (id) {
      const conversation = conversations.find(
        (conversation) => conversation.conversationId === id
      )
      if (!activeConversation && conversation) {
        dispatch(updateActiveConversation(conversation))
      }
    } else {
      dispatch(updateActiveConversation(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, conversations, dispatch])

  useEffect(() => {
    if (activeConversation && files.length > 0) {
      const selectedFileIds = activeConversation.selectedFileIds || []
      const selectedEmbeddingIds = activeConversation.selectedEmbeddingIds || []
      const selectedMediaIds = activeConversation.selectedMediaIds || []

      dispatch(
        loadSelectedFilesFromIds({
          files,
          selectedFileIds,
          selectedEmbeddingIds,
          selectedMediaIds,
        })
      )
    }
  }, [activeConversation?.conversationId, files, dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleWebSocketConnection = async () => {
      if (isConnected) {
        dispatch(updateConversationInput(''))
        await dispatch(disconnectWebSocket())
      }

      if (token && activeConversation) {
        try {
          await dispatch(
            connectWebSocket({
              conversationId: activeConversation.conversationId,
              jwtKey: token || '',
            })
          )
        } catch (error) {
          console.error('WebSocket connection failed:', error)
        }
      }
    }

    handleWebSocketConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.conversationId, dispatch])

  useEffect(() => {
    if (activeConversation) {
      navigate(`/conversation/${activeConversation.conversationId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation, dispatch])

  useEffect(() => {
    setEditMessageId(null)
  }, [activeConversation?.conversationId])

  useEffect(() => {
    const prevConversation = prevActiveConversationRef.current
    const currentConversation = activeConversation

    if (
      prevConversation?.conversationId !== currentConversation?.conversationId
    ) {
      if (prevConversation && autoSaveEnabled && conversationInput.trim()) {
        dispatch(
          saveDraftForConversation({
            conversationId: prevConversation.conversationId,
            text: conversationInput,
          })
        )
      }

      if (currentConversation) {
        dispatch(loadDraftForConversation(currentConversation.conversationId))
      }

      prevActiveConversationRef.current = currentConversation
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.conversationId, dispatch])

  // Extract complex expression for linting
  const lastMessageStreaming = useMemo(
    () => conversationHistory[conversationHistory.length - 1]?.streaming,
    [conversationHistory]
  )

  // Auto-trigger feedback modal
  useEffect(() => {
    if (
      !activeConversation ||
      conversationHistory.length === 0 ||
      hasCheckedAutoFeedback.current
    ) {
      return
    }

    // Get last message
    const lastMessage = conversationHistory[conversationHistory.length - 1]

    // Only trigger after AI message that's done streaming
    if (lastMessage.isSender || lastMessage.streaming) {
      return
    }

    // Count only model response messages
    const nModelMessages = conversationHistory.filter((m) => !m.isSender).length

    const shouldTrigger = shouldShowAutoFeedback(
      activeConversation,
      nModelMessages
    )

    if (shouldTrigger) {
      hasCheckedAutoFeedback.current = true

      // Update conversation tracking
      dispatch(
        updateConversationFeedbackTracking({
          conversationId: activeConversation.conversationId,
          feedbackAutoPromptCount:
            (activeConversation.feedbackAutoPromptCount || 0) + 1,
          feedbackLastPromptMessageCount: nModelMessages,
          feedbackLastPromptTimestamp: new Date().toISOString(),
        })
      )

      // Signal to show modal on the last message
      setShouldShowAutoFeedbackModal(true)
      setTimeout(() => setShouldShowAutoFeedbackModal(false), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    conversationHistory.length,
    activeConversation?.conversationId,
    lastMessageStreaming,
  ])

  // Reset auto-feedback check when switching conversations
  useEffect(() => {
    hasCheckedAutoFeedback.current = false
    setShouldShowAutoFeedbackModal(false)
  }, [activeConversation?.conversationId])

  return (
    <>
      <CreditErrorAlert />
      <Card
        className='flex-2 dark:bg-dark-gradient relative flex h-[90vh] w-full min-w-[65vw] flex-col justify-end rounded-none border-none'
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ImageDropOverlay isVisible={isDragging} />
        <div className={`flex h-full flex-col justify-between`}>
          {!activeConversation && <NewConversation />}
          {activeConversation && conversationHistory.length === 0 && (
            <EmptyConversation />
          )}
          {activeConversation && conversationHistory.length > 0 && (
            <MessageList
              onEditMessage={handleEditMessage}
              shouldShowAutoFeedbackModal={shouldShowAutoFeedbackModal}
            />
          )}
          <div className='flex flex-col items-center justify-center'>
            <ConversationPill
              editMessageId={editMessageId}
              onCancelEdit={handleCancelEdit}
              disabled={!activeConversation}
            />
          </div>
        </div>
      </Card>
    </>
  )
}

export default ActiveConversation
