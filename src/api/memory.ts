/**
 * Memory API
 *
 * API functions for the layered cross-conversation memory store.
 */
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type {
  ClearMemoryResponse,
  MemoryItem,
  MemorySearchResult,
} from '@/redux/types/memory'

// API Functions

/**
 * Get all memory items for the authenticated user
 */
export const getMemoryItemsAPI = async (): Promise<MemoryItem[]> => {
  return await baseRequest<MemoryItem[]>({
    url: 'api/memory/items/',
    method: METHOD.GET,
  })
}

/**
 * Get retired memories — rows that were true once and were replaced.
 *
 * A separate call rather than a flag on the list above, because the two are
 * never shown together: mixed in, a retired fact reads as a contradiction.
 */
export const getRetiredMemoryItemsAPI = async (): Promise<MemoryItem[]> => {
  return await baseRequest<MemoryItem[]>({
    url: 'api/memory/items/',
    method: METHOD.GET,
    params: { state: 'retired' },
  })
}

/**
 * Get a single memory item by ID
 */
export const getMemoryItemAPI = async (id: string): Promise<MemoryItem> => {
  return await baseRequest<MemoryItem>({
    url: `api/memory/items/${id}/`,
    method: METHOD.GET,
  })
}

/**
 * Rewrite a memory. The backend corrects the row in place — re-embedding it
 * so it stays findable by what it now says, and re-keying a rule whose
 * trigger changed.
 */
export const updateMemoryItemAPI = async (
  id: string,
  content: string
): Promise<MemoryItem> => {
  return await baseRequest<MemoryItem>({
    url: `api/memory/items/${id}/`,
    method: METHOD.PATCH,
    data: { content },
  })
}

/**
 * Delete a memory item by ID
 */
export const deleteMemoryItemAPI = async (id: string): Promise<void> => {
  await baseRequest<void>({
    url: `api/memory/items/${id}/`,
    method: METHOD.DELETE,
  })
}

/**
 * Search memories using vector similarity
 */
export const searchMemoryAPI = async (
  query: string
): Promise<MemorySearchResult> => {
  return await baseRequest<MemorySearchResult>({
    url: 'api/memory/search/',
    method: METHOD.POST,
    data: { query },
  })
}

/**
 * Clear all memory items for the authenticated user
 */
export const clearAllMemoryAPI = async (): Promise<ClearMemoryResponse> => {
  return await baseRequest<ClearMemoryResponse>({
    url: 'api/memory/clear/',
    method: METHOD.DELETE,
  })
}
