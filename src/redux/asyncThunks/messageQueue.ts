import type { AppDispatch, RootState } from '../store'
import {
  addAttachedImage,
  clearAttachedImages,
  updateConversationInput,
} from '../conversationSlice'
import { removeQueuedMessage, type QueuedMessage } from '../messageQueueSlice'
import { sendMessage } from './conversation'

export const sendNextQueuedMessage =
  (conversationId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().messageQueue.items.find(
      (item) => item.conversationId === conversationId
    )
    if (!next) return
    dispatch(removeQueuedMessage(next.id))
    dispatch(sendMessage({ message: next.text, images: next.images }))
  }

// Pulls a queued message back into the composer for editing.
export const editQueuedMessage =
  (queued: QueuedMessage) => (dispatch: AppDispatch) => {
    dispatch(removeQueuedMessage(queued.id))
    dispatch(updateConversationInput(queued.text))
    dispatch(clearAttachedImages())
    queued.images.forEach((image) => dispatch(addAttachedImage(image)))
  }
