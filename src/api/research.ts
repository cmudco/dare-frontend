import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type {
  CreateResearchProjectPayload,
  ResearchProject,
  ResearchProjectsResponse,
} from '@/redux/types/research'

export const getResearchProjectsAPI =
  async (): Promise<ResearchProjectsResponse> => {
    return await baseRequest<ResearchProjectsResponse>({
      url: 'api/research/projects/',
      method: METHOD.GET,
    })
  }

export const createResearchProjectAPI = async (
  payload: CreateResearchProjectPayload
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: 'api/research/projects/',
    method: METHOD.POST,
    data: payload,
  })
}
