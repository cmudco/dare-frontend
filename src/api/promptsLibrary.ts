import { PublishedPrompt, Prompt } from '../redux/types/prompt'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export const getPromptsLibraryAPI = async (): Promise<{
  results: PublishedPrompt[]
}> => {
  return await baseRequest<{ results: PublishedPrompt[] }>({
    url: 'api/library/',
    method: METHOD.GET,
  })
}

export const publishPromptAPI = async (
  id: number,
  description?: string
): Promise<PublishedPrompt> => {
  return await baseRequest<PublishedPrompt>({
    url: `api/prompts/${id}/publish/`,
    method: METHOD.POST,
    data: { description: description || '' },
  })
}

export const unpublishPromptAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/prompts/${id}/unpublish/`,
    method: METHOD.POST,
  })
}

export const cloneFromLibraryAPI = async (id: number): Promise<Prompt> => {
  return await baseRequest<Prompt>({
    url: `api/library/${id}/clone/`,
    method: METHOD.POST,
  })
}
