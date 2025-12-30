import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { ModelCardData } from '@/utils/modelCardData'

export interface ModelCardListItem {
  id: number
  name: string
  slug: string
  provider_name: string
  llm: number | null
  has_public_feedback: boolean
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const getModelCardsAPI = async (): Promise<
  PaginatedResponse<ModelCardListItem>
> => {
  return await baseRequest<PaginatedResponse<ModelCardListItem>>({
    url: 'api/model-cards/',
    method: METHOD.GET,
  })
}

export const getModelCardBySlug = async (
  slug: string
): Promise<ModelCardData> => {
  return await baseRequest<ModelCardData>({
    url: `api/model-cards/${slug}/`,
    method: METHOD.GET,
  })
}
