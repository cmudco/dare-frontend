import { User } from '@/redux/types/user'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

export interface VectorDBPreferenceResponse {
  vectorDb: number
}

export const getVectorDBPreference =
  async (): Promise<VectorDBPreferenceResponse> => {
    return await baseRequest<VectorDBPreferenceResponse>({
      url: 'users/api/vector-db/preference/',
      method: METHOD.GET,
      includeAuthToken: true,
    })
  }

export const updateVectorDBPreference = async (data: {
  vectorDb: number
}): Promise<User> => {
  return await baseRequest<User>({
    url: 'users/api/vector-db/preference/',
    method: METHOD.POST,
    data,
    includeAuthToken: true,
  })
}
