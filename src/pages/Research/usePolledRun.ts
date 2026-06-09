import { useEffect } from 'react'
import { getAgentRunAPI } from '@/api/research'

/**
 * Poll a single agent run until it settles, then call onSettled.
 *
 * Passing a null runId disables polling. Any error (e.g. a deleted/unreachable
 * run) is treated as settled so the caller can resync rather than spin forever.
 * Scout and Critic share this one poller.
 */
export const usePolledRun = (
  runId: number | null,
  onStatus: (detail: string) => void,
  onSettled: () => void
) => {
  useEffect(() => {
    if (!runId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const tick = async () => {
      try {
        const run = await getAgentRunAPI(runId)
        if (cancelled) return
        onStatus(run.statusDetail || '')
        if (run.status === 'completed' || run.status === 'failed') {
          onSettled()
          return
        }
      } catch {
        if (cancelled) return
        onSettled()
        return
      }
      if (!cancelled) timer = setTimeout(tick, 3000)
    }

    timer = setTimeout(tick, 1500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])
}
