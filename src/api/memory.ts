/**
 * Memory API
 *
 * API functions for cross-conversation memory management using MemU.
 */
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type {
  ClearMemoryResponse,
  MemoryItem,
  MemorySearchResult,
  SeedMemoryResponse,
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
 * Get a single memory item by ID
 */
export const getMemoryItemAPI = async (id: string): Promise<MemoryItem> => {
  return await baseRequest<MemoryItem>({
    url: `api/memory/items/${id}/`,
    method: METHOD.GET,
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

/**
 * Seed demo memory data (development only)
 */
export const seedMemoryAPI = async (): Promise<SeedMemoryResponse> => {
  return await baseRequest<SeedMemoryResponse>({
    url: 'api/memory/seed/',
    method: METHOD.POST,
  })
}
