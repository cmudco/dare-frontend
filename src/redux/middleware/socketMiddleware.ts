/**
 * Socket.IO Redux Middleware
 *
 * Industry best-practice implementation for Socket.IO + Redux integration.
 *
 * Architecture:
 * - Socket.IO connection lives in middleware (not in store)
 * - Actions with specific types trigger socket operations
 * - Incoming socket events dispatch Redux actions
 *
 * Usage:
 *   1. Add socketMiddleware to Redux store
 *   2. Dispatch socket actions (SOCKET_CONNECT, SOCKET_SEND_MESSAGE, etc.)
 *   3. Listen for incoming actions in reducers
 */

import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

// Internal action type for middleware
interface SocketActionWithPayload {
  type: string
  payload?: Record<string, unknown>
}
import { io, Socket } from 'socket.io-client'
import { config } from '@/config/environment'
import { debugLog } from '@/utils/debugLogger'

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

// Socket.IO event types from backend
export interface ServerToClientEvents {
  message: (data: SocketMessage) => void
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
}

// Socket.IO event types to backend
export interface ClientToServerEvents {
  subscribe_conversation: (
    data: { conversationId: string; platform?: string },
    callback: (response: SocketResponse) => void
  ) => void
  unsubscribe_conversation: (
    data: { conversationId: string },
    callback: (response: SocketResponse) => void
  ) => void
  send_message: (
    data: Record<string, unknown>,
    callback: (response: SocketResponse) => void
  ) => void
  send_voice_message: (
    data: {
      conversationId: string
      audio: string
      audioFormat: string
      language: string
    },
    callback: (response: SocketResponse) => void
  ) => void
  edit_message: (
    data: { conversationId: string; messageId: string; message: string },
    callback: (response: SocketResponse) => void
  ) => void
  regenerate_response: (
    data: Record<string, unknown>,
    callback: (response: SocketResponse) => void
  ) => void
  continue_artifact: (
    data: { conversationId: string; artifactId: number },
    callback: (response: SocketResponse) => void
  ) => void
  pause_artifact: (
    data: { conversationId: string; artifactId: number },
    callback: (response: SocketResponse) => void
  ) => void
}

export interface SocketResponse {
  success: boolean
  error?: string
  conversationId?: string
}

export interface SocketMessage {
  type: string
  [key: string]: unknown
}

// ════════════════════════════════════════════════════════════════════════════
// ACTION TYPES
// ════════════════════════════════════════════════════════════════════════════

export const SOCKET_CONNECT = 'socket/connect'
export const SOCKET_DISCONNECT = 'socket/disconnect'
export const SOCKET_SUBSCRIBE = 'socket/subscribe'
export const SOCKET_UNSUBSCRIBE = 'socket/unsubscribe'
export const SOCKET_SEND_MESSAGE = 'socket/sendMessage'
export const SOCKET_SEND_VOICE_MESSAGE = 'socket/sendVoiceMessage'
export const SOCKET_EDIT_MESSAGE = 'socket/editMessage'
export const SOCKET_REGENERATE = 'socket/regenerate'
export const SOCKET_CONTINUE_ARTIFACT = 'socket/continueArtifact'
export const SOCKET_PAUSE_ARTIFACT = 'socket/pauseArtifact'

// ════════════════════════════════════════════════════════════════════════════
// ACTION CREATORS
// ════════════════════════════════════════════════════════════════════════════

export const socketConnect = (jwtToken: string) => ({
  type: SOCKET_CONNECT as typeof SOCKET_CONNECT,
  payload: { jwtToken },
})

export const socketDisconnect = () => ({
  type: SOCKET_DISCONNECT as typeof SOCKET_DISCONNECT,
})

export const socketSubscribe = (conversationId: string, platform = 'DARE') => ({
  type: SOCKET_SUBSCRIBE as typeof SOCKET_SUBSCRIBE,
  payload: { conversationId, platform },
})

export const socketUnsubscribe = (conversationId: string) => ({
  type: SOCKET_UNSUBSCRIBE as typeof SOCKET_UNSUBSCRIBE,
  payload: { conversationId },
})

export const socketSendMessage = (
  conversationId: string,
  payload: Record<string, unknown>
) => ({
  type: SOCKET_SEND_MESSAGE as typeof SOCKET_SEND_MESSAGE,
  payload: { conversationId, ...payload },
})

export const socketEditMessage = (
  conversationId: string,
  messageId: string,
  message: string
) => ({
  type: SOCKET_EDIT_MESSAGE as typeof SOCKET_EDIT_MESSAGE,
  payload: { conversationId, messageId, message },
})

