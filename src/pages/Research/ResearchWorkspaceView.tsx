import { useMemo, useState } from 'react'
import ContextPanel from './components/ContextPanel'
import OverviewPanel from './components/OverviewPanel'
import ProjectKnowledge from './components/ProjectKnowledge'
import ReviewInbox from './components/ReviewInbox'
import RunLogsView from './components/RunLogsView'
import { ArtifactsView, SourcesView } from './components/SecondaryViews'
import SoulFilesView from './components/SoulFilesView'
import WorkspaceShell from './components/WorkspaceShell'
import {
  ResearchAgentRunStatus,
  ResearchReviewStatus,
  ResearchTool,
} from '@/utils/constants/research'
import type {
  ResearchAgentRun,
  ResearchKnowledgeItem,
  ResearchProject,
  ResearchSoulFile,
  ResearchSoulFileDraft,
  ResearchSoulFileTemplateMetadata,
  ResearchSoulFileVersion,
  ResearchSource,
  ResearchStagingItem,
} from '@/redux/types/research'
import type { NavSection } from './types'

const DEFAULT_TOOLS: ResearchTool[] = [
  ResearchTool.PUBMED,
  ResearchTool.SCITE,
  ResearchTool.CONSENSUS,
]

interface ResearchWorkspaceViewProps {
  /** Title shown in the workspace header (defaults to the mock project). */
  projectTitle?: string
  /** Secondary line under the title (e.g. the field of study). */
  projectMeta?: string
  /** The project's current research question. */
  projectQuestion?: string
  pendingReviewCount?: number
  approvedCount?: number
  sourceCount?: number
  /** Tools the Scout composer offers (defaults to the demo set). */
  enabledTools?: ResearchTool[]
  sources?: ResearchSource[]
  stagingItems?: ResearchStagingItem[]
  knowledgeItems?: ResearchKnowledgeItem[]
  agentRuns?: ResearchAgentRun[]
  soulFiles?: ResearchSoulFile[]
  soulFileVersions?: ResearchSoulFileVersion[]
  soulFileTemplates?: ResearchSoulFileTemplateMetadata[]
  project?: ResearchProject
  isReviewing?: boolean
  isLoadingRuns?: boolean
  isSavingSoulFile?: boolean
  onStageSource?: (source: ResearchSource) => void
  onRefreshAgentRuns?: () => void
  onApproveStagingItem?: (id: number) => void
  onRejectStagingItem?: (id: number) => void
  onMarkStagingItemLater?: (id: number) => void
  onRestoreStagingItem?: (id: number) => void
  onCreateSoulFile?: (draft: ResearchSoulFileDraft) => void
  onUpdateSoulFile?: (id: number, draft: ResearchSoulFileDraft) => void
  onSelectSoulFile?: (soulFileId: number) => void
  onLoadSoulFileVersions?: (soulFileId: number) => void
  /** When provided, the header shows a "back to projects" affordance. */
  onBack?: () => void
}

const ResearchWorkspaceView = ({
  projectTitle,
  projectMeta,
  projectQuestion,
  pendingReviewCount = 0,
  approvedCount = 0,
  sourceCount = 0,
  enabledTools = DEFAULT_TOOLS,
  sources = [],
  stagingItems = [],
  knowledgeItems = [],
  agentRuns = [],
  soulFiles = [],
  soulFileVersions = [],
  soulFileTemplates = [],
  project,
  isReviewing = false,
  isLoadingRuns = false,
  isSavingSoulFile = false,
  onStageSource,
  onRefreshAgentRuns,
  onApproveStagingItem,
  onRejectStagingItem,
  onMarkStagingItemLater,
  onRestoreStagingItem,
  onCreateSoulFile,
  onUpdateSoulFile,
  onSelectSoulFile,
  onLoadSoulFileVersions,
  onBack,
}: ResearchWorkspaceViewProps) => {
  const [section, setSection] = useState<NavSection>('overview')
  const pending = useMemo(
    () =>
      stagingItems.filter(
        (item) => item.status === ResearchReviewStatus.PENDING
      ),
    [stagingItems]
  )
  const later = useMemo(
    () =>
      stagingItems.filter((item) => item.status === ResearchReviewStatus.LATER),
    [stagingItems]
  )
  const rejected = useMemo(
    () =>
      stagingItems.filter(
        (item) => item.status === ResearchReviewStatus.REJECTED
      ),
    [stagingItems]
  )
  const stagedSourceIds = useMemo(
    () =>
      new Set(
        stagingItems
          .map((item) => item.source)
          .filter((sourceId): sourceId is number => sourceId !== null)
      ),
    [stagingItems]
  )
  const activeRunCount = useMemo(
    () =>
      agentRuns.filter(
        (run) =>
          run.status === ResearchAgentRunStatus.QUEUED ||
          run.status === ResearchAgentRunStatus.RUNNING
      ).length,
    [agentRuns]
  )

  const center = () => {
    switch (section) {
      case 'overview':
        return (
          <OverviewPanel
            projectQuestion={projectQuestion}
            scoutRunning={false}
            pendingCount={pendingReviewCount}
            approvedCount={approvedCount}
            tools={enabledTools}
            isScoutAvailable={false}
            onRunScout={() => undefined}
            onGoToReview={() => setSection('review')}
          />
        )
      case 'review':
        return (
          <ReviewInbox
            pending={pending}
            later={later}
            rejected={rejected}
            onApprove={onApproveStagingItem ?? (() => undefined)}
            onReject={onRejectStagingItem ?? (() => undefined)}
            onLater={onMarkStagingItemLater ?? (() => undefined)}
            onRestore={onRestoreStagingItem ?? (() => undefined)}
            onGoToOverview={() => setSection('overview')}
          />
        )
      case 'knowledge':
        return <ProjectKnowledge items={knowledgeItems} />
      case 'sources':
        return (
          <SourcesView
            sources={sources}
            stagedSourceIds={stagedSourceIds}
            isReviewing={isReviewing}
            onStageSource={onStageSource}
          />
        )
      case 'runs':
        return (
          <RunLogsView
            runs={agentRuns}
            isLoading={isLoadingRuns}
            onRefresh={onRefreshAgentRuns}
          />
        )
      case 'memory':
        return (
          <SoulFilesView
            project={project}
            soulFiles={soulFiles}
            soulFileVersions={soulFileVersions}
            templates={soulFileTemplates}
            isSaving={isSavingSoulFile}
            onCreate={onCreateSoulFile ?? (() => undefined)}
            onUpdate={onUpdateSoulFile ?? (() => undefined)}
            onSelect={onSelectSoulFile ?? (() => undefined)}
            onLoadVersions={onLoadSoulFileVersions ?? (() => undefined)}
          />
        )
      case 'artifacts':
        return <ArtifactsView />
    }
  }

  return (
    <WorkspaceShell
      active={section}
      onNavigate={setSection}
      pendingCount={pendingReviewCount}
      approvedCount={approvedCount}
      activeRunCount={activeRunCount}
      center={center()}
      context={
        <ContextPanel
          projectQuestion={projectQuestion}
          enabledTools={enabledTools}
          sourceCount={sourceCount}
          activeSoulFileTitle={project?.activeSoulFileTitle}
          activeSoulFileVersionNumber={project?.activeSoulFileVersionNumber}
        />
      }
      projectTitle={projectTitle}
      projectMeta={projectMeta}
      onBack={onBack}
    />
  )
}

export default ResearchWorkspaceView
