import * as Sentry from '@sentry/react'

export type SocketChannel = 'chat' | 'workflow'

const CAPTURE_COOLDOWN_MS = 60_000
const lastCaptureByKey = new Map<string, number>()

interface SocketContext {
  active?: boolean
  attempt?: number
  reason?: string
  transport?: string
}

export function recordSocketLifecycle(
  channel: SocketChannel,
  state:
    | 'connected'
    | 'disconnected'
    | 'reconnect_attempt'
    | 'reconnected'
    | 'reconnect_exhausted',
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
  phase:
    | 'connect'
    | 'reconnect'
    | 'reconnect_exhausted'
    | 'send'
    | 'forced_disconnect',
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
