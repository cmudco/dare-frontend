import {
  SenderType,
  FeedbackType,
  ConversationTab,
  RagMode,
} from '@/utils/constants/conversation'
import type { RelatableStats } from '@/redux/types/billing'
import {
  ToolCallStatus,
  ToolCallOrigin,
  ToolLoopState,
  MessageContentType,
} from '@/utils/constants/dareTools'
import type {
  DareToolResult,
  McpToolResult,
  ProviderToolResult,
} from '@/redux/types/dareToolResults'
import type {
  ImageSizeType,
  ImageQualityType,
  ImageStyleType,
} from '@/utils/constants/imageGeneration'
import type { LanguageCode } from '@/utils/constants/audioTranscription'
import { MyFile, MyFolder } from './files'
import { Prompt } from './prompt'
import { Tag } from './tags'
import { SharedLibrary } from './library'
import { EffortLevel, ReasoningLevel } from '@/utils/constants/model'

/**
 * Voice recording state enum for push-to-talk voice input
 */
export enum VoiceRecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
}

// RagMode is now defined in @/utils/constants/conversation
// Re-export for backwards compatibility
export { RagMode }

export interface Conversation {
  conversationId: string
  title?: string
  createdAt: string
  user?: string
  maxContextSnippets: number
  documentSimilarityThreshold: number
  ragMode?: RagMode
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
  selectedLibraryIds?: number[]
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

/** One decision the memory writer made about this turn, as the ledger records it. */
export interface MemoryWriteChange {
  /** What was actually done: add_fact, supersede, patch_user, ignore, edit… */
  action: string
  /** What the writer asked for. Differs from `action` when the gate intervened. */
  proposedAction: string
  applied: boolean
  reason: string
  note?: string | null
  detail: string
  recordId?: string | null
}

/**
 * What the writer decided after the reply finished.
 *
 * It runs in a background job on a closed turn, so this arrives seconds late
 * over the socket and is also stored on the message — a reload still shows it.
 */
export interface MemoryWriteData {
  created: number
  retired: number
  reinforced: number
  profileChanged: boolean
  /** How many decisions were weighed, including the ones that were refused. */
  considered: number
  changes: MemoryWriteChange[]
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
  memoryWriteData?: MemoryWriteData | null
  feedbackType?: FeedbackType | null
  feedbackText?: string
  feedbackSource?: string
  isEdited?: boolean
  isRegenerated?: boolean
  originalMessage?: string
  cost?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  usageDetails?: MessageUsageDetail[] | null
  /** Provider-generated summarized thinking; never raw hidden chain-of-thought. */
  thinkingSummary?: string | null
  energyWh?: string | null
  carbonG?: string | null
  waterMl?: string | null
  energyStats?: RelatableStats | null
  generatedImage?: GeneratedImage
  generatedTranscription?: GeneratedTranscription
  artifactId?: number
  artifactIds?: number[]
  toolCalls?: ToolCall[]
  toolLoopState?: ToolLoopState
  toolLoopNotice?: string
  contentType?: MessageContentType
  contentMetadata?: Record<string, unknown>
  /**
   * Per-stage RAG pipeline trace, when retrieval ran with tracing enabled.
   * A single trace when one source was searched; an envelope with one trace
   * per source (documents, shared libraries) when several were.
   */
  retrievalTrace?: RetrievalTrace | RetrievalTraceEnvelope | null
  /**
   * Timed context-assembly trace for the turn: what went into the prompt
   * (files, retrieval, memory, history, …) before the model started
   * answering. Arrives live as a `context_trace` socket event and persists
   * on the message for refresh.
   */
  contextTrace?: ContextTrace | null
}

export type EstimatedUsageField = 'inputTokens' | 'outputTokens'

export interface MessageUsageDetail {
  round: number
  inputTokens: number
  outputTokens: number
  thinkingTokens?: number
  visibleOutputTokens?: number
  cachedInputTokens?: number
  cacheWriteInputTokens?: number
  estimated?: boolean
  estimatedFields?: EstimatedUsageField[]
  stopReason?: string
  requestMaxTokens?: number
  effort?: EffortLevel
  thinkingSummary?: string
  cost?: number
}

/** Multiple traces on one message — one per retrieval source. */
export interface RetrievalTraceEnvelope {
  traces: RetrievalTrace[]
}

/** Normalize a message's trace payload to a list of traces. */
export const retrievalTraces = (
  payload: RetrievalTrace | RetrievalTraceEnvelope | null | undefined
): RetrievalTrace[] => {
  if (!payload) return []
  return 'traces' in payload ? payload.traces : [payload]
}

/** One chunk as it appeared at a single RAG pipeline stage. */
export interface RetrievalTraceEntry {
  sourceRef: string
  chunkIndex: number
  score: number
  rank: number
  /** Rank at the previous stage, for showing rank movement (null if new/unranked). */
  prevRank: number | null
  preview: string
}

/** How an answer was retrieved, stage by stage (matches backend RetrievalTrace.to_payload). */
export interface RetrievalTrace {
  /** Which corpus this trace covers: 'documents' | 'libraries' (absent on older traces). */
  source?: string
  query: string
  queryAnalysis: {
    intent: string
    keywords: string[]
    /** Cleaned, disambiguated restatement embedded for the dense leg. */
    rewrittenQuery?: string
    /** HyDE: a hypothetical answer embedded instead of the bare question. */
    hydePassage?: string
  } | null
  hybrid: { poolSize: number; topCandidates: RetrievalTraceEntry[] }
  rerank: { applied: boolean; results: RetrievalTraceEntry[] }
  mmr: { applied: boolean; reason: string }
  grounding: {
    answerFound: boolean
    topScore: number
    threshold: number
  } | null
  finalSize: number
}

/** One timed stage of a turn's context assembly. */
export interface ContextTraceStage {
  kind:
    | 'prompt'
    | 'referencedConversations'
    | 'summaries'
    | 'files'
    | 'retrieval'
    | 'memory'
    | 'history'
    | 'media'
    | 'tools'
  ms: number
  /** Generic item count (referenced conversations, memories, media, tools). */
  count?: number
  /** Injected characters (prompt, referenced conversations). */
  chars?: number
  /** History: turns kept after filtering, and the configured limit. */
  turns?: number
  limit?: number | null
  /** Files read in full. */
  files?: { name: string; chars: number }[]
  /** Retrieval: settings used and the per-source pipeline traces. */
  mode?: string
  threshold?: number
  topK?: number
  injectedBlocks?: number
  sources?: RetrievalTrace[]
  /** Naive mode: kept snippets (no pipeline trace exists to embed). */
  snippets?: { ref: string; score: number; preview: string }[]
}

/** How the turn's prompt was assembled, stage by stage. */
export interface ContextTrace {
  totalMs: number
  stages: ContextTraceStage[]
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
  origin: ToolCallOrigin

  /** Current execution status */
  status: ToolCallStatus

  /** 1-based tool-loop round this call belongs to */
  round: number

  /** Characters of arguments streamed so far (live, while status is pending) */
  argsChars?: number

  /** Final parsed arguments the tool was invoked with */
  arguments?: Record<string, unknown>

  /** Result from DARE internal tools */
  dareResult?: DareToolResult

  /** Result from MCP external tools */
  mcpResult?: McpToolResult

  /** Result from provider-native tools (for example Anthropic web_fetch) */
  providerResult?: ProviderToolResult

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
  supportsVision: boolean
  defaultEffort: EffortLevel
  defaultAdaptiveThinkingEnabled: boolean
  isImageGenerator?: boolean
  isAudioTranscriber?: boolean
  inputTokenRatePerMillion: number | null
  outputTokenRatePerMillion: number | null
  tier: string | null
  reasoningLevel: ReasoningLevel
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
  reasoningLevel: ReasoningLevel
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
  /** Null for shared-library snippets (use library + sourceRef instead). */
  file: MyFile | null
  library?: { id: number; name: string; slug: string } | null
  sourceRef?: string
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
  selectedLibraries: SharedLibrary[]
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
