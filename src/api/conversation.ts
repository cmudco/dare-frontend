import {
  Conversation,
  ConversationResponse,
  ConversationSortOrder,
  LLMModel,
  Message,
  MessageReaction,
} from '../redux/types/conversation'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export const getConversationsAPI = async (): Promise<ConversationResponse> => {
  return await baseRequest<ConversationResponse>({
    url: 'api/conversations/',
    method: METHOD.GET,
  })
}

export const createConversationAPI = async () => {
  return await baseRequest<Conversation>({
    url: 'api/conversations/',
    method: METHOD.POST,
  })
}

export const getConversationAPI = async (
  conversationId: string
): Promise<Conversation> => {
  return await baseRequest<Conversation>({
    url: `api/conversations/${conversationId}/`,
    method: METHOD.GET,
  })
}

export const updateConversationAPI = async (
  conversationId: string,
  updates: Partial<Conversation>
): Promise<Conversation> => {
  return await baseRequest<Conversation>({
    url: `api/conversations/${conversationId}/`,
    method: METHOD.PATCH,
    data: updates,
  })
}

export const deleteConversationAPI = async (
  conversationId: string
): Promise<void> => {
  await baseRequest<void>({
    url: `api/conversations/${conversationId}/`,
    method: METHOD.DELETE,
  })
}

export const getModelsAPI = async (): Promise<{ results: LLMModel[] }> => {
  return await baseRequest<{ results: LLMModel[] }>({
    url: 'api/llms/',
    method: METHOD.GET,
  })
}

export const getAllModelsAPI = async (): Promise<LLMModel[]> => {
  return await baseRequest<LLMModel[]>({
    url: 'api/llms/all_models/',
    method: METHOD.GET,
  })
}

export const updateMessageAPI = async (
  messageId: string,
  reaction: MessageReaction
): Promise<Message> => {
  return await baseRequest<Message>({
    url: `api/messages/${messageId}/`,
    method: METHOD.PATCH,
    data: reaction,
  })
}

export const updateConversationSortOrderAPI = async (
  updates: ConversationSortOrder[]
): Promise<void> => {
  await baseRequest<void>({
    url: 'api/conversations/update-sort-order/',
    method: METHOD.PATCH,
    data: updates,
  })
}

export const deleteMultipleConversationsAPI = async (
  conversationIds: string[]
): Promise<void> => {
  await baseRequest<void>({
    url: 'api/conversations/bulk-delete/',
    method: METHOD.POST,
    data: { conversationIds },
  })
}

export const cloneConversationAPI = async (
  conversationId: string
): Promise<Conversation> => {
  return await baseRequest<Conversation>({
    url: `api/conversations/${conversationId}/clone/`,
    method: METHOD.POST,
  })
}

// Using fetch here because our baseRequest doesn't support blob/stream responses
export const exportConversationPdfAPI = async (
  conversationId: string
): Promise<{ blob: Blob; filename: string }> => {
  const baseUrl =
    import.meta.env.VITE_DJANGO_BACKEND_URL || 'http://localhost:8000'
  const url = `${baseUrl}/api/conversations/${conversationId}/export-pdf/`

  try {
    const authToken = localStorage.getItem('token')
    const headers: Record<string, string> = {}

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(
        `Failed to export conversation PDF: ${response.status} ${response.statusText}`
      )
    }

    // Get filename from Content-Disposition header or create default
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'conversation.pdf'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    const blob = await response.blob()

    return { blob, filename }
  } catch (error) {
    console.error('Error exporting conversation PDF:', error)
    throw error
  }
}
