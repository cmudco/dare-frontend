// Type definitions for the Research Workspace.

// The workspace nav sections, in order. A const array (not a bare union) so we
// have a runtime list to validate the `?tab=` query param against.
export const NAV_SECTIONS = [
  'overview',
  'chat',
  'review',
  'learning',
  'memory',
  'graph',
  'artifacts',
  'runs',
] as const

export type NavSection = (typeof NAV_SECTIONS)[number]

/** True if a raw string is a valid nav section (e.g. from the URL). */
export const isNavSection = (value: string | null): value is NavSection =>
  value != null && (NAV_SECTIONS as readonly string[]).includes(value)

export interface SoulVirtue {
  rank: number
  label: string
  note: string
}

// Canonical API shapes; re-exported here for the workspace.
export type {
  AgentRun,
  AgentRunCancellation,
  AgentRunDetail,
  PromptBrief,
  RunPrompt,
  AgentRunToolCall,
  ChatMessage,
  CriticVerdict,
  KnowledgeItem,
  MemoryProposal,
  ProjectMemory,
  Provenance,
  ResearchArtifact,
  ResearchSource,
  ReviewItem,
  ReviewReasonTag,
  SoulFile,
} from '@/redux/types/research'
