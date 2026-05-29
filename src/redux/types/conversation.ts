import {
  SenderType,
  FeedbackType,
  ConversationTab,
} from '@/utils/constants/conversation'
import type { RelatableStats } from '@/redux/types/billing'
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
import { EffortLevel } from '@/utils/constants/model'

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
  effort?: EffortLevel | null
  maxTokens: number
  historyLimit: number
  webSearchEnabled?: boolean
  webFetchEnabled?: boolean
  imageGenerationEnabled?: boolean
  audioTranscriptionEnabled?: boolean
  artifactsEnabled?: boolean
  memoryEnabled?: boolean
  // Conversation persists the *real* LLM FK only — LiteLLM-routed models are
  // never persisted at conversation level (they're per-message audit fields).
  selectedModel?: number | null
  selectedMediaIds?: number[]
  prompt?: Prompt | null
  promptId?: number | null
  sortOrder?: number
  selectedEmbeddingIds?: number[]
  selectedFileIds?: number[]
  selectedMcpServerIds?: number[] // MCP servers enabled for this conversation
  selectedDareToolSlugs?: string[] // DARE tools enabled for this conversation
  selectedAgent?: number | null // Agent template selected for this conversation
  selectedAgentName?: string | null // Name of the selected agent (read-only)
  feedbackAutoPromptCount?: number // How many auto-prompts have been shown
  feedbackLastPromptMessageCount?: number // Message # when last shown
  feedbackLastPromptTimestamp?: string // When last shown (ISO datetime string)
  isFavorite?: boolean
  // Sharing fields
  isPublished?: boolean
  publishedAt?: string | null
  isOwner?: boolean
  isForked?: boolean // True if this conversation was forked from another user
  canShare?: boolean
  ownerEmail?: string | null
  ownerUserId?: number | null // Owner's user ID for shared conversations (to fetch their files)
  fileOwnerId?: number | null // Original file owner's user ID for forked conversations
}

export interface MemoryContextItem {
  content: string
  memoryType: string
  categories: string[]
}

export interface Message {
  id: string
  message: string
  senderType: SenderType
  senderName: string
  createdAt: string
  files?: MyFile[]
  tags?: Tag[]
  // FK to the real DB-backed LLM that handled the message (numeric pk).
  // Null for user messages and for messages dispatched through LiteLLM —
  // for those, `litellmModelName` carries the model identifier shown in
  // the metadata panel. The LiteLLMKey FK is BE-only audit; the key UUID
  // is never wire-exposed.
  llm?: number | null
  litellmModelName?: string | null
  streaming?: boolean
  snippets?: Snippet[]
  webSearchSources?: WebSearchSource[]
  memoryContextData?: MemoryContextItem[]
  feedbackType?: FeedbackType | null
  feedbackText?: string
  feedbackSource?: string
  isEdited?: boolean
  isRegenerated?: boolean
  originalMessage?: string
  cost?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  energyWh?: string | null
  carbonG?: string | null
  waterMl?: string | null
  energyStats?: RelatableStats | null
  generatedImage?: GeneratedImage
  generatedTranscription?: GeneratedTranscription
  artifactId?: number
  mcpToolCalls?: ToolCall[]
  contentType?: MessageContentType
  contentMetadata?: Record<string, unknown>
}

/** Check if a message was sent by the user (not the AI). */
export const isSenderMessage = (msg: Message): boolean =>
  msg.senderType === SenderType.PLAYER

// ToolCallStatus is now imported from @/utils/constants/dareTools
// Re-export for backwards compatibility
export { ToolCallStatus }

// ─────────────────────────────────────────────────────────────
// Tool Call Interface
// ─────────────────────────────────────────────────────────────

/**
 * Tool Call - tracks tool execution within a message
 *
 * Origin determines which typed result field to read:
 *   - origin === 'dare'     → read `dareResult`
 *   - origin === 'mcp'      → read `mcpResult`
 *   - origin === 'provider' → read `providerResult`
 */
export interface ToolCall {
  /** Unique ID from the LLM */
  id: string

  /** Name of the tool executed */
  toolName: string

  /** Server identifier ('dare' for internal, or MCP server slug) */
  serverSlug: string

  /** Execution origin: DARE internal, MCP external, or provider-native */
  origin: import('@/utils/constants/dareTools').ToolCallOrigin

  /** Current execution status */
  status: ToolCallStatus

  /** Result from DARE internal tools */
  dareResult?: import('@/redux/types/dareToolResults').DareToolResult

  /** Result from MCP external tools */
  mcpResult?: import('@/redux/types/dareToolResults').McpToolResult

