import type {
  Project,
  ProjectDraft,
  ProjectUpdate,
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
