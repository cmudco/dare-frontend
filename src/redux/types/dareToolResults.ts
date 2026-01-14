/**
 * DARE Tool Results Types
 *
 * TypeScript types for DARE tool execution results,
 * used for rendering charts, diagrams, and other visual outputs.
 */

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
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area'
  title: string
  data: ChartDataPoint[]
  options?: ChartOptions
}

/**
 * Result structure from DARE tool execution
 */
export interface DareToolResult {
  success: boolean
  chartConfig?: ChartConfig
  mermaidCode?: string
  error?: string
}

/**
 * Parse raw JSON result string into typed DareToolResult
 */
export function parseDareToolResult(result: string): DareToolResult | null {
  if (!result) return null

  try {
    const parsed = JSON.parse(result)
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        success: parsed.success ?? false,
        // Handle both snake_case and camelCase from backend
        chartConfig: parsed.chartConfig || parsed.chart_config,
        mermaidCode: parsed.mermaidCode || parsed.mermaid_code,
        error: parsed.error,
      }
    }
  } catch {
    // Not valid JSON
  }
  return null
}
