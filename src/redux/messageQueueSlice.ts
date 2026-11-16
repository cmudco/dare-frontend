import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { AttachedImage, Message } from './types/conversation'
import { SenderType } from '@/utils/constants/conversation'
import { fetchConversationMessages } from './asyncThunks/conversation'
import { userLogout } from './asyncThunks/user'

export interface QueuedMessage {
  id: string
  conversationId: string
  text: string
  images: AttachedImage[]
}

/**
 * Messages typed while a reply is still running. They live only in the
 * browser and are sent one at a time as each reply finishes.
 */
interface MessageQueueState {
  items: QueuedMessage[]
  pausedConversationIds: string[]
  // Set from send until the reply shows up, so the gap before the first
  // streamed token still counts as a reply in progress.
  awaitingReplyConversationId: string | null
}

const initialState: MessageQueueState = {
  items: [],
  pausedConversationIds: [],
  awaitingReplyConversationId: null,
}

const hasQueued = (state: MessageQueueState, conversationId: string) =>
  state.items.some((item) => item.conversationId === conversationId)

const resume = (state: MessageQueueState, conversationId: string) => {
  state.pausedConversationIds = state.pausedConversationIds.filter(
    (id) => id !== conversationId
  )
}

const pauseQueuesWithMessages = (state: MessageQueueState) => {
  state.pausedConversationIds = [
    ...new Set(state.items.map((item) => item.conversationId)),
  ]
}

const messageQueueSlice = createSlice({
  name: 'messageQueue',
  initialState,
  reducers: {
    enqueueMessage: {
      reducer(state, action: PayloadAction<QueuedMessage>) {
        state.items.push(action.payload)
      },
      prepare(message: Omit<QueuedMessage, 'id'>) {
        return { payload: { ...message, id: nanoid() } }
      },
    },
    removeQueuedMessage(state, action: PayloadAction<string>) {
      const removed = state.items.find((item) => item.id === action.payload)
      if (!removed) return
      state.items = state.items.filter((item) => item.id !== action.payload)
      if (!hasQueued(state, removed.conversationId)) {
        resume(state, removed.conversationId)
      }
    },
    // Moves a message to the front so it is the next one sent.
    promoteQueuedMessage(state, action: PayloadAction<string>) {
      const index = state.items.findIndex((item) => item.id === action.payload)
      if (index === -1) return
      const [promoted] = state.items.splice(index, 1)
      state.items.unshift(promoted)
      resume(state, promoted.conversationId)
    },
    pauseMessageQueue(state, action: PayloadAction<string>) {
      if (
        hasQueued(state, action.payload) &&
        !state.pausedConversationIds.includes(action.payload)
      ) {
        state.pausedConversationIds.push(action.payload)
      }
    },
    resumeMessageQueue(state, action: PayloadAction<string>) {
      resume(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogout.pending, () => initialState)
      // Opening a chat never sends on its own: any waiting messages are held
      // until the person resumes them.
      .addCase(fetchConversationMessages.pending, (state) => {
        state.awaitingReplyConversationId = null
        pauseQueuesWithMessages(state)
      })
      .addMatcher(
        (
          action
        ): action is { type: string; payload: { conversationId: string } } =>
          action.type === 'socket/sendMessage',
        (state, action) => {
          state.awaitingReplyConversationId = action.payload.conversationId
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: Message } =>
          action.type === 'socket/message',
        (state, action) => {
          if (action.payload.senderType !== SenderType.PLAYER) {
            state.awaitingReplyConversationId = null
          }
        }
      )
      .addMatcher(
        (action) => action.type === 'socket/ai_stream',
        (state) => {
          state.awaitingReplyConversationId = null
        }
      )
      // A failed reply holds the queue instead of sending into the failure.
      .addMatcher(
        (action) =>
          action.type === 'socket/error' ||
          action.type === 'websocket/error' ||
          action.type === 'socket/sendError',
        (state) => {
          state.awaitingReplyConversationId = null
          pauseQueuesWithMessages(state)
        }
      )
  },
})

export const {
  enqueueMessage,
  removeQueuedMessage,
  promoteQueuedMessage,
  pauseMessageQueue,
  resumeMessageQueue,
} = messageQueueSlice.actions
export default messageQueueSlice.reducer
