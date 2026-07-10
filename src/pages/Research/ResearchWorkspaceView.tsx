import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { getResearchProject } from '@/redux/asyncThunks/research'
import { askCriticAPI, reviewStagingItemAPI, runScoutAPI } from '@/api/research'
import { WEB_SEARCH_TOOL_SLUG } from '@/utils/constants/research'
import { usePolledRun } from './usePolledRun'
import ContextHub from './components/ContextHub'
import ContextPanel from './components/ContextPanel'
import OverviewPanel from './components/OverviewPanel'
import ReviewInbox from './components/ReviewInbox'
import { ArtifactsView } from './components/SecondaryViews'
import AskScoutView from './components/AskScoutView'
import HandsOnChat from './components/HandsOnChat'
import VisualizationView from './components/VisualizationView'
import RunsView from './components/RunsView'
import WorkspaceShell from './components/WorkspaceShell'
import { AGENT_RUNS, PROJECT } from './mockData'
import type {
  AgentRun,
  KnowledgeItem,
  MemoryProposal,
  NavSection,
  ProjectMemory,
  ResearchArtifact,
  ResearchSource,
  ReviewItem,
  SoulFile,
} from './types'

const DEFAULT_TOOLS: string[] = [WEB_SEARCH_TOOL_SLUG]

interface ResearchWorkspaceViewProps {
  /** The project's id (enables backend-backed views like chat and scout). */
  projectId?: number
  /** Title shown in the workspace header (defaults to the mock project). */
  projectTitle?: string
  /** Secondary line under the title (e.g. the field of study). */
  projectMeta?: string
  /** The project's research question (defaults to the mock project). */
  question?: string
  /** Number of sources in the project's library. */
  sourceCount?: number
  /** Tool slugs the Scout composer offers (defaults to the web built-in). */
  enabledTools?: string[]
  /** Agent runs for this project (defaults to the mock preview runs). */
  runs?: AgentRun[]
  /** Sources in the project's library. */
  sources?: ResearchSource[]
  /** The project's active soul file (standards), or null if none. */
  soulFile?: SoulFile | null
  /** Durable project-memory snapshots. */
  projectMemory?: ProjectMemory[]
  /** Pending agent memory proposals. */
  memoryProposals?: MemoryProposal[]
  /** Staged review candidates. */
  reviewItems?: ReviewItem[]
  /** Approved durable knowledge. */
  knowledgeItems?: KnowledgeItem[]
  /** Generated artifacts. */
  artifacts?: ResearchArtifact[]
  /** When provided, the header shows a "back to projects" affordance. */
  onBack?: () => void
}