export const socketRegenerate = (
  conversationId: string,
  messageId: string,
  options: Record<string, unknown>
) => ({
  type: SOCKET_REGENERATE as typeof SOCKET_REGENERATE,
  payload: { conversationId, message_id: messageId, ...options },
})

export const socketContinueArtifact = (
  conversationId: string,
  artifactId: number
) => ({
  type: SOCKET_CONTINUE_ARTIFACT as typeof SOCKET_CONTINUE_ARTIFACT,
  payload: { conversationId, artifactId },
})

export const socketPauseArtifact = (
  conversationId: string,
  artifactId: number
) => ({
  type: SOCKET_PAUSE_ARTIFACT as typeof SOCKET_PAUSE_ARTIFACT,
  payload: { conversationId, artifactId },
})

export const socketSendVoiceMessage = (
  conversationId: string,
  audioBlob: Blob,
  language?: string
) => ({
  type: SOCKET_SEND_VOICE_MESSAGE as typeof SOCKET_SEND_VOICE_MESSAGE,
  payload: { conversationId, audioBlob, language },
})

// Action type union
export type SocketAction =
  | ReturnType<typeof socketConnect>
  | ReturnType<typeof socketDisconnect>
  | ReturnType<typeof socketSubscribe>
  | ReturnType<typeof socketUnsubscribe>
  | ReturnType<typeof socketSendMessage>
  | ReturnType<typeof socketSendVoiceMessage>
  | ReturnType<typeof socketEditMessage>
  | ReturnType<typeof socketRegenerate>
  | ReturnType<typeof socketContinueArtifact>
  | ReturnType<typeof socketPauseArtifact>

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════════════════════

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/**
 * Create Socket.IO Redux middleware
 *
 * Handles:
 * - Connection lifecycle
 * - Event subscriptions
 * - Message sending
 * - Dispatching incoming events as Redux actions
 */
