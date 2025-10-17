import { User, ChunkSettings } from '@/redux/types/user'
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

export const getChunkSettingsAPI = async (): Promise<ChunkSettings> => {
  return await baseRequest<ChunkSettings>({
    url: 'users/api/chunking/settings/',
    method: METHOD.GET,
    includeAuthToken: true,
  })
}

export const updateChunkSettingsAPI = async (
  data: ChunkSettings
): Promise<ChunkSettings> => {
  return await baseRequest<ChunkSettings>({
    url: 'users/api/chunking/settings/',
    method: METHOD.PATCH,
    data,
    includeAuthToken: true,
  })
}

export const updateUserAPI = async (data: Partial<User>): Promise<User> => {
  return await baseRequest<User>({
    url: 'users/api/dj-rest-auth/user/',
    method: METHOD.PUT,
    data,
    includeAuthToken: true,
  })
}
