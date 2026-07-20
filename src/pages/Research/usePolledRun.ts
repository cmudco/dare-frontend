import { useEffect } from 'react'
import { getAgentRunAPI } from '@/api/research'
import { isRunSettled } from '@/utils/constants/research'

/**
 * Poll a single agent run until it settles, then call onSettled.
 *
 * "Settled" means the run is no longer in flight — a real outcome
 * (completed/failed/cancelled), an honest unknown (outcome_unknown), or any
 * status we don't explicitly recognize. `stopping`/`waiting_for_approval` are
 * still in flight and keep polling. Passing a null runId disables polling. Any
 * error (e.g. a deleted/unreachable run) is treated as settled so the caller
 * can resync rather than spin forever. Scout and Critic share this one poller.
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
        if (isRunSettled(run.status)) {
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
