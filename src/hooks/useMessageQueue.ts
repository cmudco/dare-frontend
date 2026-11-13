import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { sendNextQueuedMessage } from '@/redux/asyncThunks/messageQueue'

/**
 * The active chat's queue of waiting messages. While mounted it sends the
 * next one whenever the chat is free to take it.
 */
export const useMessageQueue = (
  conversationId: string | undefined,
  canSend: boolean
) => {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((state: RootState) => state.messageQueue.items)
  const queue = useMemo(
    () => items.filter((item) => item.conversationId === conversationId),
    [items, conversationId]
  )
  const paused = useSelector(
    (state: RootState) =>
      !!conversationId &&
      state.messageQueue.pausedConversationIds.includes(conversationId)
  )
  const replyInProgress = useSelector(
    (state: RootState) =>
      state.messageQueue.awaitingReplyConversationId === conversationId ||
      state.conversation.activeConversationMessages.some(
        (message) => message.streaming
      )
  )

  const hasQueued = queue.length > 0
  useEffect(() => {
    if (conversationId && canSend && hasQueued && !paused && !replyInProgress) {
      dispatch(sendNextQueuedMessage(conversationId))
    }
  }, [dispatch, conversationId, canSend, hasQueued, paused, replyInProgress])

  return { queue, paused, replyInProgress }
}
