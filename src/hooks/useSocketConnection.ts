/**
 * useSocketConnection - Socket.IO connection management hook
 *
 * Handles socket connection lifecycle based on authentication state.
 * Should be used once at the app root level.
 */

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import {
  socketConnect,
  socketDisconnect,
} from '@/redux/middleware/socketMiddleware'
import { config } from '@/config/environment'

export function useSocketConnection() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user
  )
  const isConnected = useSelector((state: RootState) => state.socket.connected)

  useEffect(() => {
    if (!config.features.enableSocketIO) return

    const token = localStorage.getItem('token')

    // Connect when authenticated and not already connected
    if (isAuthenticated && user && token && !isConnected) {
      dispatch(socketConnect(token))
    }

    // Disconnect when logged out
    if (!isAuthenticated && isConnected) {
      dispatch(socketDisconnect())
    }
  }, [isAuthenticated, user, isConnected, dispatch])
}
