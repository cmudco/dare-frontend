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
// DARE Tool Result
// ─────────────────────────────────────────────────────────────

/**
 * Result from DARE tool execution (create_chart, create_diagram)
 *
 * BE sends this as a properly camelCased object.
 * Used when serverSlug === 'dare'
 */
export interface DareToolResult {
  success: boolean
  chartConfig?: ChartConfig
  mermaidCode?: string
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
