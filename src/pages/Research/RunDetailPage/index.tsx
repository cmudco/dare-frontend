import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { cancelAgentRun, getAgentRun } from '@/redux/asyncThunks/research'
import { clearCurrentRun } from '@/redux/researchSlice'
import { isRunInFlight } from '@/utils/constants/research'
import type { AgentRun } from '../types'
import RunDetail from '../components/runs/RunDetail'

// Dedicated page for one run's full details, at
// /research/:projectId/runs/:runId. Fetches + polls the run through Redux
// (state.research.currentRun) while it is in flight, and owns the cancel action;
// RunDetail is presentational.
const RunDetailPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId, runId } = useParams<{
    projectId: string
    runId: string
  }>()
  const id = Number(runId)

  const run = useAppSelector((state) => state.research.currentRun)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (Number.isNaN(id)) return
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      const result = await dispatch(getAgentRun(id))
      if (!alive) return
      const fresh = result.payload as AgentRun | undefined
      if (fresh && isRunInFlight(fresh.status)) timer = setTimeout(tick, 3000)
    }
    tick()
    return () => {
      alive = false
      clearTimeout(timer)
      dispatch(clearCurrentRun())
    }
  }, [id, dispatch])

  const cancel = useCallback(async () => {
    setCancelling(true)
    try {
      await dispatch(cancelAgentRun(id))
    } finally {
      setCancelling(false)
    }
  }, [dispatch, id])

  const back = useCallback(
    () => navigate(`/research/${projectId}?tab=runs`),
    [navigate, projectId]
  )

  // Only show a run that matches the URL — never a stale slot from a prior page.
  const showRun = run && run.id === id ? run : null

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      {showRun ? (
        <RunDetail
          run={showRun}
          cancelling={cancelling}
          onBack={back}
          onCancel={cancel}
        />
      ) : (
        <div className='flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' /> Loading run…
        </div>
      )}
    </div>
  )
}

export default RunDetailPage
