/**
 * useSocket - React Hook for Socket.IO
 *
 * Clean, intuitive API for Socket.IO operations in components.
 *
 * Usage:
 * ```tsx
 * const { connect, subscribe, sendMessage, isConnected } = useSocket()
 *
 * useEffect(() => {
 *   connect(jwtToken)
 *   return () => disconnect()
 * }, [])
 *
 * const handleSend = () => {
 *   sendMessage(conversationId, { message: 'Hello!' })
 * }
 * ```
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import {
  socketConnect,
  socketDisconnect,
  socketSubscribe,
  socketUnsubscribe,
  socketSendMessage,
  socketEditMessage,
  socketRegenerate,
  socketContinueArtifact,
  socketPauseArtifact,
} from '../redux/middleware/socketMiddleware'

/**
 * React hook for Socket.IO operations
 */
export function useSocket() {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors
  const isConnected = useSelector((state: RootState) => state.socket.connected)
  const subscriptions = useSelector(
    (state: RootState) => state.socket.subscribedConversations
  )
  const error = useSelector((state: RootState) => state.socket.error)
  const creditError = useSelector(
    (state: RootState) => state.socket.creditError
  )

  // Actions
  const connect = useCallback(
    (jwtToken: string) => {
      dispatch(socketConnect(jwtToken))
    },
    [dispatch]
  )

  const disconnect = useCallback(() => {
    dispatch(socketDisconnect())
  }, [dispatch])

  const subscribe = useCallback(
    (conversationId: string, platform = 'DARE') => {
      dispatch(socketSubscribe(conversationId, platform))
    },
    [dispatch]
  )

  const unsubscribe = useCallback(
    (conversationId: string) => {
      dispatch(socketUnsubscribe(conversationId))
    },
    [dispatch]
  )

  const sendMessage = useCallback(
    (conversationId: string, payload: Record<string, unknown>) => {
      dispatch(socketSendMessage(conversationId, payload))
    },
    [dispatch]
  )

  const editMessage = useCallback(
    (conversationId: string, messageId: string, message: string) => {
      dispatch(socketEditMessage(conversationId, messageId, message))
    },
    [dispatch]
  )

  const regenerate = useCallback(
    (
      conversationId: string,
      messageId: string,
      options: Record<string, unknown>
    ) => {
      dispatch(socketRegenerate(conversationId, messageId, options))
    },
    [dispatch]
  )

  const continueArtifact = useCallback(
    (conversationId: string, artifactId: number) => {
      dispatch(socketContinueArtifact(conversationId, artifactId))
    },
    [dispatch]
  )

  const pauseArtifact = useCallback(
    (conversationId: string, artifactId: number) => {
      dispatch(socketPauseArtifact(conversationId, artifactId))
    },
    [dispatch]
  )

  return {
    // State
    isConnected,
    subscriptions,
    error,
    creditError,

    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    editMessage,
    regenerate,
    continueArtifact,
    pauseArtifact,
  }
}

export default useSocket
