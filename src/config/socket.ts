// Retries never stop: a deploy restart outlasts any small attempt cap and
// left the socket dead until a page reload.
export const SOCKET_RECONNECT_POLICY = {
  initialDelayMs: 1_000,
  maxDelayMs: 10_000,
} as const
