import { SenderType } from '@/utils/constants/conversation'
import { MyFile, MyFolder } from './files'
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
  historyLimit: number
  prompt?: Prompt | null
  promptId?: string | null
  sortOrder?: number
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
  isLiked?: boolean
  isDisliked?: boolean
  isEdited?: boolean
  isRegenerated?: boolean
  originalMessage?: string
  dislikeFeedback?: string
  likeFeedback?: string
  cost?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
}

export interface MessageProps {
  message: Message
  onEditMessage?: (id: string, content: string) => void
  onContentRendered?: () => void
}

export interface LLMModel {
  id: number
  name: string
  identifier?: string
  provider: string
  description: string | null
  isReasoning: boolean
  inputTokenRatePerMillion: number
  outputTokenRatePerMillion: number
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
  selectedEmbeddings: MyFile[]
  selectedTags: Tag[]
  selectedFolders: MyFolder[]
  selectedConversations: string[]
  showDropdown: boolean
  hoveredModel: string | null
  conversationInput: string
  availableModels: LLMModel[]
}

export interface ConversationResponse {
  results: Conversation[]
}

export interface MessageReaction {
  isLiked: boolean
  isDisliked: boolean
  dislikeFeedback?: string
  likeFeedback?: string
}

export interface ConversationSortOrder {
  conversationId: string
  sortOrder: number
}

export interface SortableConversationItemProps {
  conversation: Conversation
  isActive: boolean
  isSelected: boolean
  editingId: string | null
  editValue: string
  onConversationClick: (
    conversation: Conversation,
    event?: React.MouseEvent
  ) => void
  onEditClick: (conversation: Conversation) => void
  onCloneClick: (conversation: Conversation) => void
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEditBlur: () => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}
