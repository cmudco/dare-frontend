import { z } from 'zod'

export const CHAT_SOCKET_PATH = '/socket.io/'
export const CHAT_SOCKET_NAMESPACE = '/chat'
export const CHAT_TRANSPORTS = ['websocket', 'polling'] as const
export type MessageId = string | number
export type RagMode = 'naive' | 'advanced' | 'agentic'
export type ChatSocketAuth =
  | { token: string }
  | { sessionId: string; conversationId: string }
export interface SocketResponse {
  success?: boolean
  error?: string
  conversationId?: string
}
export interface BotMeta {
  title?: string
  subject?: string
  topic?: string
  chat_prompt?: string
  tracking_prompt?: string
  learning_goals?: string
}
/** Wire generation options use snake_case; routing uses conversationId. */
export interface ChatSendOptions {
  message?: string
  sender_type?: number
  model_id?: string | null
  prompt_id?: number
  temperature?: number
  effort?: string | null
  max_tokens?: number
  file_ids?: number[]
  embedding_ids?: number[]
  file_owner_id?: number
  media_ids?: number[]
  tag_ids?: number[]
  folder_ids?: number[]
  library_ids?: number[]
  rag_mode?: RagMode
  max_context_snippets?: number
  document_similarity_threshold?: number
  history_limit?: number
  use_memory?: boolean
  referenced_conversation_ids?: string[]
  referenced_conversation_history_limit?: number
  referenced_summary_ids?: number[]
  web_search_enabled?: boolean
  web_fetch_enabled?: boolean
  image_generation_enabled?: boolean
  image_generation_settings?: unknown
  audio_transcription_enabled?: boolean
  audio_transcription_settings?: unknown
  images?: unknown[]
  artifacts_enabled?: boolean
  artifact_action?: string
  active_artifact_id?: string | number | null
  mcp_server_ids?: number[]
  dare_tool_slugs?: string[]
  ensemble?: unknown
  enable_progress?: boolean
  is_advanced?: boolean
  progress_llm_id?: string | null
  bot_meta?: BotMeta
}
export interface ChatSendPayload extends ChatSendOptions {
  conversationId: string
}
export interface ChatClientEvents {
  subscribe_conversation: (
    data: { conversationId: string },
    callback: (response: SocketResponse) => void
  ) => void
  unsubscribe_conversation: (
    data: { conversationId: string },
    callback: (response: SocketResponse) => void
  ) => void
  send_message: (
    data: ChatSendPayload,
    callback: (response: SocketResponse) => void
  ) => void
  stop_generation: (
    data: { conversationId: string; messageId?: MessageId },
    callback: (response: SocketResponse) => void
  ) => void
  edit_message: (
    data: { conversationId: string; messageId: MessageId; message: string },
    callback: (response: SocketResponse) => void
  ) => void
  regenerate_response: (
    data: ChatSendPayload & { message_id: MessageId },
    callback: (response: SocketResponse) => void
  ) => void
}
/** Unknown extension fields are retained for independently shipped DARE features. */
export interface ChatWireMessage {
  type: string
  id?: MessageId
  messageId?: MessageId
  conversationId?: string
  message?: string
  senderType?: number
  senderName?: string
  sender?: string
  streaming?: boolean
  isComplete?: boolean
  regenerate?: boolean
  date?: string
  createdAt?: string
  llm?: number | null
  llmId?: number
  litellmModelName?: string | null
  cost?: string | number | null
  inputTokens?: number | null
  outputTokens?: number | null
  errorCode?: string
  errorMessage?: string
  [key: string]: unknown
}
export interface ChatServerEvents {
  message: (data: ChatWireMessage) => void
}

export function createChatSendPayload(
  conversationId: string,
  options: ChatSendOptions
): ChatSendPayload {
  return { ...options, conversationId }
}
export function normalizeMessageId(id: MessageId): string {
  return String(id)
}

const id = z.union([z.string().min(1), z.number().int().nonnegative()])
const envelope = z
  .object({ type: z.string().min(1), conversationId: z.string().optional() })
  .passthrough()
const usage = {
  cost: z.union([z.string(), z.number()]).nullish(),
  inputTokens: z.number().nullish(),
  outputTokens: z.number().nullish(),
}
const message = envelope.extend({
  id,
  message: z.string().nullish(),
  senderType: z.number().optional(),
  streaming: z.boolean().optional(),
  isComplete: z.boolean().optional(),
  regenerate: z.boolean().optional(),
  ...usage,
})
const history = z
  .object({
    id,
    message: z.string().nullish(),
    senderType: z.number(),
    ...usage,
  })
  .passthrough()
const tool = envelope.extend({
  messageId: id,
  toolCallId: z.string(),
  toolName: z.string().optional(),
})
export const chatEventSchemas = {
  conversation_history: envelope.extend({
    conversationHistory: z.array(history),
  }),
  message,
  ai_stream: message,
  edit_message: message,
  regenerate_response: message,
  stream_chunk: envelope.extend({ messageId: id, chunk: z.string() }),
  stream_end: envelope.extend({ messageId: id }),
  tool_call_pending: tool,
  tool_call_args_progress: tool.extend({ argsChars: z.number().optional() }),
  tool_call_executing: tool,
  tool_call_result: tool.extend({
    status: z.string(),
    error: z.string().nullish(),
  }),
  tool_rounds_capped: envelope.extend({ messageId: id }),
  context_trace: envelope.extend({
    messageId: id,
    trace: z.record(z.string(), z.unknown()),
  }),
  progress_start: envelope,
  progress_stream: envelope.extend({ chunk: z.string() }),
  progress_token: envelope.extend({ token: z.string() }),
  progress_complete: envelope,
  progress_end: envelope,
  progress_error: envelope,
  latest_progress: envelope.extend({
    assessment: z
      .object({ content: z.string().nullish() })
      .passthrough()
      .nullish(),
  }),
  error: envelope,
}

export type ChatEventType = keyof typeof chatEventSchemas

function normalizeFields(data: { [key: string]: unknown }): {
  [key: string]: unknown
} {
  const normalized = { ...data }
  if (normalized.senderName == null && typeof normalized.sender === 'string')
    normalized.senderName = normalized.sender
  if (normalized.message === null) normalized.message = ''
  if (normalized.type === 'ai_stream')
    normalized.streaming =
      normalized.isComplete === true ? false : (normalized.streaming ?? true)
  return normalized
}
export type ChatParseResult =
  | { success: true; data: ChatWireMessage }
  | { success: false; issues: string[] }
/** Validate once at transport ingress, preserving IDs, decimal costs and extension fields. */
export function parseChatEvent(raw: unknown): ChatParseResult {
  const base = envelope.safeParse(raw)
  if (!base.success)
    return {
      success: false,
      issues: base.error.issues.map((issue) => issue.message),
    }
  const parsed = (
    chatEventSchemas[base.data.type as ChatEventType] ?? envelope
  ).safeParse(raw)
  if (!parsed.success)
    return {
      success: false,
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      ),
    }
  const data = normalizeFields(parsed.data as { [key: string]: unknown })
  if (
    data.type === 'conversation_history' &&
    Array.isArray(data.conversationHistory)
  ) {
    data.conversationHistory = data.conversationHistory.map(normalizeFields)
  }
  return { success: true, data: data as ChatWireMessage }
}
