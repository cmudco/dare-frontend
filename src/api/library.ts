import { SharedLibrary } from '../redux/types/library'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export const getSharedLibrariesAPI = async (): Promise<{
  results: SharedLibrary[]
}> => {
  return await baseRequest<{ results: SharedLibrary[] }>({
    url: 'api/libraries/',
    method: METHOD.GET,
  })
}

export const addLibraryAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/libraries/${id}/add/`,
    method: METHOD.POST,
  })
}

export const removeLibraryAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/libraries/${id}/remove/`,
    method: METHOD.DELETE,
  })
}
