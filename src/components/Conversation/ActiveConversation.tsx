import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateConversationInput,
  updateActiveConversation,
  loadDraftForConversation,
  saveDraftForConversation,
  clearConversation,
} from '../../redux/conversationSlice'
import {
  updateConversationFeedbackTracking,
  forkConversation,
} from '@/redux/asyncThunks/conversation'
import { useSocketSubscription } from '@/hooks/useSocketSubscription'
import { useImageDragAndDrop } from '../../hooks/useImageDragAndDrop'
import { FEEDBACK_AUTO_TRIGGER_CONFIG } from '@/config/feedback'
import { features } from '@/config/environment'
import { Conversation, isSenderMessage } from '@/redux/types/conversation'
import { Card } from '../ui/card'
import ConversationPill from './ConversationPill'
import ForkConfirmDialog from '../shared/ForkConfirmDialog'
import NewConversation from './NewConversation'
import EmptyConversation from './EmptyConversation'
import CreditErrorAlert from './CreditErrorAlert'
import ImageDropOverlay from './ImageDropOverlay'
import MessageList from './MessageList'
import { ArtifactSidecar } from '../Artifacts'
import { useConversationFiles } from '@/hooks/useConversationFiles'

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function shouldShowAutoFeedback(
  conversation: Conversation | null,
  messageCount: number
): boolean {
  if (!FEEDBACK_AUTO_TRIGGER_CONFIG.ENABLE_AUTO_TRIGGER || !conversation) {
    return false
  }

  const promptCount = conversation.feedbackAutoPromptCount || 0
  if (
    promptCount >=
    FEEDBACK_AUTO_TRIGGER_CONFIG.MAX_AUTO_PROMPTS_PER_CONVERSATION
  ) {
    return false
  }

  const lastPromptMessageCount =
    conversation.feedbackLastPromptMessageCount || 0
  const messagesSinceLastPrompt = messageCount - lastPromptMessageCount
  if (
    messagesSinceLastPrompt <
    FEEDBACK_AUTO_TRIGGER_CONFIG.MIN_MESSAGES_BETWEEN_AUTO_PROMPTS
  ) {
    return false
  }

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

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const ActiveConversation: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { id } = useParams<{ id: string }>()

  // Redux state
  const activeConversation = useSelector(
    (state: RootState) => state.conversation?.activeConversation
  )
  const conversationHistory = useSelector(
    (state: RootState) => state.conversation?.activeConversationMessages || []
  )
  const conversations = useSelector(
    (state: RootState) => state.conversation?.conversations || []
  )
  const conversationInput = useSelector(
    (state: RootState) => state.conversation.conversationInput
  )
  const autoSaveEnabled = useSelector(
    (state: RootState) => state.conversation.autoSaveEnabled
  )

  // Local state
  const [editMessageId, setEditMessageId] = useState<string | null>(null)
  const [shouldShowAutoFeedbackModal, setShouldShowAutoFeedbackModal] =
    useState(false)
  const [userJustSentMessage, setUserJustSentMessage] = useState(false)
  const [showForkDialog, setShowForkDialog] = useState(false)

  // Resolve and load files for forked/shared conversations
  useConversationFiles(activeConversation)

  // Refs
  const hasCheckedAutoFeedback = useRef(false)
  const prevActiveConversationRef = useRef<typeof activeConversation>(null)
  const prevMessageCountRef = useRef(conversationHistory.length)

  // Hooks
  const {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useImageDragAndDrop()

  // Socket subscription
  useSocketSubscription(activeConversation?.conversationId)

  // ──────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ──────────────────────────────────────────────────────────────────────────

  // Set active conversation from URL param
  useEffect(() => {
    if (id) {
      const conversation = conversations.find((c) => c.conversationId === id)
      if (!activeConversation && conversation) {
        dispatch(updateActiveConversation(conversation))
      }
    } else {
      dispatch(updateActiveConversation(null))
    }
  }, [id, conversations, activeConversation, dispatch])

  // Clear conversation state when switching
  useEffect(() => {
    if (activeConversation) {
      dispatch(clearConversation())
      dispatch(updateConversationInput(''))
    }
  }, [activeConversation?.conversationId, dispatch])

  // Navigate to conversation URL
  useEffect(() => {
    if (activeConversation) {
      navigate(`/conversation/${activeConversation.conversationId}`)
    }
  }, [activeConversation, navigate])

  // Reset edit state on conversation change
  useEffect(() => {
    setEditMessageId(null)
  }, [activeConversation?.conversationId])

  // Draft save/load on conversation switch
  useEffect(() => {
    const prevConversation = prevActiveConversationRef.current
    const currentConversation = activeConversation

    if (
      prevConversation?.conversationId !== currentConversation?.conversationId
    ) {
      // Save draft for previous conversation
      if (prevConversation && autoSaveEnabled && conversationInput.trim()) {
        dispatch(
          saveDraftForConversation({
            conversationId: prevConversation.conversationId,
            text: conversationInput,
          })
        )
      }

      // Load draft for current conversation
      if (currentConversation) {
        dispatch(loadDraftForConversation(currentConversation.conversationId))
      }

      prevActiveConversationRef.current = currentConversation
    }
  }, [
    activeConversation?.conversationId,
    autoSaveEnabled,
    conversationInput,
    dispatch,
  ])

  // Auto-trigger feedback modal
  const lastMessageStreaming = useMemo(
    () => conversationHistory[conversationHistory.length - 1]?.streaming,
    [conversationHistory]
  )

  useEffect(() => {
    if (
      !activeConversation ||
      conversationHistory.length === 0 ||
      hasCheckedAutoFeedback.current
    ) {
      return
    }

    const lastMessage = conversationHistory[conversationHistory.length - 1]
    if (isSenderMessage(lastMessage) || lastMessage.streaming) {
      return
    }

    const nModelMessages = conversationHistory.filter(
      (m) => !isSenderMessage(m)
    ).length
    const shouldTrigger = shouldShowAutoFeedback(
      activeConversation,
      nModelMessages
    )

    if (shouldTrigger) {
      hasCheckedAutoFeedback.current = true
      dispatch(
        updateConversationFeedbackTracking({
          conversationId: activeConversation.conversationId,
          feedbackAutoPromptCount:
            (activeConversation.feedbackAutoPromptCount || 0) + 1,
          feedbackLastPromptMessageCount: nModelMessages,
          feedbackLastPromptTimestamp: new Date().toISOString(),
        })
      )
      setShouldShowAutoFeedbackModal(true)
      setTimeout(() => setShouldShowAutoFeedbackModal(false), 0)
    }
  }, [
    conversationHistory.length,
    activeConversation,
    lastMessageStreaming,
    dispatch,
  ])

  // Reset auto-feedback check on conversation switch
  useEffect(() => {
    hasCheckedAutoFeedback.current = false
    setShouldShowAutoFeedbackModal(false)
  }, [activeConversation?.conversationId])

  // Detect when user sends a new message (for scroll-to-bottom)
  useEffect(() => {
    const currentCount = conversationHistory.length
    const prevCount = prevMessageCountRef.current

    if (currentCount > prevCount) {
      const newMessage = conversationHistory[currentCount - 1]
      // If the new message is from the user, trigger scroll
      if (newMessage && isSenderMessage(newMessage)) {
        setUserJustSentMessage(true)
        // Reset after a tick so the effect in MessageList can fire
        requestAnimationFrame(() => setUserJustSentMessage(false))
      }
    }

    prevMessageCountRef.current = currentCount
  }, [conversationHistory.length, conversationHistory])

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleEditMessage = (id: string, content: string) => {
    setEditMessageId(id)
    dispatch(updateConversationInput(content))
  }

  const handleCancelEdit = () => {
    setEditMessageId(null)
    dispatch(updateConversationInput(''))
  }

  const handleForkAndContinue = () => {
    setShowForkDialog(true)
  }

  const handleConfirmFork = async () => {
    if (!activeConversation) return
    try {
      const forked = await dispatch(
        forkConversation(activeConversation.conversationId)
      ).unwrap()
      setShowForkDialog(false)
      dispatch(updateActiveConversation(forked))
      navigate(`/conversation/${forked.conversationId}`)
    } catch (err) {
      console.error('Error forking:', err)
      setShowForkDialog(false)
    }
  }

  const handleCancelFork = () => {
    setShowForkDialog(false)
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <>
      <CreditErrorAlert />
      <div className='flex h-full min-h-0 min-w-0 flex-1'>
        <Card
          className='dark:bg-dark-gradient relative flex min-h-0 min-w-0 flex-1 flex-col justify-end rounded-none border-none'
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ImageDropOverlay isVisible={isDragging} />
          <div className='flex min-h-0 flex-1 flex-col justify-between'>
            {!activeConversation && <NewConversation />}
            {activeConversation && conversationHistory.length === 0 && (
              <EmptyConversation />
            )}
            {activeConversation && conversationHistory.length > 0 && (
              <MessageList
                onEditMessage={handleEditMessage}
                shouldShowAutoFeedbackModal={shouldShowAutoFeedbackModal}
                conversationId={activeConversation?.conversationId}
                userJustSentMessage={userJustSentMessage}
              />
            )}
            <div className='flex flex-col items-center justify-center'>
              {/* Read-only banner for shared conversations */}
              {features.enableSharing &&
                activeConversation &&
                activeConversation.isOwner === false && (
                  <div className='mb-2 flex w-full max-w-3xl items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950/30'>
                    <span className='text-sm text-amber-700 dark:text-amber-400'>
                      This is a shared conversation (read-only)
                    </span>
                    <button
                      onClick={handleForkAndContinue}
                      className='ml-3 shrink-0 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600'
                    >
                      Fork & Continue
                    </button>
                  </div>
                )}
              <ConversationPill
                editMessageId={editMessageId}
                onCancelEdit={handleCancelEdit}
                disabled={
                  !activeConversation || activeConversation.isOwner === false
                }
              />
            </div>
          </div>
        </Card>
        {features.enableArtifacts && <ArtifactSidecar />}
      </div>

      <ForkConfirmDialog
        isOpen={showForkDialog}
        title={activeConversation?.title || 'Untitled Conversation'}
        entityType='conversation'
        copiedItems={[
          'All messages and conversation history',
          'Conversation settings and configuration',
          'File selections (shared from the original owner)',
        ]}
        onConfirm={handleConfirmFork}
        onCancel={handleCancelFork}
      />
    </>
  )
}

export default ActiveConversation