export function createSocketMiddleware(): Middleware {
  let socket: TypedSocket | null = null
  const subscriptions = new Set<string>()

  return (store) => (next) => (action: unknown) => {
    const typedAction = action as SocketActionWithPayload
    const dispatch = store.dispatch

    switch (typedAction.type) {
      // ─────────────────────────────────────────────────────────────────────
      // Connection
      // ─────────────────────────────────────────────────────────────────────

      case SOCKET_CONNECT: {
        const { jwtToken } = typedAction.payload as { jwtToken: string }

        // Already connected or connecting - don't create another socket
        if (socket) {
          debugLog('🔌 Socket already exists, skipping connection')
          return next(typedAction)
        }

        // Build URL with /chat namespace
        const baseUrl = config.apiUrl.replace(/\/api\/?$/, '')
        const socketUrl = `${baseUrl}/chat`

        // Create socket connecting to /chat namespace
        socket = io(socketUrl, {
          path: '/socket.io/',
          auth: { token: jwtToken },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 30000,
        }) as TypedSocket

        // Connection events
        socket.on('connect', () => {
          debugLog('🔌 Socket.IO connected')
          dispatch({ type: 'websocket/connected' })

          // Re-subscribe after reconnect
          subscriptions.forEach((convId) => {
            socket?.emit(
              'subscribe_conversation',
              { conversationId: convId },
              () => {}
            )
          })
        })

        socket.on('disconnect', (reason) => {
          debugLog('🔌 Socket.IO disconnected:', reason)
          dispatch({ type: 'websocket/disconnected', payload: { reason } })
        })

        socket.on('connect_error', (error) => {
          console.error('🔌 Socket.IO error:', error.message)
          dispatch({
            type: 'websocket/error',
            payload: { error: error.message },
          })
        })

        // Incoming messages → dispatch as actions
        // All socket messages should be objects (not JSON strings)
        socket.on('message', (data) => {
          if (typeof data === 'string') {
            // This shouldn't happen after BE fix - log for debugging
            console.error('🔌 Received string message, expected object:', data)
            return
          }
          dispatch({ type: `socket/${data.type}`, payload: data })
        })

        break
      }

      case SOCKET_DISCONNECT: {
        if (socket) {
          socket.disconnect()
          socket = null
        }
        subscriptions.clear()
        dispatch({ type: 'websocket/disconnected' })
        break
      }

      // ─────────────────────────────────────────────────────────────────────
      // Subscriptions
      // ─────────────────────────────────────────────────────────────────────

      case SOCKET_SUBSCRIBE: {
        const { conversationId, platform } = typedAction.payload as {
          conversationId: string
          platform?: string
        }

        if (!socket?.connected) {
          console.warn('Cannot subscribe: not connected')
          return next(typedAction)
        }

        socket.emit(
          'subscribe_conversation',
          { conversationId, platform },
          (response) => {
            if (response.success) {
              subscriptions.add(conversationId)
              dispatch({
                type: 'socket/subscribed',
                payload: { conversationId },
              })
            } else {
              dispatch({
                type: 'socket/subscribeError',
                payload: { conversationId, error: response.error },
              })
            }
          }
        )
        break
      }

      case SOCKET_UNSUBSCRIBE: {
        const { conversationId } = typedAction.payload as {
          conversationId: string
        }

        if (!socket?.connected) {
          return next(typedAction)
        }

        socket.emit('unsubscribe_conversation', { conversationId }, () => {
          subscriptions.delete(conversationId)
          dispatch({ type: 'socket/unsubscribed', payload: { conversationId } })
        })
        break
      }

      // ─────────────────────────────────────────────────────────────────────
      // Messages
      // ─────────────────────────────────────────────────────────────────────

      case SOCKET_SEND_MESSAGE: {
        if (!socket?.connected) {
          console.warn('Cannot send: not connected')
          return next(typedAction)
        }

        // Get active artifact ID from state (for intent detection)
        const state = store.getState() as RootState
        const activeArtifactId = state.artifact?.activeArtifactId

        // Include active_artifact_id in the payload for backend intent detection
        const messagePayload = {
          ...(typedAction.payload as Record<string, unknown>),
          active_artifact_id: activeArtifactId,
        }

        socket.emit('send_message', messagePayload, (response) => {
          if (!response.success) {
            dispatch({
              type: 'socket/sendError',
              payload: { error: response.error },
            })
          }
        })
        break
      }

      case SOCKET_EDIT_MESSAGE: {
        if (!socket?.connected) return next(typedAction)

        socket.emit(
          'edit_message',
          typedAction.payload as {
            conversationId: string
            messageId: string
            message: string
          },
          (response) => {
            if (!response.success) {
              dispatch({
                type: 'socket/editError',
                payload: { error: response.error },
              })
            }
          }
        )
        break
      }

      case SOCKET_REGENERATE: {
        if (!socket?.connected) return next(typedAction)

        socket.emit(
          'regenerate_response',
          typedAction.payload as Record<string, unknown>,
          (response) => {
            if (!response.success) {
              dispatch({
                type: 'socket/regenerateError',
                payload: { error: response.error },
              })
            }
          }
        )
        break
      }

      // ─────────────────────────────────────────────────────────────────────
      // Artifacts
      // ─────────────────────────────────────────────────────────────────────

      case SOCKET_CONTINUE_ARTIFACT: {
        if (!socket?.connected) return next(typedAction)

        socket.emit(
          'continue_artifact',
          typedAction.payload as { conversationId: string; artifactId: number },
          (response) => {
            if (!response.success) {
              dispatch({
                type: 'socket/artifactError',
                payload: { error: response.error },
              })
            }
          }
        )
        break
      }

      case SOCKET_PAUSE_ARTIFACT: {
        if (!socket?.connected) return next(typedAction)

        socket.emit(
          'pause_artifact',
          typedAction.payload as { conversationId: string; artifactId: number },
          (response) => {
            if (!response.success) {
              dispatch({
                type: 'socket/artifactError',
                payload: { error: response.error },
              })
            }
          }
        )
        break
      }

      // ─────────────────────────────────────────────────────────────────────
      // Voice Input
      // ─────────────────────────────────────────────────────────────────────

      case SOCKET_SEND_VOICE_MESSAGE: {
        if (!socket?.connected) {
          console.warn('Cannot send voice message: not connected')
          return next(typedAction)
        }

        const { conversationId, audioBlob, language } = typedAction.payload as {
          conversationId: string
          audioBlob: Blob
          language?: string
        }

        // Convert Blob to base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Data = reader.result as string
          // Extract base64 content (remove data URL prefix)
          const base64 = base64Data.split(',')[1]
          // Get audio format from MIME type (e.g., 'audio/webm' -> 'webm')
          const audioFormat =
            audioBlob.type.split('/')[1]?.split(';')[0] || 'webm'

          socket?.emit(
            'send_voice_message',
            {
              conversationId,
              audio: base64,
              audioFormat,
              language: language || 'auto',
            },
            (response: SocketResponse) => {
              if (!response.success) {
                dispatch({
                  type: 'socket/voiceError',
                  payload: { error: response.error },
                })
              }
            }
          )
        }
        reader.onerror = () => {
          dispatch({
            type: 'socket/voiceError',
            payload: { error: 'Failed to read audio data' },
          })
        }
        reader.readAsDataURL(audioBlob)
        break
      }
    }

    return next(typedAction)
  }
}

// Export middleware instance
export const socketMiddleware = createSocketMiddleware()
