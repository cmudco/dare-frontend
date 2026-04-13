/**
 * DARE Tool Results Types
 *
 * TypeScript types for DARE tool execution results.
 * Clean, separate interfaces for maximum readability.
 */

import { ChartType } from '@/utils/constants/dareTools'

// ─────────────────────────────────────────────────────────────
// Chart Types
// ─────────────────────────────────────────────────────────────

/**
 * Data point for chart data series
 */
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

/**
 * Chart configuration options
 */
export interface ChartOptions {
  showLabels?: boolean
  showLegend?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

/**
 * Chart configuration returned by create_chart tool
 */
export interface ChartConfig {
  type: ChartType
  title: string
  data: ChartDataPoint[]
  options?: ChartOptions
}

// ─────────────────────────────────────────────────────────────
// Docx Types
// ─────────────────────────────────────────────────────────────

/**
 * Block types for structured Word documents
 */
export interface DocxHeadingBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4
  text: string
}

export interface DocxParagraphBlock {
  type: 'paragraph'
  text: string
  alignment?: 'left' | 'center' | 'right'
}

export interface DocxListBlock {
  type: 'list'
  ordered?: boolean
  items: string[]
}

export interface DocxTableBlock {
  type: 'table'
  headers: string[]
  rows: string[][]
}

export interface DocxBlockquoteBlock {
  type: 'blockquote'
  text: string
}

export type DocxBlock =
  | DocxHeadingBlock
  | DocxParagraphBlock
  | DocxListBlock
  | DocxTableBlock
  | DocxBlockquoteBlock

/**
 * Document configuration returned by create_docx tool
 */
export interface DocxDocumentConfig {
  title: string
  blocks: DocxBlock[]
}

// ─────────────────────────────────────────────────────────────
// DARE Tool Result
// ─────────────────────────────────────────────────────────────

/**
 * Result from DARE tool execution (create_chart, create_diagram, create_docx)
 *
 * BE sends this as a properly camelCased object.
 * Used when serverSlug === 'dare'
 */
export interface DareToolResult {
  success: boolean
  chartConfig?: ChartConfig
  mermaidCode?: string
  docConfig?: DocxDocumentConfig
  error?: string
}

// ─────────────────────────────────────────────────────────────
// MCP Tool Result
// ─────────────────────────────────────────────────────────────

/**
 * Content item from MCP tool response
 */
export interface McpToolContent {
  type: string
  text?: string
}

/**
 * Result from MCP tool execution (external tools like Slack, GitHub)
 *
 * MCP tools return content arrays with text/image responses.
 * Used when serverSlug !== 'dare'
 */
export interface McpToolResult {
  content?: McpToolContent[]
  isError?: boolean
}