  /** Result from provider-native tools (for example Anthropic web_fetch) */
  providerResult?: import('@/redux/types/dareToolResults').ProviderToolResult

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

// DB-backed LLM row — `id` is the integer PK (matches Message.llm and the
// numeric FKs everywhere else). Used for `allModels`, agents, workflows,
// and any place that looks up an LLM by its true PK.
export interface LLMModel {
  id: number
  name: string
  identifier?: string
  provider: string
  description: string | null
  isActive: boolean
  isReasoning: boolean
  supportsTemperature: boolean
  supportsEffort: boolean
  supportsAdaptiveThinking: boolean
  defaultEffort: EffortLevel
  defaultAdaptiveThinkingEnabled: boolean
  isImageGenerator?: boolean
  isAudioTranscriber?: boolean
  inputTokenRatePerMillion: number | null
  outputTokenRatePerMillion: number | null
  tier: string | null
}

// Chat-picker entry — `id` is opaque to the FE because LiteLLM-routed
// entries need to encode (key_pk + model_name) into a single dispatch
// reference. The BE emits either a stringified LLM PK ("42") or
// `litellm:<key_pk>:<model_name>`; the FE renders & echoes back; the BE
// inverts the encoding via `parse_model_id` on dispatch. All other fields
// match `LLMModel`.
export interface PickerModel {
  id: string
  name: string
  identifier?: string
  provider: string
  description: string | null
  isActive: boolean
  isReasoning: boolean
  supportsTemperature: boolean
  supportsEffort: boolean
  supportsAdaptiveThinking: boolean
  defaultEffort: EffortLevel
  defaultAdaptiveThinkingEnabled: boolean
  isImageGenerator?: boolean
  isAudioTranscriber?: boolean
  inputTokenRatePerMillion: number | null
  outputTokenRatePerMillion: number | null
  tier: string | null
}

export interface WalletMeta {
  type: 'DARE' | 'BYO' | 'LITELLM'
  providers: string[]
  isEmpty: boolean
  emptyReason: string | null
  staleProbe: boolean
  // Capability flags drive which chat toggles the picker shows. LiteLLM
  // proxies don't transparently forward web-search / structured-output /
  // DALL-E / Whisper, so the FE hides those toggles when the active
  // wallet is LITELLM. Tools/MCP stay enabled (LiteLLM forwards them).
  supportsWebSearch: boolean
  supportsImageGeneration: boolean
  supportsAudioTranscription: boolean
  supportsStructuredOutput: boolean
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
  conversationSummaries: ConversationSummary[]
  activeConversation: Conversation | null
  loading: boolean
  error: string | null
  searchQuery: string
  activeConversationMessages: Message[]
  // Opaque dispatch id from the picker — echoed back to the BE on send.
  selectedModel: string | null
  // Picker catalog (uniform flat shape) plus the wallet metadata block for
  // capability toggles.
  pickerEntries: PickerModel[]
  activeWalletMeta: WalletMeta | null
  selectedFiles: MyFile[]
  selectedEmbeddings: MyFile[]
  selectedMediaFiles: MyFile[] // NEW: Persistent media files (images/videos)
  selectedTags: Tag[]
  selectedFolders: MyFolder[]
  memoryEnabled: boolean
  selectedConversations: string[]
  referencedConversations: Conversation[]
  referencedConversationHistoryLimit: number
  referencedSummaries: ConversationSummary[]
  showDropdown: boolean
  hoveredModel: string | null
  conversationInput: string
  // Full catalog of DB-backed LLMs, used by configurator surfaces (Agents,
  // ModelCards). Populated from `/api/llms/all_models/`.
  allModels: LLMModel[]
  // Active DB-backed LLMs only. Populated from `/api/llms/`, which applies
  // server-side active/model-group filtering for new selections.
  activeModels: LLMModel[]
  conversationDrafts: ConversationDraft[]
  autoSaveEnabled: boolean
  attachedImages: AttachedImage[]
  webSearchEnabled: boolean
  webFetchEnabled: boolean
  imageGenerationEnabled: boolean
  audioTranscriptionEnabled: boolean
  artifactsEnabled: boolean
  isGeneratingImage: boolean
  imageGenerationPrompt: string | null
  imageGenerationSettings: ImageGenerationSettings
  isTranscribingAudio: boolean
  audioTranscriptionSettings: AudioTranscriptionSettings
  historySidebarCollapsed: boolean
  // Sharing state
  sharedConversations: Conversation[]
  activeTab: ConversationTab
}

export interface ConversationResponse {
  results: Conversation[]
}

export interface ConversationSummary {
  id: number
  conversationId: string
  conversationTitle?: string | null
  summary: string
  llm?: number | null
  llmName?: string | null
  inputTokens: number
  outputTokens: number
  summarizedMessageCount: number
  createdAt: string
  updatedAt: string
}

export interface ConversationSummaryResponse {
  results: ConversationSummary[]
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
  isSharedTab?: boolean
  isSharedWithMeTab?: boolean
  onConversationClick: (
    conversation: Conversation,
    event?: React.MouseEvent
  ) => void
  onEditClick: (conversation: Conversation) => void
  onCloneClick: (conversation: Conversation) => void
  onFavoriteClick?: (conversation: Conversation) => void
  onSharingClick?: (conversation: Conversation) => void
  onForkClick?: (conversation: Conversation) => void
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEditBlur: () => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}
