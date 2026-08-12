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
  /** 'active' | 'held' | 'superseded'. Absent on USER.md lines, which have no lifecycle. */
  state?: string | null
  /** The day it stopped being true — not the day we found out, which is createdAt. */
  validUntil?: string | null
  /** The memory that replaced this one, for retired rows. */
  replacedBy?: string | null
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
  /** Retired memories — kept separately, since they answer a different question */
  retired: MemoryItem[]
  retiredLoading: boolean
  /** Search results from last query */
  searchResults: MemorySearchResult | null
  /** Whether search is in progress */
  searchLoading: boolean
  /** Whether clearing is in progress */
  clearing: boolean
  /** Id of the memory currently being saved, if any */
  savingId: string | null
  /** Error message if any operation failed */
  error: string | null
}
