/**
 * Memory API
 *
 * API functions for cross-conversation memory management using MemU.
 */
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { ImportMemoryRequest, ImportMemoryResponse } from '@/redux/types/memory'

// Types
export interface MemoryItem {
  id: string
  memoryType: string
  content: string
  categories: string[]
  createdAt?: string
  updatedAt?: string
  score?: number
}

export interface MemorySearchResult {
  query: string
  items: MemoryItem[]
  categories: Array<{
    name: string
    summary: string
    score?: number
  }>
}

export interface SeedResponse {
  itemsCreated: number
  message: string
}

export interface ClearResponse {
  success: boolean
  message: string
}

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
export const clearAllMemoryAPI = async (): Promise<ClearResponse> => {
  return await baseRequest<ClearResponse>({
    url: 'api/memory/clear/',
    method: METHOD.DELETE,
  })
}

/**
 * Import user-provided memory items
 */
export const importMemoryAPI = async (
  request: ImportMemoryRequest
): Promise<ImportMemoryResponse> => {
  return await baseRequest<ImportMemoryResponse>({
    url: 'api/memory/import/',
    method: METHOD.POST,
    data: request,
  })
}

/**
 * Seed demo memory data (development only)
 */
export const seedMemoryAPI = async (): Promise<SeedResponse> => {
  return await baseRequest<SeedResponse>({
    url: 'api/memory/seed/',
    method: METHOD.POST,
  })
}
