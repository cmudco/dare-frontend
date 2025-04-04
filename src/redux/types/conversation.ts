import { SenderType } from '@/utils/constants/conversation'
import { MyFile } from './files'
import { Prompt } from './prompt'
import { Tag } from './tags'

export interface Conversation {
  conversationId: string
  title?: string
  createdAt: string
  user?: string
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
}

export interface LLMModel {
  id: number
  name: string
  identifier?: string
  description: string | null
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
  prompt: Prompt | null
  temperature: number
  maxTokens: number
}

export interface ConversationResponse {
  results: Conversation[]
}
