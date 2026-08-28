export const SOCKET_RECONNECT_POLICY = {
  maxAttempts: 2,
  initialDelayMs: 1_000,
  maxDelayMs: 2_000,
} as const
