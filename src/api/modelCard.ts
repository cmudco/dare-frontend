import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  ModelCardData,
  ModelCardListItem,
  PaginatedResponse,
} from '@/types/modelCard'

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
