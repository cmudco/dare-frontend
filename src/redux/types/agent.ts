import { RagMode } from '@/utils/constants/conversation'
import { EffortLevel } from '@/utils/constants/model'

/** The setup an agent gives a chat; also the create/update request body. */
export interface AgentSetup {
  name: string
  description: string
  /** Null keeps the chat's prompt when the agent is applied. */
  prompt: number | null
  /** Picker id: an LLM PK, `litellm:<key>:<model>`, or null for the chat's model. */
  modelRef: string | null
  maxTokens: number
  temperature: number
  effort: EffortLevel | null
  historyLimit: number
  ragMode: RagMode
  maxContextSnippets: number
  documentSimilarityThreshold: number
  enableWebSearch: boolean
  webFetchEnabled: boolean
  codeSandboxEnabled: boolean
  artifactsEnabled: boolean
  memoryEnabled: boolean
  contentFiles: number[]
  embeddingFiles: number[]
  libraries: number[]
  mcpServers: number[]
  dareToolSlugs: string[]
}

export interface Agent extends AgentSetup {
  id: number
  user: string
  promptTitle?: string
  /** Display name of the model: the DARE model's name or the gateway model id. */
  modelName: string
  /** DARE model PK; null for a gateway model, which Workflows cannot run yet. */
  llm: number | null
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
