import * as Sentry from '@sentry/react'
import type { DisconnectDescription } from 'socket.io-client'

export type SocketChannel = 'chat' | 'workflow'

const CAPTURE_COOLDOWN_MS = 60_000
// ~90s of failed retries; a sleeping laptop or frozen tab makes no attempts.
const STILL_DOWN_AFTER_ATTEMPTS = 12
const lastCaptureByKey = new Map<string, number>()

interface SocketContext {
  active?: boolean
  attempt?: number
  closeCode?: number
  error?: string
  reason?: string
  transport?: string
}

export function recordSocketLifecycle(
  channel: SocketChannel,
  state:
    | 'connected'
    | 'disconnected'
    | 'connect_error'
    | 'reconnect_attempt'
    | 'reconnect_error'
    | 'reconnected',
  context: SocketContext = {}
) {
  Sentry.addBreadcrumb({
    category: `socket.${channel}`,
    message: state,
    level:
      state === 'connected' || state === 'reconnected' ? 'info' : 'warning',
    data: context,
  })
}

// The WebSocket close code tells a network cut (1006) from a server-side
// close such as a keepalive timeout (1011) or a restart (1001/1012).
export function closeCodeOf(details: DisconnectDescription | undefined) {
  return details &&
    'context' in details &&
    details.context instanceof CloseEvent
    ? details.context.code
    : undefined
}

export function captureSocketStillDown(
  channel: SocketChannel,
  attempt: number
) {
  if (attempt !== STILL_DOWN_AFTER_ATTEMPTS) return
  captureSocketFailure(
    channel,
    'reconnect',
    new Error(
      `${channel} socket still down after ${attempt} reconnect attempts`
    ),
    { attempt }
  )
}

export function captureSocketFailure(
  channel: SocketChannel,
  phase: 'connect' | 'reconnect' | 'send' | 'forced_disconnect',
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
