/**
 * useSocketSubscription - Socket.IO conversation subscription hook
 *
 * Handles subscribing/unsubscribing to conversation rooms.
 * Automatically manages subscription lifecycle when conversation changes.
 */

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import {
  socketSubscribe,
  socketUnsubscribe,
} from '@/redux/middleware/socketMiddleware'

export function useSocketSubscription(conversationId: string | undefined) {
  const dispatch = useDispatch<AppDispatch>()
  const isConnected = useSelector((state: RootState) => state.socket.connected)
  const previousIdRef = useRef<string | null>(null)

  useEffect(() => {
    const previousId = previousIdRef.current

    // Unsubscribe from previous conversation
    if (previousId && previousId !== conversationId) {
      dispatch(socketUnsubscribe(previousId))
    }

    // Subscribe to new conversation
    if (conversationId && isConnected) {
      dispatch(socketSubscribe(conversationId))
    }

    previousIdRef.current = conversationId ?? null
  }, [conversationId, isConnected, dispatch])
}
