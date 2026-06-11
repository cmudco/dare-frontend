// Type definitions for the Research Workspace.

export type NavSection =
  | 'overview'
  | 'scout'
  | 'chat'
  | 'review'
  | 'memory'
  | 'graph'
  | 'artifacts'
  | 'runs'

export interface SoulVirtue {
  rank: number
  label: string
  note: string
}

// Canonical API shapes; re-exported here for the workspace.
export type {
  AgentRun,
  AgentRunToolCall,
  ChatMessage,
  KnowledgeItem,
  MemoryProposal,
  ProjectMemory,
  Provenance,
  ResearchArtifact,
  ResearchSource,
  ReviewItem,
  SoulFile,
} from '@/redux/types/research'
