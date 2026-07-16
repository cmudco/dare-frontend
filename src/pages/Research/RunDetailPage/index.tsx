import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  cancelAgentRun,
  getAgentRun,
  getResearchProject,
} from '@/redux/asyncThunks/research'
import { clearCurrentRun } from '@/redux/researchSlice'
import { isRunInFlight } from '@/utils/constants/research'
import type { AgentRun, NavSection } from '../types'
import RunDetail from '../components/runs/RunDetail'
import WorkspaceShell from '../components/WorkspaceShell'
import ContextPanel from '../components/ContextPanel'

// One run's full details at /research/:projectId/runs/:runId. Rendered inside
// the same workspace shell (header, left nav, right context) as the rest of
// research mode — only the center changes — so it never feels like a separate
// app. Fetches + polls the run through Redux; RunDetail is presentational.
const RunDetailPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId, runId } = useParams<{
    projectId: string
    runId: string
  }>()
  const id = Number(runId)

  const project = useAppSelector((state) =>
    state.research.projects.find((p) => String(p.id) === projectId)
  )
  const run = useAppSelector((state) => state.research.currentRun)
  const [cancelling, setCancelling] = useState(false)

  // Ensure the project (for the shell's header + nav + context) is loaded, even
  // on a direct deep-link to this page.
  useEffect(() => {
    const pid = Number(projectId)
    if (!Number.isNaN(pid)) dispatch(getResearchProject(pid))
  }, [dispatch, projectId])

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

  const goToSection = useCallback(
    (section: NavSection) => navigate(`/research/${projectId}?tab=${section}`),
    [navigate, projectId]
  )
  const backToRuns = useCallback(
    () => navigate(`/research/${projectId}?tab=runs`),
    [navigate, projectId]
  )

  const reviewItems = project?.reviewItems ?? []
  const pendingCount = reviewItems.filter((i) => i.status === 'staged').length
  const approvedCount = project?.knowledgeItems?.length ?? 0
  // Only show a run that matches the URL — never a stale slot from a prior page.
  const showRun = run && run.id === id ? run : null

  return (
    <WorkspaceShell
      active='runs'
      onNavigate={goToSection}
      pendingCount={pendingCount}
      approvedCount={approvedCount}
      projectTitle={project?.title}
      projectMeta={project?.field}
      onBack={() => navigate('/research')}
      context={
        <ContextPanel
          question={project?.question ?? ''}
          enabledTools={project?.enabledTools ?? []}
          soulFile={project?.soulFile ?? null}
          projectMemory={project?.projectMemory ?? []}
        />
      }
      center={
        showRun ? (
          <RunDetail
            run={showRun}
            cancelling={cancelling}
            onBack={backToRuns}
            onCancel={cancel}
          />
        ) : (
          <div className='flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' /> Loading run…
          </div>
        )
      }
    />
  )
}

export default RunDetailPage
