import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type {
  ResearchAgentRun,
  ResearchAgentRunDraft,
  PaginatedResearchResponse,
  ResearchMetadata,
  ResearchKnowledgeItem,
  ResearchProject,
  ResearchProjectPayload,
  ResearchReviewResponse,
  ResearchSoulFile,
  ResearchSoulFileDraft,
  ResearchSoulFileVersion,
  ResearchSource,
  ResearchSourceDraft,
  ResearchStagingItem,
  ResearchStagingItemDraft,
} from '@/redux/types/research'
import { ResearchReviewStatus } from '@/utils/constants/research'

export const getResearchMetadataAPI = async (): Promise<ResearchMetadata> => {
  return await baseRequest<ResearchMetadata>({
    url: 'api/research/metadata/',
    method: METHOD.GET,
  })
}

export const getResearchProjectsAPI = async (): Promise<
  PaginatedResearchResponse<ResearchProject>
> => {
  return await baseRequest<PaginatedResearchResponse<ResearchProject>>({
    url: 'api/research/projects/',
    method: METHOD.GET,
  })
}

export const getResearchProjectAPI = async (
  id: number
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${id}/`,
    method: METHOD.GET,
  })
}

export const createResearchProjectAPI = async (
  project: ResearchProjectPayload
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: 'api/research/projects/',
    method: METHOD.POST,
    data: project,
  })
}

export const updateResearchProjectAPI = async (
  id: number,
  project: Partial<ResearchProjectPayload>
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${id}/`,
    method: METHOD.PATCH,
    data: project,
  })
}

export const archiveResearchProjectAPI = async (
  id: number
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${id}/archive/`,
    method: METHOD.POST,
  })
}

export const restoreResearchProjectAPI = async (
  id: number
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${id}/restore/`,
    method: METHOD.POST,
  })
}

export const selectResearchProjectSoulFileAPI = async (
  projectId: number,
  soulFileId: number
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${projectId}/select-soul-file/`,
    method: METHOD.POST,
    data: { soulFile: soulFileId },
  })
}

export const deleteResearchProjectAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/research/projects/${id}/`,
    method: METHOD.DELETE,
  })
}

export const getResearchSoulFilesAPI = async (): Promise<
  PaginatedResearchResponse<ResearchSoulFile>
> => {
  return await baseRequest<PaginatedResearchResponse<ResearchSoulFile>>({
    url: 'api/research/soul-files/',
    method: METHOD.GET,
  })
}

export const createResearchSoulFileAPI = async (
  soulFile: ResearchSoulFileDraft
): Promise<ResearchSoulFile> => {
  return await baseRequest<ResearchSoulFile>({
    url: 'api/research/soul-files/',
    method: METHOD.POST,
    data: soulFile,
  })
}

export const updateResearchSoulFileAPI = async (
  id: number,
  soulFile: ResearchSoulFileDraft
): Promise<ResearchSoulFile> => {
  return await baseRequest<ResearchSoulFile>({
    url: `api/research/soul-files/${id}/`,
    method: METHOD.PATCH,
    data: soulFile,
  })
}

export const getResearchSoulFileVersionsAPI = async (
  soulFileId: number
): Promise<PaginatedResearchResponse<ResearchSoulFileVersion>> => {
  return await baseRequest<PaginatedResearchResponse<ResearchSoulFileVersion>>({
    url: 'api/research/soul-file-versions/',
    method: METHOD.GET,
    params: { soulFile: soulFileId },
  })
}

export const getResearchSourcesAPI = async (
  projectId: number
): Promise<PaginatedResearchResponse<ResearchSource>> => {
  return await baseRequest<PaginatedResearchResponse<ResearchSource>>({
    url: 'api/research/sources/',
    method: METHOD.GET,
    params: { project: projectId },
  })
}

export const createResearchSourceAPI = async (
  projectId: number,
  source: ResearchSourceDraft
): Promise<ResearchSource> => {
  return await baseRequest<ResearchSource>({
    url: 'api/research/sources/',
    method: METHOD.POST,
    data: {
      ...source,
      project: projectId,
    },
  })
}

export const deleteResearchSourceAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/research/sources/${id}/`,
    method: METHOD.DELETE,
  })
}

export const getResearchStagingItemsAPI = async (
  projectId: number,
  status?: ResearchReviewStatus
): Promise<PaginatedResearchResponse<ResearchStagingItem>> => {
  return await baseRequest<PaginatedResearchResponse<ResearchStagingItem>>({
    url: 'api/research/staging-items/',
    method: METHOD.GET,
    params: {
      project: projectId,
      ...(status ? { status } : {}),
    },
  })
}

export const createResearchStagingItemAPI = async (
  item: ResearchStagingItemDraft
): Promise<ResearchStagingItem> => {
  return await baseRequest<ResearchStagingItem>({
    url: 'api/research/staging-items/',
    method: METHOD.POST,
    data: item,
  })
}

export const approveResearchStagingItemAPI = async (
  id: number
): Promise<ResearchReviewResponse> => {
  return await baseRequest<ResearchReviewResponse>({
    url: `api/research/staging-items/${id}/approve/`,
    method: METHOD.POST,
  })
}

export const rejectResearchStagingItemAPI = async (
  id: number,
  reason: string
): Promise<ResearchStagingItem> => {
  return await baseRequest<ResearchStagingItem>({
    url: `api/research/staging-items/${id}/reject/`,
    method: METHOD.POST,
    data: { reason },
  })
}

export const markResearchStagingItemLaterAPI = async (
  id: number,
  reason: string
): Promise<ResearchStagingItem> => {
  return await baseRequest<ResearchStagingItem>({
    url: `api/research/staging-items/${id}/later/`,
    method: METHOD.POST,
    data: { reason },
  })
}

export const restoreResearchStagingItemAPI = async (
  id: number
): Promise<ResearchStagingItem> => {
  return await baseRequest<ResearchStagingItem>({
    url: `api/research/staging-items/${id}/restore/`,
    method: METHOD.POST,
  })
}

export const getResearchAgentRunsAPI = async (
  projectId: number
): Promise<PaginatedResearchResponse<ResearchAgentRun>> => {
  return await baseRequest<PaginatedResearchResponse<ResearchAgentRun>>({
    url: 'api/research/agent-runs/',
    method: METHOD.GET,
    params: { project: projectId },
  })
}

export const getResearchAgentRunAPI = async (
  id: number
): Promise<ResearchAgentRun> => {
  return await baseRequest<ResearchAgentRun>({
    url: `api/research/agent-runs/${id}/`,
    method: METHOD.GET,
  })
}

export const createResearchAgentRunAPI = async (
  run: ResearchAgentRunDraft
): Promise<ResearchAgentRun> => {
  return await baseRequest<ResearchAgentRun>({
    url: 'api/research/agent-runs/',
    method: METHOD.POST,
    data: run,
  })
}

export const cancelResearchAgentRunAPI = async (
  id: number
): Promise<ResearchAgentRun> => {
  return await baseRequest<ResearchAgentRun>({
    url: `api/research/agent-runs/${id}/cancel/`,
    method: METHOD.POST,
  })
}

export const getResearchKnowledgeItemsAPI = async (
  projectId: number
): Promise<PaginatedResearchResponse<ResearchKnowledgeItem>> => {
  return await baseRequest<PaginatedResearchResponse<ResearchKnowledgeItem>>({
    url: 'api/research/knowledge-items/',
    method: METHOD.GET,
    params: { project: projectId },
  })
}
