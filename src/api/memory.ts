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
  MemoryProposal,
  MemorySearchResult,
  MemorySweep,
  SessionSearchResult,
  MemoryExportBundle,
  MemoryImportResult,
  ForeignImportResult,
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
 * Ask what the store would like to tidy. Reads only — nothing changes here.
 */
export const getMemorySweepAPI = async (): Promise<MemorySweep> => {
  return await baseRequest<MemorySweep>({
    url: 'api/memory/v2/consolidate/',
    method: METHOD.GET,
  })
}

/**
 * Approve one suggestion. The server re-checks it before committing, so a
 * proposal that has gone stale is refused rather than applied blind.
 */
export const applyMemoryProposalAPI = async (
  proposal: MemoryProposal
): Promise<{ detail: string }> => {
  return await baseRequest<{ detail: string }>({
    url: 'api/memory/v2/consolidate/',
    method: METHOD.POST,
    data: proposal,
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
 * Search the transcript layer — the user's conversations, word for word.
 * Words, a date range, or both; every bound only narrows.
 */
export const searchSessionsAPI = async (params: {
  q?: string
  since?: string
  until?: string
}): Promise<SessionSearchResult> => {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.since) search.set('since', params.since)
  if (params.until) search.set('until', params.until)
  return await baseRequest<SessionSearchResult>({
    url: `api/memory/v2/sessions/?${search.toString()}`,
    method: METHOD.GET,
  })
}

/**
 * Export the whole store as a self-contained dare-memory-v2 bundle
 */
export const exportMemoryAPI = async (): Promise<MemoryExportBundle> => {
  return await baseRequest<MemoryExportBundle>({
    url: 'api/memory/v2/export/',
    method: METHOD.GET,
  })
}

/**
 * Import a dare-memory-v2 bundle into an empty store
 */
export const importMemoryAPI = async (
  bundle: object
): Promise<MemoryImportResult> => {
  return await baseRequest<MemoryImportResult>({
    url: 'api/memory/v2/import/',
    method: METHOD.POST,
    data: bundle,
  })
}

/**
 * Queue a free-form paste (from any other AI) through the writer pipeline
 */
export const importForeignMemoryAPI = async (
  text: string
): Promise<ForeignImportResult> => {
  return await baseRequest<ForeignImportResult>({
    url: 'api/memory/v2/import/foreign/',
    method: METHOD.POST,
    data: { text },
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
