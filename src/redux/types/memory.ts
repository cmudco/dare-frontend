/**
 * Memory Types
 *
 * TypeScript interfaces for cross-conversation memory state.
 */

/** Memory type enum */
export enum MemoryType {
  PROFILE = 'profile',
  EVENT = 'event',
  KNOWLEDGE = 'knowledge',
  BEHAVIOR = 'behavior',
}

/** Single memory item from the backend */
export interface MemoryItem {
  id: string
  memoryType: string
  content: string
  categories: string[]
  createdAt?: string
  updatedAt?: string
  score?: number
}

/** Category summary from search results */
export interface MemoryCategory {
  name: string
  summary: string
  score?: number
}

/** Response from memory search endpoint */
export interface MemorySearchResult {
  query: string
  items: MemoryItem[]
  categories: MemoryCategory[]
}

/** Response from seed endpoint */
export interface SeedMemoryResponse {
  itemsCreated: number
  message: string
}

/** Response from clear endpoint */
export interface ClearMemoryResponse {
  success: boolean
  message: string
}

/** Memory Redux state */
export interface MemoryState {
  /** List of all memory items */
  items: MemoryItem[]
  /** Whether items are loading */
  itemsLoading: boolean
  /** Search results from last query */
  searchResults: MemorySearchResult | null
  /** Whether search is in progress */
  searchLoading: boolean
  /** Whether seeding is in progress */
  seeding: boolean
  /** Whether clearing is in progress */
  clearing: boolean
  /** Error message if any operation failed */
  error: string | null
}
