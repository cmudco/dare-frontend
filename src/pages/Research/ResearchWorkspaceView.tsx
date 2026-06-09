import { useCallback, useMemo, useRef, useState } from 'react'
import ContextPanel from './components/ContextPanel'
import OverviewPanel from './components/OverviewPanel'
import ProjectKnowledge from './components/ProjectKnowledge'
import ReviewInbox from './components/ReviewInbox'
import {
  ArtifactsView,
  MemoryView,
  SourcesView,
} from './components/SecondaryViews'
import AskScoutView from './components/AskScoutView'
import HandsOnChat from './components/HandsOnChat'
import RunsView from './components/RunsView'
import WorkspaceShell from './components/WorkspaceShell'
import {
  PROJECT,
  SCOUT_CANDIDATES,
  SEED_KNOWLEDGE,
  SOURCE_FILES,
} from './mockData'
import { WEB_SEARCH_TOOL_SLUG } from '@/utils/constants/research'
import type {
  CriticVerdict,
  KnowledgeItem,
  NavSection,
  ReviewItem,
} from './types'

const DEFAULT_TOOLS: string[] = [WEB_SEARCH_TOOL_SLUG]

interface ResearchWorkspaceViewProps {
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
  /** When provided, the header shows a "back to projects" affordance. */
  onBack?: () => void
}

const criticFor = (item: ReviewItem): CriticVerdict =>
  item.citationSignal === 'disputing'
    ? {
        outcome: 'flag',
        reasoning:
          'This source argues against your thesis. It is worth keeping to engage directly, but do not cite it as support.',
      }
    : item.confidence < 75
      ? {
          outcome: 'flag',
          reasoning:
            'Relevant but adjacent. Confirm it actually bears on your claim before relying on it.',
        }
      : {
          outcome: 'pass',
          reasoning:
            'The cited passage genuinely supports the claim you would use it for. No overstatement detected.',
        }

const ResearchWorkspaceView = ({
  projectTitle,
  projectMeta,
  question = PROJECT.question,
  sourceCount = SOURCE_FILES.length,
  enabledTools = DEFAULT_TOOLS,
  onBack,
}: ResearchWorkspaceViewProps) => {
  const [section, setSection] = useState<NavSection>('overview')
  const [items, setItems] = useState<ReviewItem[]>([])
  const [scoutRunning, setScoutRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pending = useMemo(
    () => items.filter((i) => i.status === 'pending'),
    [items]
  )
  const later = useMemo(
    () => items.filter((i) => i.status === 'later'),
    [items]
  )
  const knowledge: KnowledgeItem[] = useMemo(
    () => [...items.filter((i) => i.status === 'approved'), ...SEED_KNOWLEDGE],
    [items]
  )

  const setStatus = useCallback(
    (id: string, status: ReviewItem['status']) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i))),
    []
  )

  const runScout = useCallback(() => {
    if (scoutRunning) return
    setScoutRunning(true)
    // Simulate Scout doing bounded work, then staging its findings.
    timer.current = setTimeout(() => {
      setItems((prev) => {
        const existing = new Set(prev.map((i) => i.id))
        const fresh = SCOUT_CANDIDATES.filter((c) => !existing.has(c.id)).map(
          (c) => ({ ...c, status: 'pending' as const })
        )
        return [...prev, ...fresh]
      })
      setScoutRunning(false)
    }, 1600)
  }, [scoutRunning])

  const askCritic = useCallback(
    (id: string) =>
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, critic: criticFor(i) } : i))
      ),
    []
  )

  const center = () => {
    switch (section) {
      case 'overview':
        return (
          <OverviewPanel
            question={question}
            sourceCount={sourceCount}
            pendingCount={pending.length}
            approvedCount={knowledge.length}
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
            scoutRunning={scoutRunning}
            pendingCount={pending.length}
            onRunScout={runScout}
            onGoToReview={() => setSection('review')}
          />
        )
      case 'chat':
        return <HandsOnChat />
      case 'review':
        return (
          <ReviewInbox
            pending={pending}
            later={later}
            onApprove={(id) => setStatus(id, 'approved')}
            onReject={(id) => setStatus(id, 'rejected')}
            onLater={(id) => setStatus(id, 'later')}
            onAskCritic={askCritic}
            onGoToOverview={() => setSection('overview')}
          />
        )
      case 'knowledge':
        return <ProjectKnowledge items={knowledge} />
      case 'sources':
        return <SourcesView />
      case 'memory':
        return <MemoryView />
      case 'artifacts':
        return <ArtifactsView />
      case 'runs':
        return <RunsView />
    }
  }

  return (
    <WorkspaceShell
      active={section}
      onNavigate={setSection}
      pendingCount={pending.length}
      approvedCount={knowledge.length}
      center={center()}
      context={<ContextPanel question={question} enabledTools={enabledTools} />}
      projectTitle={projectTitle}
      projectMeta={projectMeta}
      onBack={onBack}
    />
  )
}

export default ResearchWorkspaceView
