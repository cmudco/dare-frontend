import type {
  Project,
  ProjectDraft,
  ProjectUpdate,
  SourceSize,
  SourceSizeRequest,
} from '@/redux/types/project'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export const getProjectsAPI = async (): Promise<Project[]> =>
  baseRequest<Project[]>({ url: 'api/projects/', method: METHOD.GET })

export const createProjectAPI = async (draft: ProjectDraft): Promise<Project> =>
  baseRequest<Project>({
    url: 'api/projects/',
    method: METHOD.POST,
    data: draft,
  })

export const updateProjectAPI = async (
  projectId: number,
  update: ProjectUpdate
): Promise<Project> =>
  baseRequest<Project>({
    url: `api/projects/${projectId}/`,
    method: METHOD.PATCH,
    data: update,
  })

export const getSourceSizeAPI = async (
  request: SourceSizeRequest
): Promise<SourceSize> =>
  baseRequest<SourceSize>({
    url: 'api/projects/source-size/',
    method: METHOD.POST,
    data: request,
  })

// Query params bypass the backend's camelCase parser, so this one is sent snake_case.
export const deleteProjectAPI = async (
  projectId: number,
  deleteConversations: boolean
): Promise<void> =>
  baseRequest<void>({
    url: `api/projects/${projectId}/`,
    method: METHOD.DELETE,
    params: { delete_conversations: deleteConversations },
  })