const ResearchWorkspaceView = ({
  projectId,
  projectTitle,
  projectMeta,
  question = PROJECT.question,
  sourceCount = 0,
  enabledTools = DEFAULT_TOOLS,
  runs = AGENT_RUNS,
  sources = [],
  soulFile = null,
  projectMemory = [],
  memoryProposals = [],
  reviewItems = [],
  knowledgeItems = [],
  artifacts = [],
  onBack,
}: ResearchWorkspaceViewProps) => {
  const dispatch = useAppDispatch()
  const [section, setSection] = useState<NavSection>('overview')
  const [runningRunId, setRunningRunId] = useState<number | null>(null)
  const [scoutStatus, setScoutStatus] = useState('')
  const [criticRunId, setCriticRunId] = useState<number | null>(null)
  const [criticItemId, setCriticItemId] = useState<number | null>(null)

  const pending = reviewItems.filter((i) => i.status === 'staged')
  const later = reviewItems.filter((i) => i.status === 'later')

  const refresh = () => {
    if (projectId) dispatch(getResearchProject(projectId))
  }

  // Adopt an in-flight Scout run from server state, so the running indicator
  // survives leaving the page and full reloads (the run lives on the backend).
  useEffect(() => {
    if (runningRunId) return
    const live = runs.find(
      (r) =>
        r.role === 'scout' &&
        ['queued', 'started', 'running'].includes(r.status)
    )
    if (live) {
      setRunningRunId(live.id)
      setScoutStatus(live.statusDetail || '')
    }
  }, [runs, runningRunId])

  // Poll the live run and refetch the project each tick, so the run and its live
  // status show across every tab (Recent runs, Overview, Runs) — not only here.
  usePolledRun(
    runningRunId,
    (detail) => {
      setScoutStatus(detail)
      refresh()
    },
    () => {
      setRunningRunId(null)
      setScoutStatus('')
      refresh()
    }
  )

  usePolledRun(
    criticRunId,
    () => refresh(),
    () => {
      setCriticRunId(null)
      setCriticItemId(null)
      refresh()
    }
  )

  const scoutRunning = runningRunId !== null

  const runScout = async (
    query: string,
    depth: 'quick' | 'deep' = 'deep',
    tools?: string[]
  ) => {
    if (!projectId || !query || runningRunId) return
    setSection('scout')
    try {
      const { runId } = await runScoutAPI(projectId, query, depth, tools)
      setRunningRunId(runId)
      setScoutStatus('Queued…')
      refresh() // surface the run immediately — no manual reload
    } catch {
      // leaving runningRunId null keeps the composer ready to retry
    }
  }

  const review = async (
    id: number,
    decision: 'approve' | 'reject' | 'later'
  ) => {
    await reviewStagingItemAPI(id, decision)
    refresh()
  }

  const askCritic = async (itemId: number) => {
    if (criticRunId) return
    setCriticItemId(itemId)
    try {
      const { runId } = await askCriticAPI(itemId)
      setCriticRunId(runId)
      refresh() // surface the critic run immediately
    } catch {
      setCriticItemId(null)
    }
  }

  const center = () => {
    switch (section) {
      case 'overview':
        return (
          <OverviewPanel
            question={question}
            sourceCount={sourceCount}
            runs={runs}
            pendingCount={pending.length}
            approvedCount={knowledgeItems.length}
            onGoToScout={() => setSection('scout')}
            onGoToChat={() => setSection('chat')}
            onGoToReview={() => setSection('review')}
            onGoToRuns={() => setSection('runs')}
          />
        )
      case 'scout':
        return (
          <AskScoutView
            tools={enabledTools}
            runs={runs}
            scoutRunning={scoutRunning}
            scoutStatus={scoutStatus}
            pendingCount={pending.length}
            onRunScout={runScout}
            onGoToReview={() => setSection('review')}
          />
        )
      case 'chat':
        return <HandsOnChat projectId={projectId} soulFile={soulFile} />
      case 'review':
        return (
          <ReviewInbox
            pending={pending}
            later={later}
            criticItemId={criticItemId}
            onApprove={(id) => review(id, 'approve')}
            onReject={(id) => review(id, 'reject')}
            onLater={(id) => review(id, 'later')}
            onAskCritic={askCritic}
            onGoToOverview={() => setSection('overview')}
          />
        )
      case 'memory':
        return (
          <ContextHub
            knowledgeItems={knowledgeItems}
            sources={sources}
            soulFile={soulFile}
            projectMemory={projectMemory}
            memoryProposals={memoryProposals}
          />
        )
      case 'graph':
        return <VisualizationView projectId={projectId} />
      case 'artifacts':
        return <ArtifactsView projectId={projectId} artifacts={artifacts} />
      case 'runs':
        return <RunsView runs={runs} />
    }
  }

  return (
    <WorkspaceShell
      active={section}
      onNavigate={setSection}
      pendingCount={pending.length}
      approvedCount={knowledgeItems.length}
      center={center()}
      context={
        <ContextPanel
          question={question}
          enabledTools={enabledTools}
          soulFile={soulFile}
          projectMemory={projectMemory}
        />
      }
      projectTitle={projectTitle}
      projectMeta={projectMeta}
      onBack={onBack}
    />
  )
}

export default ResearchWorkspaceView
