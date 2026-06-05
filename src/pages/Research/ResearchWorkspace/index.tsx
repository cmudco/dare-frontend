import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  approveResearchStagingItem,
  createResearchStagingItem,
  getResearchAgentRuns,
  getResearchKnowledgeItems,
  getResearchMetadata,
  getResearchProjects,
  getResearchSources,
  getResearchSoulFiles,
  getResearchSoulFileVersions,
  getResearchStagingItems,
  markResearchStagingItemLater,
  rejectResearchStagingItem,
  restoreResearchStagingItem,
  selectResearchProjectSoulFile,
  createResearchSoulFile,
  updateResearchSoulFile,
} from '@/redux/asyncThunks/research'
import type {
  ResearchSoulFileDraft,
  ResearchSource,
  ResearchStagingItemDraft,
} from '@/redux/types/research'
import {
  ResearchEvidenceLabel,
  ResearchStagingItemType,
} from '@/utils/constants/research'
import ReviewReasonDialog from '../components/ReviewReasonDialog'
import ResearchWorkspaceView from '../ResearchWorkspaceView'

type ReviewIntent = {
  action: 'reject' | 'later'
  id: number
}

const sourceToStagingDraft = (
  source: ResearchSource
): ResearchStagingItemDraft => ({
  project: source.project,
  source: source.id,
  itemType: ResearchStagingItemType.SOURCE_CANDIDATE,
  title: source.title,
  authors: source.authors,
  venue: source.venue,
  year: source.year,
  url: source.url,
  doi: source.doi,
  content: source.abstract || source.notes || source.citation,
  rationale:
    source.notes ||
    'Manually staged from a project source record for scholar review.',
  confidence: 0,
  confidenceRationale:
    'This source was staged manually and has not been evaluated by an agent.',
  evidenceLabel: ResearchEvidenceLabel.UNVERIFIABLE,
  citationContext: source.citation,
  provenance: {
    tool: 'manual',
    role: 'scholar',
    retrievedAt: new Date().toISOString(),
    retrievalDepth: 'Project source record',
  },
})

