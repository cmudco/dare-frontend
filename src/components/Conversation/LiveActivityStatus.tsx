import React from 'react'
import type { Message, ToolCall } from '@/redux/types/conversation'
import { ToolCallStatus } from '@/utils/constants/dareTools'
import { friendlyToolLabel } from './toolCallLabels'

const ACTIVE_TOOL_STATUSES = new Set<ToolCallStatus>([
  ToolCallStatus.PENDING,
  ToolCallStatus.EXECUTING,
  ToolCallStatus.RUNNING,
])

/** Most recently started tool call that is still executing, if any. */
const findActiveToolCall = (toolCalls?: ToolCall[]): ToolCall | undefined => {
  if (!toolCalls || toolCalls.length === 0) return undefined
  for (let i = toolCalls.length - 1; i >= 0; i--) {
    if (ACTIVE_TOOL_STATUSES.has(toolCalls[i].status)) return toolCalls[i]
  }
  return undefined
}

/**
 * Derive a human status line for an in-progress AI message from the
 * latest socket event reflected in Redux state:
 *   - an executing tool call → tool-specific label
 *   - streamed tokens present → "Writing response…"
 *   - otherwise → "Thinking…"
 */
const deriveStatusLine = (message: Message): string => {
  const activeTool = findActiveToolCall(message.mcpToolCalls)
  if (activeTool) {
    if (activeTool.toolName === 'create_document')
      return 'Rendering your document…'
    if (activeTool.toolName === 'get_spec')
      return 'Reading template requirements…'
    return `Using ${activeTool.serverSlug} · ${friendlyToolLabel(activeTool.toolName)}…`
  }
  if (message.message && message.message.trim().length > 0) {
    return 'Writing response…'
  }
  return 'Thinking…'
}

interface LiveActivityStatusProps {
  message: Message
}

/**
 * Live activity strip shown inside an in-progress AI message bubble so the
 * UI never looks hung during long tool-call gaps (e.g. document generation).
 */
export const LiveActivityStatus: React.FC<LiveActivityStatusProps> = ({
  message,
}) => (
  <div
    className='flex items-center gap-2 py-1 text-sm text-muted-foreground'
    role='status'
    aria-live='polite'
  >
    <span className='flex items-center gap-1' aria-hidden='true'>
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className='h-1.5 w-1.5 animate-pulse rounded-full bg-dare'
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
    <span>{deriveStatusLine(message)}</span>
  </div>
)

export default LiveActivityStatus
