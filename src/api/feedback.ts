import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { FeedbackPayload } from '@/redux/types/feedback'

export interface FeedbackResponse {
  id: number
  emotion: string
  category: string | null
  message: string
  screenshot: string | null
  page: string
  browserInfo: string
  createdAt: string
}

export const submitFeedbackAPI = async (
  data: FeedbackPayload
): Promise<FeedbackResponse> => {
  return await baseRequest<FeedbackResponse>({
    url: 'api/feedback/',
    method: METHOD.POST,
    data: {
      emotion: data.emotion,
      category: data.category,
      message: data.message,
      screenshot: data.screenshot,
      page: data.context.page,
      browserInfo: data.context.browserInfo,
    },
    includeAuthToken: true,
  })
}
