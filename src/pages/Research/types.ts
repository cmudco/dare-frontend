// Type definitions for the Research Workspace prototype.
// Frontend-only mock — no backend contracts implied.

export type NavSection =
  | 'overview'
  | 'scout'
  | 'chat'
  | 'review'
  | 'knowledge'
  | 'sources'
  | 'memory'
  | 'artifacts'
  | 'runs'

export type CitationSignal = 'supporting' | 'disputing' | 'tangential'

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'later'

export type ToolSource = 'PubMed' | 'Scite' | 'Consensus' | 'Library' | 'Upload'

export interface Provenance {
  tool: ToolSource
  retrievedAt: string // human-readable date for the mock
  retrievalDepth: string // e.g. "Title + abstract + full-text snippet"
  soulFileVersion: string // e.g. "Alex v3"
}

export interface CriticVerdict {
  outcome: 'pass' | 'flag'
  reasoning: string
}

export interface ReviewItem {
  id: number
  title: string
  authors: string
  venue: string
  year: number
  url: string
  toolSource: ToolSource
  whyItMatters: string // one-line summary shown collapsed
  rationale: string // full rationale shown expanded
  confidence: number // 0-100, Scout's relevance confidence
  confidenceRationale: string
  citationSignal: CitationSignal
  citationContext: string // the quoted passage
  provenance: Provenance
  status: ReviewStatus
  critic?: CriticVerdict // present once "Ask Critic" has been run
}

export interface KnowledgeItem extends ReviewItem {
  usedIn?: string[] // sections of the project this source supports
}

export interface SoulVirtue {
  rank: number
  label: string
  note: string
}

// --- Agent runs, memory, sources (the visible communication with Hermes) ---
// Canonical API shapes; re-exported here for the workspace.
export type {
  AgentRun,
  AgentRunToolCall,
  MemoryProposal,
  ProjectMemory,
  ResearchSource,
  SoulFile,
} from '@/redux/types/research'
