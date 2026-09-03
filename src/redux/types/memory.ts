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

/** One change the tidy-up sweep suggests. Nothing happens until it is approved. */
export interface MemoryProposal {
  /** 'merge' | 'promote' | 'rekey' | 'evict' */
  kind: string
  recordId: string
  text: string
  /** Why the sweep thinks this, in words the person can judge. */
  reason: string
  /** For a merge, the memory that would be retired. */
  otherId?: string | null
  otherText?: string | null
  /** The action in the imperative, for the button. */
  detail: string
}

/** What one sweep found. */
export interface MemorySweep {
  proposals: MemoryProposal[]
  examined: number
  profileTokens: number
  /** What the profile WANTS — above the ceiling means lines are being left out. */
  pinnedTokens: number
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

/** One turn of a session-search hit, with the matched line flagged */
export interface SessionExchangeLine {
  role: 'user' | 'assistant'
  text: string
  matched: boolean
}

/** One clickable transcript hit — a conversation, a date, an exchange */
export interface SessionHit {
  conversationId: string
  conversationTitle: string
  messageId: number
  date: string | null
  exchange: SessionExchangeLine[]
}

/** Response from the session (transcript) search endpoint */
export interface SessionSearchResult {
  success: boolean
  query: string
  since: string | null
  until: string | null
  found: number
  hits: SessionHit[]
}

/** A dare-memory-v2 bundle — the layered contract as one document */
export interface MemoryExportBundle {
  schema: string
  exportedAt: string
  document: string
  records: unknown[]
}

/** What the import endpoint reports back */
export interface MemoryImportResult {
  records: number
  embedded: number
  document: boolean
}

/** What the foreign-paste endpoint reports: work queued, not yet done */
export interface ForeignImportResult {
  queuedChunks: number
  conversationId: string
}

export enum MemoryBackfillStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  FAILED = 'failed',
}

export interface MemoryBackfillRange {
  since?: string
  until?: string
}

/** One durable, user-requested pass over conversations that predate memory. */
export interface MemoryBackfillRun {
  id: string
  status: MemoryBackfillStatus
  totalTurns: number
  processedTurns: number
  since: string | null
  until: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  errorMessage: string
}

export interface MemoryBackfillResponse {
  run: MemoryBackfillRun | null
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
  /** The tidy-up sweep's suggestions, and which one is mid-flight */
  sweep: MemorySweep | null
  sweepLoading: boolean
  applyingProposal: string | null
  /** Search results from last query */
  searchResults: MemorySearchResult | null
  /** Whether search is in progress */
  searchLoading: boolean
  /** Whether the search surface is in session (transcript) mode */
  sessionMode: boolean
  /** Results from the last transcript search */
  sessionResults: SessionSearchResult | null
  sessionLoading: boolean
  exporting: boolean
  importing: boolean
  /** Latest historical-chat memory build and its independent request state. */
  backfillRun: MemoryBackfillRun | null
  backfillLoading: boolean
  backfillStarting: boolean
  backfillStopping: boolean
  backfillError: string | null
  /** Whether clearing is in progress */
  clearing: boolean
  /** Id of the memory currently being saved, if any */
  savingId: string | null
  /** Error message if any operation failed */
  error: string | null
}
