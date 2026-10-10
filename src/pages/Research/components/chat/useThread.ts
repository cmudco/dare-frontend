import { useCallback, useEffect, useRef, useState } from 'react'
import { getThreadAPI } from '@/api/research'
import { isRunInFlight } from '@/utils/constants/research'
import type { ThreadDetail } from '@/redux/types/research'

const POLL_MS = 2000

const isLive = (detail: ThreadDetail | null) =>
  !!detail &&
  (detail.activeTurn !== null ||
    detail.scouts.some((scout) => isRunInFlight(scout.status)))

/**
 * One thread's server state. Polls while anything in it is live — Scouts
 * running, a follow-up turn DARE started — and until `watchUntil` (epoch ms),
 * the window after a turn in which Hermes's background reflection may stage a
 * memory proposal. `paused` stops the timer while the scholar's own turn
 * streams; an explicit `reload()` still works then.
 */
export const useThread = (
  threadId: number | null,
  paused: boolean,
  watchUntil: number
) => {
  const [detail, setDetail] = useState<ThreadDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // `reload` must hit the thread that is open NOW, not the one open when the
  // caller's closure was made — a first send creates the thread mid-flight.
  const current = useRef(threadId)
  current.current = threadId

  const reload = useCallback(async () => {
    const id = current.current
    if (!id) return null
    try {
      const next = await getThreadAPI(id)
      if (current.current === id) {
        setDetail(next)
        setError('')
      }
      return next
    } catch {
      setError('Could not load this thread.')
      return null
    }
  }, [])

  useEffect(() => {
    setDetail(null)
    if (!threadId) return
    setLoading(true)
    void reload().finally(() => setLoading(false))
  }, [threadId, reload])

  const live = isLive(detail)
  const [now, setNow] = useState(() => Date.now())
  const watching = now < watchUntil
  useEffect(() => {
    if ((!live && !watching) || paused) return
    const timer = setTimeout(() => {
      setNow(Date.now())
      void reload()
    }, POLL_MS)
    return () => clearTimeout(timer)
  }, [live, watching, paused, detail, reload, watchUntil])

  return { detail, loading, error, reload, live }
}
