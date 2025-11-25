export interface Agent {
  id: number
  name: string
  description: string
  user: string
  prompt: number
  promptTitle?: string
  contentFiles: number[]
  embeddingFiles: number[]
  llm: number | null
  llmName?: string
  maxTokens: number
  temperature: number
  maxContextSnippets: number
  documentSimilarityThreshold: number
  enableWebSearch: boolean
  version: number
  parent?: number | null
  createdAt: string
  updatedAt: string
}

export interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  loading: boolean
  error: string | null
}

export interface AgentNodeData {
  agent: number | null
  name: string
  description: string
  prompt: number | null
  promptTitle?: string
  contentFiles: number[]
  embeddingFiles: number[]
  llm: number | null
  llmName?: string
  agentNumber: number
  maxTokens: number
  temperature: number
  maxContextSnippets: number
  documentSimilarityThreshold: number
  usePreviousAgentFiles: boolean
  usePreviousAgentEmbeddings: boolean
  textInput: string
  enableWebSearch: boolean
  isCollapsed?: boolean
}

export interface TemplateAgentNodeData {
  agent: number
  agentName?: string
  name: string
  description: string
  agentNumber: number
  isCollapsed?: boolean
}
