import { SenderType, FeedbackType } from '@/utils/constants/conversation'
import { ToolCallStatus, MessageContentType } from '@/utils/constants/dareTools'
import type {
  ImageSizeType,
  ImageQualityType,
  ImageStyleType,
} from '@/utils/constants/imageGeneration'
import type { LanguageCode } from '@/utils/constants/audioTranscription'
import { MyFile, MyFolder } from './files'
import { Prompt } from './prompt'
import { Tag } from './tags'

/**
 * Voice recording state enum for push-to-talk voice input
 */
export enum VoiceRecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
}

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
  audioTranscriptionEnabled?: boolean
  artifactsEnabled?: boolean
  selectedModel?: number | null
  selectedMediaIds?: number[]
  prompt?: Prompt | null
  promptId?: number | null
  sortOrder?: number
  selectedEmbeddingIds?: number[]
  selectedFileIds?: number[]
  selectedMcpServerIds?: number[] // MCP servers enabled for this conversation
  selectedDareToolSlugs?: string[] // DARE tools enabled for this conversation
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
  webSearchSources?: WebSearchSource[]
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
  // Audio transcription fields
  generatedTranscription?: GeneratedTranscription
  // Artifact reference (when message has associated artifact)
  artifactId?: number
  // MCP tool calls made by this message
  toolCalls?: ToolCall[]
  // Content type for specialized rendering
  contentType?: MessageContentType
  contentMetadata?: Record<string, unknown>
}

// ToolCallStatus is now imported from @/utils/constants/dareTools
// Re-export for backwards compatibility
export { ToolCallStatus }

// ─────────────────────────────────────────────────────────────
// Tool Call Interface
// ─────────────────────────────────────────────────────────────

/**
 * Tool Call - tracks tool execution within a message
 *
 * Supports both MCP external tools and DARE internal tools.
 * Use serverSlug to determine which result field to read:
 *
 *   - serverSlug === 'dare'  → read `dareResult`
 *   - serverSlug !== 'dare'  → read `mcpResult`
 */
export interface ToolCall {
  /** Unique ID from the LLM */
  id: string

  /** Name of the tool executed */
  toolName: string

  /** Server identifier ('dare' for internal, or MCP server slug) */
  serverSlug: string

  /** Current execution status */
  status: ToolCallStatus

  /** Result from DARE internal tools (when serverSlug === 'dare') */
  dareResult?: import('@/redux/types/dareToolResults').DareToolResult

  /** Result from MCP external tools (when serverSlug !== 'dare') */
  mcpResult?: import('@/redux/types/dareToolResults').McpToolResult

  /** Error message if execution failed */
  error?: string
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

export interface GeneratedTranscription {
  fileId: number
  fileName: string
  text: string
  language: string
  model: string
  cost?: string
  duration?: number
  transcribedAt: string
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
  isAudioTranscriber?: boolean
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

export interface WebSearchSource {
  id: number
  url: string
  title: string
  citedText?: string // Claude only - quoted text from source
  pageAge?: string // Claude only - e.g., "3 weeks ago"
  provider: 'openai' | 'claude' | 'gemini'
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

export interface AudioTranscriptionSettings {
  language: LanguageCode
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
  audioTranscriptionEnabled: boolean
  artifactsEnabled: boolean
  isGeneratingImage: boolean
  imageGenerationPrompt: string | null
  imageGenerationSettings: ImageGenerationSettings
  isTranscribingAudio: boolean
  audioTranscriptionSettings: AudioTranscriptionSettings
  historySidebarCollapsed: boolean
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
