import {
  Conversation,
  ConversationSummaryResponse,
  ConversationResponse,
  ConversationSortOrder,
  LLMModel,
  Message,
  MessageReaction,
  PickerModel,
  WalletMeta,
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

// When `walletScope` is supplied (typically `'active'`), the BE returns
// `{models, wallet}` — wallet-aware picker entries with opaque string ids
// (LiteLLM-routed entries co-exist with DB-LLMs). Without the scope, the
// legacy paginated `{ results }` is returned — those rows are
// `LLMModel`-shaped (numeric PK) since LiteLLM doesn't apply.
export const getModelsAPI = async (
  walletScope?: 'active' | string
): Promise<{
  results?: LLMModel[]
  models?: PickerModel[]
  wallet?: WalletMeta
}> => {
  const url = walletScope
    ? `api/llms/?wallet_scope=${encodeURIComponent(walletScope)}`
    : 'api/llms/'
  return await baseRequest<{
    results?: LLMModel[]
    models?: PickerModel[]
    wallet?: WalletMeta
  }>({ url, method: METHOD.GET })
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

export const exportConversationPdfAPI = async (
  conversationId: string
): Promise<{ blob: Blob; filename: string }> => {
  return await baseRequest({
    url: `api/conversations/${conversationId}/export-pdf/`,
    method: METHOD.GET,
    responseType: 'blob',
  })
}

export const deleteMessageAPI = async (messageId: string): Promise<void> => {
  await baseRequest<void>({
    url: `api/messages/${messageId}/soft-delete/`,
    method: METHOD.POST,
  })
}

export const getSharedConversationsAPI =
  async (): Promise<ConversationResponse> => {
    return await baseRequest<ConversationResponse>({
      url: 'api/conversations/?shared=true',
      method: METHOD.GET,
    })
  }

export const getConversationSummariesAPI =
  async (): Promise<ConversationSummaryResponse> => {
    return await baseRequest<ConversationSummaryResponse>({
      url: 'api/conversation-summaries/',
      method: METHOD.GET,
    })
  }

export const toggleFavoriteConversationAPI = async (
  conversationId: string
): Promise<Conversation> => {
  return await baseRequest<Conversation>({
    url: `api/conversations/${conversationId}/favorite/`,
    method: METHOD.POST,
  })
}

export const publishConversationAPI = async (
  conversationId: string
): Promise<Conversation> => {
  return await baseRequest<Conversation>({
    url: `api/conversations/${conversationId}/publish/`,
    method: METHOD.POST,
  })
}

export const forkConversationAPI = async (
  conversationId: string
): Promise<Conversation> => {
  return await baseRequest<Conversation>({
    url: `api/conversations/${conversationId}/fork/`,
    method: METHOD.POST,
  })
}

export const getConversationMessagesAPI = async (
  conversationId: string
): Promise<Message[]> => {
  return await baseRequest<Message[]>({
    url: `api/conversations/${conversationId}/messages/`,
    method: METHOD.GET,
  })
}
