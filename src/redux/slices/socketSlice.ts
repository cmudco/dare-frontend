/**
 * Socket State Slice
 *
 * Manages Socket.IO connection state.
 * Handles actions dispatched by socketMiddleware.
 */

import { createSlice, createAction } from '@reduxjs/toolkit'
import type { Artifact, ArtifactType, ArtifactStatus } from '../types/artifact'

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface SocketState {
  connected: boolean
  subscribedConversations: string[]
  error: string | null
  creditError: CreditError | null
}

export interface CreditError {
  type: string
  message: string
  currentBalance: string
  requiredAmount: string
}

export interface RawArtifact {
  id: number | string
  title?: string
  outline?: string
  content?: string
  artifactType?: ArtifactType
  status?: ArtifactStatus
  estimatedSections?: number
  currentSection?: number
  progress?: number
  wordCount?: number
  language?: string
  version?: number
  parentArtifactId?: number
  artifactGroupId?: number
  createdAt?: string
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIONS (typed actions for middleware events)
// ════════════════════════════════════════════════════════════════════════════

export const socketConnected = createAction('websocket/connected')
export const socketDisconnected = createAction<{ reason?: string } | undefined>(
  'websocket/disconnected'
)
export const socketError = createAction<{ error: string }>('websocket/error')
export const socketSubscribed = createAction<{ conversationId: string }>(
  'socket/subscribed'
)
export const socketUnsubscribed = createAction<{ conversationId: string }>(
  'socket/unsubscribed'
)
export const socketSendError = createAction<{ error?: string }>(
  'socket/sendError'
)
export const socketSubscribeError = createAction<{ error?: string }>(
  'socket/subscribeError'
)

// ════════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ════════════════════════════════════════════════════════════════════════════

const initialState: SocketState = {
  connected: false,
  subscribedConversations: [],
  error: null,
  creditError: null,
}

// ════════════════════════════════════════════════════════════════════════════
// SLICE
// ════════════════════════════════════════════════════════════════════════════

export const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCreditError: (state) => {
      state.creditError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(socketConnected, (state) => {
        state.connected = true
        state.error = null
      })
      .addCase(socketDisconnected, (state, action) => {
        state.connected = false
        if (action.payload?.reason) {
          state.error = `Disconnected: ${action.payload.reason}`
        }
      })
      .addCase(socketError, (state, action) => {
        state.error = action.payload.error
      })
      .addCase(socketSubscribed, (state, action) => {
        const { conversationId } = action.payload
        if (!state.subscribedConversations.includes(conversationId)) {
          state.subscribedConversations.push(conversationId)
        }
      })
      .addCase(socketUnsubscribed, (state, action) => {
        state.subscribedConversations = state.subscribedConversations.filter(
          (id) => id !== action.payload.conversationId
        )
      })
      .addCase(socketSendError, (state, action) => {
        state.error = action.payload.error || 'Failed to send message'
      })
      .addCase(socketSubscribeError, (state, action) => {
        state.error = action.payload.error || 'Failed to subscribe'
      })
      // Handle credit errors from socket messages
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            error: string
            message: string
            current_balance: string
            required_amount: string
          }
        } =>
          action.type === 'socket/error' &&
          (action.payload?.error === 'insufficient_balance' ||
            action.payload?.error === 'insufficient_credits'),
        (state, action) => {
          state.creditError = {
            type: action.payload.error,
            message: action.payload.message,
            currentBalance: action.payload.current_balance,
            requiredAmount: action.payload.required_amount,
          }
        }
      )
  },
})

export const { clearError, clearCreditError } = socketSlice.actions
export default socketSlice.reducer

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Map raw artifact to typed Artifact
// ════════════════════════════════════════════════════════════════════════════

export function mapRawArtifact(raw: RawArtifact): Artifact {
  return {
    id: Number(raw.id),
    title: raw.title ?? '',
    content: raw.content ?? '',
    artifactType: raw.artifactType ?? 'document',
    status: raw.status ?? 'completed',
    filename: '',
    contentType: '',
    version: raw.version ?? 1,
    parentArtifactId: raw.parentArtifactId,
    artifactGroupId: raw.artifactGroupId,
    createdAt: raw.createdAt,
  }
}
