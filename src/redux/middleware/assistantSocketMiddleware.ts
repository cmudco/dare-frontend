/**
 * Platform assistant Socket.IO middleware (`/assistant` namespace).
 *
 * Commands below are intercepted here and never reach reducers. Every
 * incoming `assistant` event is validated with Zod and dispatched as one
 * typed `assistantEventReceived` action.
 */

import { createAction, type Middleware } from '@reduxjs/toolkit'
import { io, type Socket } from 'socket.io-client'
import { config } from '@/config/environment'
import { SOCKET_RECONNECT_POLICY } from '@/config/socket'
import { AssistantEventSchema } from '@/schemas/assistantSocket'
import {
  ASSISTANT_CONNECTION_ERROR,
  assistantConnected,
  assistantConnecting,
  assistantConnectionFailed,
  assistantDisconnected,
  assistantEventReceived,
  assistantSendRejected,
  assistantSendRequested,
} from '@/redux/assistantSlice'
import { logout } from '@/redux/userSlice'

interface SendAck {
  ok?: boolean
  error?: string
}

export interface AssistantSendCommand {
  message: string
  path: string
}

export const assistantSocketConnect = createAction<{ jwtToken: string }>(
  'assistantSocket/connect'
)
export const assistantSocketSend = createAction<AssistantSendCommand>(
  'assistantSocket/send'
)
export const assistantSocketStop = createAction('assistantSocket/stop')

export const assistantSocketMiddleware: Middleware = ({ dispatch }) => {
  let socket: Socket | null = null

  const disconnect = () => {
    socket?.removeAllListeners()
    socket?.disconnect()
    socket = null
  }

  return (next) => (action) => {
    if (assistantSocketConnect.match(action)) {
      if (socket) return
      dispatch(assistantConnecting())
      const baseUrl = config.apiUrl.replace(/\/api\/?$/, '')
      socket = io(`${baseUrl}/assistant`, {
        path: '/socket.io/',
        auth: { token: action.payload.jwtToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: SOCKET_RECONNECT_POLICY.maxAttempts,
        reconnectionDelay: SOCKET_RECONNECT_POLICY.initialDelayMs,
        reconnectionDelayMax: SOCKET_RECONNECT_POLICY.maxDelayMs,
      })
      socket.on('connect', () => dispatch(assistantConnected()))
      socket.on('disconnect', () => dispatch(assistantDisconnected()))
      socket.on('connect_error', () => {
        dispatch(assistantConnectionFailed())
        // Allow the next panel open to retry with a fresh token.
        disconnect()
      })
      socket.on('assistant', (raw: unknown) => {
        const parsed = AssistantEventSchema.safeParse(raw)
        if (parsed.success) dispatch(assistantEventReceived(parsed.data))
      })
      return
    }

    if (assistantSocketSend.match(action)) {
      if (!socket?.connected) {
        dispatch(assistantSendRejected(ASSISTANT_CONNECTION_ERROR))
        return
      }
      dispatch(assistantSendRequested())
      socket.emit('send_message', action.payload, (ack: SendAck) => {
        if (ack.error) dispatch(assistantSendRejected(ack.error))
      })
      return
    }

    if (assistantSocketStop.match(action)) {
      socket?.emit('stop_generation', {})
      return
    }

    if (logout.match(action)) disconnect()
    return next(action)
  }
}
