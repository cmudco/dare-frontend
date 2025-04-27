import { SenderType } from '@/utils/constants/conversation'
import { MyFile } from './files'
import { Prompt } from './prompt'
import { Tag } from './tags'

export interface Conversation {
  conversationId: string
  title?: string
  createdAt: string
  user?: string
  maxContextSnippets: number
  documentSimilarityThreshold: number
  temperature: number
  maxTokens: number
  prompt?: Prompt | null
  promptId?: string | null
}

export interface Message {
  id: string
  message: string
  senderType: SenderType
  senderName: string
  isSender: boolean
  date: string
  files?: MyFile[]
  llmId?: number
  streaming?: boolean
  snippets?: Snippet[]
}

export interface LLMModel {
  id: number
  name: string
  identifier?: string
  description: string | null
}

export interface Snippet {
  id: number
  file: MyFile
  text: string
  similarityScore: number
  chunkIndex: number
  vectorDbSource: string
}

export interface ConversationState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  loading: boolean
  error: string | null
  searchQuery: string
  activeConversationMessages: Message[]
  selectedModel: number | null
  selectedFiles: MyFile[]
  selectedTags: Tag[]
  showDropdown: boolean
  hoveredModel: string | null
  conversationInput: string
  availableModels: LLMModel[]
}

export interface ConversationResponse {
  results: Conversation[]
}
