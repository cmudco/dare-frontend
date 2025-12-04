import { SenderType, FeedbackType } from '@/utils/constants/conversation'
import type {
  ImageSizeType,
  ImageQualityType,
  ImageStyleType,
} from '@/utils/constants/imageGeneration'
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
  webSearchEnabled?: boolean
  imageGenerationEnabled?: boolean
  artifactsEnabled?: boolean
  selectedModel?: number | null
  selectedMediaIds?: number[]
  prompt?: Prompt | null
  promptId?: number | null
  sortOrder?: number
  selectedEmbeddingIds?: number[]
  selectedFileIds?: number[]
  feedbackAutoPromptCount?: number // How many auto-prompts have been shown
  feedbackLastPromptMessageCount?: number // Message # when last shown
  feedbackLastPromptTimestamp?: string // When last shown (ISO datetime string)
}

export interface Message {
  id: string
  message: string
  senderType: SenderType
  senderName: string
  isSender: boolean
  date: string
  files?: MyFile[]
  tags?: Tag[]
  llmId?: number
  streaming?: boolean
  snippets?: Snippet[]
  feedbackType?: FeedbackType | null
  feedbackText?: string
  feedbackSource?: string
  isEdited?: boolean
  isRegenerated?: boolean
  originalMessage?: string
  cost?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  // Image generation fields
  generatedImage?: GeneratedImage
  // Artifact reference (when message has associated artifact)
  artifactId?: string
}

export interface GeneratedImage {
  fileId: number
  filename: string
  fileUrl: string
  prompt: string
  revisedPrompt?: string
  cost: string
  model: string
  size: string
  quality: string
  style: string
}

export interface MessageProps {
  message: Message
  onEditMessage?: (id: string, content: string) => void
  onContentRendered?: () => void
  shouldShowAutoFeedback?: boolean
}

export interface LLMModel {
  id: number
  name: string
  identifier?: string
  provider: string
  description: string | null
  isReasoning: boolean
  isImageGenerator?: boolean
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

export interface ConversationDraft {
  conversationId: string
  draft: string
  timestamp: number
}

export interface AttachedImage {
  id: string
  preview: string
  name: string
  size: number
  type: string
}

export interface ImageGenerationSettings {
  size: ImageSizeType
  quality: ImageQualityType
  style: ImageStyleType
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
  selectedMediaFiles: MyFile[] // NEW: Persistent media files (images/videos)
  selectedTags: Tag[]
  selectedFolders: MyFolder[]
  selectedConversations: string[]
  referencedConversations: Conversation[]
  referencedConversationHistoryLimit: number
  showDropdown: boolean
  hoveredModel: string | null
  conversationInput: string
  availableModels: LLMModel[]
  allModels: LLMModel[]
  conversationDrafts: ConversationDraft[]
  autoSaveEnabled: boolean
  attachedImages: AttachedImage[]
  webSearchEnabled: boolean
  imageGenerationEnabled: boolean
  artifactsEnabled: boolean
  isGeneratingImage: boolean
  imageGenerationPrompt: string | null
  imageGenerationSettings: ImageGenerationSettings
}

export interface ConversationResponse {
  results: Conversation[]
}

export interface MessageReaction {
  feedbackType?: FeedbackType | null
  feedbackText?: string
  feedbackSource?: string
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
