/**
 * useSocketConnection - Socket.IO connection management hook
 *
 * Manages BOTH chat and workflow socket connections at the app root level.
 * Should be used once at the app root level.
 */

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import {
  socketConnect,
  socketDisconnect,
} from '@/redux/middleware/socketMiddleware'
import {
  workflowSocketConnect,
  workflowSocketDisconnect,
} from '@/redux/middleware/workflowSocketMiddleware'
import { config } from '@/config/environment'

export function useSocketConnection() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user
  )
  const chatConnected = useSelector(
    (state: RootState) => state.socket.connected
  )
  const workflowStatus = useSelector(
    (state: RootState) => state.workflowBuilder.builder.wsConnectionStatus
  )

  useEffect(() => {
    if (!config.features.enableSocketIO) return

    const token = localStorage.getItem('token')

    if (isAuthenticated && user && token) {
      if (!chatConnected) dispatch(socketConnect(token))
      if (workflowStatus === 'disconnected')
        dispatch(workflowSocketConnect({ jwtToken: token }))
    }

    if (!isAuthenticated) {
      if (chatConnected) dispatch(socketDisconnect())
      if (workflowStatus !== 'disconnected')
        dispatch(workflowSocketDisconnect())
    }
  }, [isAuthenticated, user, chatConnected, workflowStatus, dispatch])
}