// Authenticated, full-canvas workspace for a single research project.
// Reuses the shared workspace view (the same one as the public preview),
// wiring the selected project's title and a back-to-projects action.
const ResearchWorkspace = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId } = useParams<{ projectId: string }>()
  const [reviewIntent, setReviewIntent] = useState<ReviewIntent | null>(null)
  const parsedProjectId = projectId ? Number(projectId) : undefined
  const projectIdNumber =
    typeof parsedProjectId === 'number' && Number.isFinite(parsedProjectId)
      ? parsedProjectId
      : undefined
  const project = useAppSelector((state) =>
    typeof projectIdNumber === 'number'
      ? state.research.projects.find((p) => p.id === projectIdNumber)
      : undefined
  )
  const sources = useAppSelector((state) =>
    typeof projectIdNumber === 'number'
      ? state.research.sources.filter(
          (source) => source.project === projectIdNumber
        )
      : []
  )
  const stagingItems = useAppSelector((state) =>
    typeof projectIdNumber === 'number'
      ? state.research.stagingItems.filter(
          (item) => item.project === projectIdNumber
        )
      : []
  )
  const knowledgeItems = useAppSelector((state) =>
    typeof projectIdNumber === 'number'
      ? state.research.knowledgeItems.filter(
          (item) => item.project === projectIdNumber
        )
      : []
  )
  const agentRuns = useAppSelector((state) =>
    typeof projectIdNumber === 'number'
      ? state.research.agentRuns.filter(
          (run) => run.project === projectIdNumber
        )
      : []
  )
  const soulFiles = useAppSelector((state) => state.research.soulFiles)
  const soulFileVersions = useAppSelector(
    (state) => state.research.soulFileVersions
  )
  const soulFileTemplates = useAppSelector(
    (state) => state.research.metadata?.soulFileTemplates ?? []
  )
  const isSavingSoulFile = useAppSelector(
    (state) => state.research.isSavingSoulFile
  )
  const hasLoadedMetadata = useAppSelector(
    (state) => state.research.metadata !== null
  )
  const isReviewing = useAppSelector((state) => state.research.isReviewing)
  const isLoadingRuns = useAppSelector((state) => state.research.isLoadingRuns)
  const hasLoadedProjects = useAppSelector(
    (state) => state.research.hasLoadedProjects
  )

  useEffect(() => {
    if (!hasLoadedProjects) {
      dispatch(getResearchProjects())
    }
    if (!hasLoadedMetadata) {
      dispatch(getResearchMetadata())
    }
  }, [dispatch, hasLoadedMetadata, hasLoadedProjects])

  useEffect(() => {
    if (typeof projectIdNumber === 'number') {
      dispatch(getResearchSources(projectIdNumber))
      dispatch(getResearchStagingItems(projectIdNumber))
      dispatch(getResearchKnowledgeItems(projectIdNumber))
      dispatch(getResearchAgentRuns(projectIdNumber))
      dispatch(getResearchSoulFiles())
    }
  }, [dispatch, projectIdNumber])

  useEffect(() => {
    if (project?.activeSoulFile) {
      dispatch(getResearchSoulFileVersions(project.activeSoulFile))
    }
  }, [dispatch, project?.activeSoulFile])

  const handleStageSource = useCallback(
    (source: ResearchSource) => {
      dispatch(createResearchStagingItem(sourceToStagingDraft(source)))
    },
    [dispatch]
  )

  const handleApprove = useCallback(
    (id: number) => {
      dispatch(approveResearchStagingItem(id))
    },
    [dispatch]
  )

  const handleRestore = useCallback(
    (id: number) => {
      dispatch(restoreResearchStagingItem(id))
    },
    [dispatch]
  )

  const handleCreateSoulFile = useCallback(
    (draft: ResearchSoulFileDraft) => {
      dispatch(createResearchSoulFile(draft))
    },
    [dispatch]
  )

  const handleUpdateSoulFile = useCallback(
    (id: number, draft: ResearchSoulFileDraft) => {
      dispatch(updateResearchSoulFile({ id, soulFile: draft }))
    },
    [dispatch]
  )

  const handleSelectSoulFile = useCallback(
    (soulFileId: number) => {
      if (typeof projectIdNumber !== 'number') return
      dispatch(
        selectResearchProjectSoulFile({
          projectId: projectIdNumber,
          soulFileId,
        })
      )
    },
    [dispatch, projectIdNumber]
  )

  const handleLoadSoulFileVersions = useCallback(
    (soulFileId: number) => {
      dispatch(getResearchSoulFileVersions(soulFileId))
    },
    [dispatch]
  )

  const handleRefreshAgentRuns = useCallback(() => {
    if (typeof projectIdNumber !== 'number') return
    dispatch(getResearchAgentRuns(projectIdNumber))
  }, [dispatch, projectIdNumber])

  const handleReasonConfirm = (reason: string) => {
    if (!reviewIntent) return

    if (reviewIntent.action === 'reject') {
      dispatch(rejectResearchStagingItem({ id: reviewIntent.id, reason }))
    } else {
      dispatch(markResearchStagingItemLater({ id: reviewIntent.id, reason }))
    }
    setReviewIntent(null)
  }

  const reasonDialogCopy =
    reviewIntent?.action === 'reject'
      ? {
          title: 'Reject staged item',
          description:
            'The reason stays attached to the rejected item so the review trail remains auditable.',
          confirmLabel: 'Reject item',
        }
      : {
          title: 'Save staged item for later',
          description:
            'The reason stays attached to the later queue and can be restored to pending review.',
          confirmLabel: 'Save for later',
        }

  return (
    <>
      <ResearchWorkspaceView
        projectTitle={project?.title}
        projectMeta={project?.field}
        projectQuestion={project?.question}
        pendingReviewCount={project?.pendingReviewCount ?? 0}
        approvedCount={project?.approvedCount ?? 0}
        sourceCount={project?.sourceCount ?? sources.length}
        enabledTools={project?.enabledTools}
        project={project}
        sources={sources}
        stagingItems={stagingItems}
        knowledgeItems={knowledgeItems}
        agentRuns={agentRuns}
        soulFiles={soulFiles}
        soulFileVersions={soulFileVersions}
        soulFileTemplates={soulFileTemplates}
        isReviewing={isReviewing}
        isLoadingRuns={isLoadingRuns}
        isSavingSoulFile={isSavingSoulFile}
        onStageSource={handleStageSource}
        onRefreshAgentRuns={handleRefreshAgentRuns}
        onApproveStagingItem={handleApprove}
        onRejectStagingItem={(id) => setReviewIntent({ action: 'reject', id })}
        onMarkStagingItemLater={(id) =>
          setReviewIntent({ action: 'later', id })
        }
        onRestoreStagingItem={handleRestore}
        onCreateSoulFile={handleCreateSoulFile}
        onUpdateSoulFile={handleUpdateSoulFile}
        onSelectSoulFile={handleSelectSoulFile}
        onLoadSoulFileVersions={handleLoadSoulFileVersions}
        onBack={() => navigate('/research')}
      />
      <ReviewReasonDialog
        open={reviewIntent !== null}
        title={reasonDialogCopy.title}
        description={reasonDialogCopy.description}
        confirmLabel={reasonDialogCopy.confirmLabel}
        isSubmitting={isReviewing}
        onOpenChange={(open) => {
          if (!open) {
            setReviewIntent(null)
          }
        }}
        onConfirm={handleReasonConfirm}
      />
    </>
  )
}

export default ResearchWorkspace
