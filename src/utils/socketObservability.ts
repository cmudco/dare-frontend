import * as Sentry from '@sentry/react'
import type { DisconnectDescription, Socket } from 'socket.io-client'

export type SocketChannel = 'chat' | 'workflow'

const CAPTURE_COOLDOWN_MS = 60_000
const lastCaptureByKey = new Map<string, number>()

interface SocketContext {
  active?: boolean
  attempt?: number
  closeCode?: number
  reason?: string
  transport?: string
}

export function recordSocketLifecycle(
  channel: SocketChannel,
  state: 'connected' | 'disconnected' | 'reconnect_attempt' | 'reconnected',
  context: SocketContext = {}
) {
  Sentry.addBreadcrumb({
    category: `socket.${channel}`,
    message: state,
    level: state === 'disconnected' ? 'warning' : 'info',
    data: context,
  })
}

export function captureSocketFailure(
  channel: SocketChannel,
  phase: 'connect' | 'reconnect' | 'drop' | 'send' | 'forced_disconnect',
  error: Error,
  context: SocketContext = {}
) {
  const key = `${channel}:${phase}:${error.message}`
  const now = Date.now()
  const lastCapture = lastCaptureByKey.get(key) ?? 0
  if (now - lastCapture < CAPTURE_COOLDOWN_MS) return

  lastCaptureByKey.set(key, now)
  Sentry.captureException(error, {
    tags: {
      socketChannel: channel,
      socketPhase: phase,
    },
    extra: { ...context },
  })
}

const DROP_REASONS: ReadonlySet<Socket.DisconnectReason> = new Set([
  'transport close',
  'transport error',
  'ping timeout',
])

// The WebSocket close code tells a network cut (1006) from a server-side
// close such as a keepalive timeout (1011) or a restart (1001/1012).
export function captureSocketDrop(
  channel: SocketChannel,
  reason: Socket.DisconnectReason,
  details: DisconnectDescription | undefined
) {
  if (!DROP_REASONS.has(reason)) return
  const closeCode =
    details && 'context' in details && details.context instanceof CloseEvent
      ? details.context.code
      : undefined
  const suffix = closeCode === undefined ? '' : ` (close code ${closeCode})`
  captureSocketFailure(
    channel,
    'drop',
    new Error(`${channel} socket dropped: ${reason}${suffix}`),
    { reason, closeCode }
  )
}
