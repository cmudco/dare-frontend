/**
 * DARE Tools types for Redux state management
 */

import {
  DareToolCategory,
  MessageContentType,
  ChartType,
} from '@/utils/constants/dareTools'

// Re-export for backwards compatibility
export { DareToolCategory, MessageContentType }

/**
 * DARE Tool - Internal tool definition
 */
export interface DareTool {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  category: DareToolCategory
  functionName: string
  isActive: boolean
  createdAt: string
}

/**
 * DARE Tool Execution - Audit record for tool executions
 */
export interface DareToolExecution {
  id: number
  toolName: string
  toolSlug: string
  toolCallId: string
  arguments: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: Record<string, unknown> | null
  errorMessage: string
  executionTimeMs: number | null
  createdAt: string
}

/**
 * DARE Tools Redux state
 * Note: Tool selection is managed in conversationSlice (activeConversation.selectedDareToolSlugs)
 */
export interface DareToolsState {
  tools: DareTool[]
  loading: boolean
  error: string | null
}

/**
 * Content metadata for specialized rendering
 */
export interface ContentMetadata {
  // For mermaid diagrams
  mermaidCode?: string
  diagramType?: 'flowchart' | 'sequence' | 'class' | 'state' | 'mindmap'

  // For charts
  chartConfig?: Record<string, unknown>
  chartType?: ChartType

  // For images
  imageUrl?: string
  altText?: string

  // For audio
  audioUrl?: string
  transcript?: string
}
