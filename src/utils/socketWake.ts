interface WakeableSocket {
  readonly active: boolean
  readonly connected: boolean
  connect(): unknown
  disconnect(): unknown
}

// Skips the backoff wait when the laptop wakes, the network returns or the
// tab is shown. Restarting is only safe because each socket owns its
// connection (`multiplex: false`); on a shared one it would cut the others.
export function reconnectOnWake(socket: WakeableSocket): () => void {
  const reconnectNow = () => {
    if (document.visibilityState !== 'visible') return
    if (!socket.active || socket.connected) return
    socket.disconnect()
    socket.connect()
  }

  window.addEventListener('online', reconnectNow)
  window.addEventListener('focus', reconnectNow)
  document.addEventListener('visibilitychange', reconnectNow)

  return () => {
    window.removeEventListener('online', reconnectNow)
    window.removeEventListener('focus', reconnectNow)
    document.removeEventListener('visibilitychange', reconnectNow)
  }
}
