import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { getResearchProject } from '@/redux/asyncThunks/research'
import { askCriticAPI, reviewStagingItemAPI } from '@/api/research'
import { WEB_SEARCH_TOOL_SLUG, isRunInFlight } from '@/utils/constants/research'
import { usePolledRun } from './usePolledRun'
import { isNavSection } from './types'
import ContextHub from './components/ContextHub'
import ContextPanel from './components/ContextPanel'
import OverviewPanel from './components/OverviewPanel'
import ReviewInbox from './components/ReviewInbox'
import { ArtifactsView } from './components/SecondaryViews'
import ChatHub from './components/chat/ChatHub'
import LearningView from './components/learning/LearningView'
import VisualizationView from './components/VisualizationView'
import RunsView from './components/runs/RunsView'
import WorkspaceShell from './components/WorkspaceShell'
import type {
  AgentRun,
  KnowledgeItem,
  MemoryProposal,
  NavSection,
  ProjectMemory,
  ResearchArtifact,
  ResearchSource,
  ReviewItem,
  ReviewReasonTag,
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
  question = '',
  sourceCount = 0,
  enabledTools = DEFAULT_TOOLS,
  runs = [],
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
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const section: NavSection = isNavSection(tabParam) ? tabParam : 'overview'
  const threadParam = Number(searchParams.get('thread'))
  const threadId =
    Number.isInteger(threadParam) && threadParam > 0 ? threadParam : null
  const setSection = useCallback(
    (next: NavSection) => setSearchParams({ tab: next }),
    [setSearchParams]
  )
  const openThread = useCallback(
    (id: number) => setSearchParams({ tab: 'chat', thread: String(id) }),
    [setSearchParams]
  )
  const [criticRunId, setCriticRunId] = useState<number | null>(null)
  const [criticItemId, setCriticItemId] = useState<number | null>(null)

  const pending = reviewItems.filter((i) => i.status === 'staged')
  const later = reviewItems.filter((i) => i.status === 'later')

  const refresh = () => {
    if (projectId) dispatch(getResearchProject(projectId))
  }

  // Keep the Runs tab current: refetch whenever it's opened, since a run can
  // settle while the scholar is on another tab.
  useEffect(() => {
    if (section === 'runs') refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  // Every section is one scroll container, so arriving from a long tab (Context
  // especially) left the new one already scrolled past its own heading.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [section])

  // Poll while any run other than the critic (which has its own poller) is in
  // flight — Scouts launched from chat, artifact runs — so the inbox badge,
  // run rows and statuses stay live across tabs (this view stays mounted).
  useEffect(() => {
    const hasOther = runs.some(
      (r) => isRunInFlight(r.status) && r.id !== criticRunId
    )
    if (!hasOther) return
    const timer = setTimeout(refresh, 3000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, criticRunId])

  usePolledRun(
    criticRunId,
    () => refresh(),
    () => {
      setCriticRunId(null)
      setCriticItemId(null)
      refresh()
    }
  )

  const review = async (
    id: number,
    decision: 'approve' | 'reject' | 'later',
    note = '',
    tags: ReviewReasonTag[] = []
  ) => {
    await reviewStagingItemAPI(id, decision, note, tags)
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
            onGoToChat={() => setSection('chat')}
            onGoToReview={() => setSection('review')}
            onGoToRuns={() => setSection('runs')}
          />
        )
      case 'chat':
        return projectId ? (
          <ChatHub
            projectId={projectId}
            soulFile={soulFile}
            threadId={threadId}
            onSelectThread={openThread}
            onGoToReview={() => setSection('review')}
            onWorkspaceChanged={refresh}
          />
        ) : null
      case 'learning':
        return projectId ? (
          <LearningView projectId={projectId} onChanged={refresh} />
        ) : null
      case 'review':
        return (
          <ReviewInbox
            pending={pending}
            later={later}
            criticItemId={criticItemId}
            onDecide={review}
            onLater={(id) => void review(id, 'later')}
            onAskCritic={askCritic}
            onOpenThread={openThread}
            onGoToOverview={() => setSection('overview')}
          />
        )
      case 'memory':
        return (
          <ContextHub
            projectId={projectId}
            knowledgeItems={knowledgeItems}
            rejectedItems={reviewItems.filter((i) => i.status === 'rejected')}
            sources={sources}
            soulFile={soulFile}
            projectMemory={projectMemory}
            memoryProposals={memoryProposals}
            onMemoryDecided={refresh}
          />
        )
      case 'graph':
        return <VisualizationView projectId={projectId} />
      case 'artifacts':
        return (
          <ArtifactsView
            projectId={projectId}
            artifacts={artifacts}
            runs={runs}
          />
        )
      case 'runs':
        return <RunsView runs={runs} projectId={projectId} />
    }
  }

  return (
    <WorkspaceShell
      active={section}
      onNavigate={setSection}
      pendingCount={pending.length}
      approvedCount={knowledgeItems.length}
      memoryPendingCount={memoryProposals.length}
      center={center()}
      context={
        // Only where judging a source needs the question and memory in view;
        // elsewhere it duplicated the Context tab and squeezed the page.
        section !== 'review' ? null : (
          <ContextPanel
            question={question}
            enabledTools={enabledTools}
            soulFile={soulFile}
            projectMemory={projectMemory}
          />
        )
      }
      projectTitle={projectTitle}
      projectMeta={projectMeta}
      onBack={onBack}
    />
  )
}

export default ResearchWorkspaceView
