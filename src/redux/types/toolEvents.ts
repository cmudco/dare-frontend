/**
 * Tool-loop socket event payloads
 *
 * These mirror the backend's unified tool-calling events, delivered as
 * socket.io 'message' payloads and dispatched as `socket/<type>` actions
 * by the socket middleware. All keys are camelCase (BE auto-converts),
 * `round` is 1-based.
 */

import { ToolCallOrigin, ToolCallStatus } from '@/utils/constants/dareTools'
import type { ContextTrace } from '@/redux/types/conversation'
import type {
  DareToolResult,
  McpToolResult,
  ProviderToolResult,
} from '@/redux/types/dareToolResults'

/**
 * `tool_call_pending` — the model started writing a tool call.
 */
export interface ToolCallPendingEvent {
  messageId: number | string
  toolCallId: string
  toolName: string
  serverSlug: string
  origin: ToolCallOrigin
  round: number
  status: ToolCallStatus.PENDING
}

/**
 * `tool_call_args_progress` — throttled (~400ms) progress while the model
 * streams the tool-call arguments. Only carries the character count.
 */
export interface ToolCallArgsProgressEvent {
  messageId: number | string
  toolCallId: string
  argsChars: number
}

/**
 * `tool_call_executing` — arguments are complete and the tool is running.
 */
export interface ToolCallExecutingEvent {
  messageId: number | string
  toolCallId: string
  toolName: string
  serverSlug: string
  origin: ToolCallOrigin
  round: number
  status: ToolCallStatus.EXECUTING
  arguments: Record<string, unknown>
}

/**
 * `tool_call_result` — the tool finished. Exactly one of
 * dareResult / mcpResult / providerResult is set, keyed by `origin`.
 */
export interface ToolCallResultEvent {
  messageId: number | string
  toolCallId: string
  toolName: string
  serverSlug: string
  origin: ToolCallOrigin
  round: number
  status: ToolCallStatus.COMPLETED | ToolCallStatus.FAILED
  error?: string
  dareResult?: DareToolResult
  mcpResult?: McpToolResult
  providerResult?: ProviderToolResult
}

/**
 * `tool_rounds_capped` — the tool loop hit its round cap.
 */
export interface ToolRoundsCappedEvent {
  messageId: number | string
  round: number
}

/**
 * `context_trace` — the turn's context assembly finished (sent once,
 * after preparation and before the first model round).
 */
export interface ContextTraceEvent {
  messageId: number | string
  trace: ContextTrace
}
