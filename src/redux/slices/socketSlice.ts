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
  sendRefusal: SendRefusal | null
}

export enum SendRefusalCode {
  INSUFFICIENT_CREDITS = 'insufficient_credits',
  INSUFFICIENT_BALANCE = 'insufficient_balance',
  SPEND_LIMIT_REACHED = 'spend_limit_reached',
  PROVIDER_NOT_CONFIGURED = 'provider_not_configured',
}

/** A chat send the backend refused, with a reason the user can act on. */
export interface SendRefusal {
  code: SendRefusalCode
  message: string
}

/** Wire shape of a chat `error` event (WebSocketResponseService.format_error). */
interface SocketErrorEvent {
  type: 'error'
  errorCode: string
  errorMessage: string
}

const SEND_REFUSAL_CODES = new Set<string>(Object.values(SendRefusalCode))

const isSendRefusalCode = (code: string): code is SendRefusalCode =>
  SEND_REFUSAL_CODES.has(code)

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
  sendRefusal: null,
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
    clearSendRefusal: (state) => {
      state.sendRefusal = null
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
      .addMatcher(
        (action): action is { type: string; payload: SocketErrorEvent } =>
          action.type === 'socket/error',
        (state, action) => {
          const { errorCode, errorMessage } = action.payload
          if (isSendRefusalCode(errorCode)) {
            state.sendRefusal = { code: errorCode, message: errorMessage }
          }
        }
      )
  },
})

export const { clearError, clearSendRefusal } = socketSlice.actions
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
