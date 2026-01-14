/**
 * DareToolResultRenderer Component
 *
 * Strategy-based component that renders DARE tool results based on tool type.
 * Maps tool names to appropriate visualizers (charts, diagrams, etc.)
 */

import React from 'react'
import { DareToolName } from '@/utils/constants/dareTools'
import { DareToolResult, ChartConfig } from '@/redux/types/dareToolResults'
import { DareChartResult } from './DareChartResult'

interface DareToolResultRendererProps {
  toolName: string
  result: DareToolResult | null // Now receives parsed object from BE
  className?: string
}

/**
 * Routes DARE tool results to the appropriate renderer based on tool name.
 *
 * Currently supports:
 * - create_chart → DareChartResult (Recharts)
 * - create_diagram → TODO: DareMermaidResult
 *
 * Returns null for unsupported tools (rendering handled elsewhere).
 */
export const DareToolResultRenderer: React.FC<DareToolResultRendererProps> = ({
  toolName,
  result,
  className = '',
}) => {
  // DEBUG: Log incoming data
  console.log('[DareToolResultRenderer] Received:', {
    toolName,
    result,
    resultType: typeof result,
    hasChartConfig: !!(result as DareToolResult)?.chartConfig,
  })

  // If no result or not successful, don't render
  if (!result || !result.success) {
    console.log(
      '[DareToolResultRenderer] Skipping render: no result or not successful'
    )
    return null
  }

  // Route to appropriate renderer based on tool name
  console.log('[DareToolResultRenderer] Routing to renderer for:', toolName)
  switch (toolName) {
    case DareToolName.CREATE_CHART:
      if (result.chartConfig) {
        console.log(
          '[DareToolResultRenderer] Rendering chart with config:',
          result.chartConfig
        )
        return (
          <DareChartResult
            chartConfig={result.chartConfig as ChartConfig}
            className={className}
          />
        )
      }
      break

    case DareToolName.CREATE_DIAGRAM:
      // TODO: Mermaid diagram support
      // For now, mermaid code is included in the message text itself
      // so it will be rendered by the existing MermaidBlock component
      break

    default:
      // Unknown tool type - no inline rendering
      console.log('[DareToolResultRenderer] Unknown tool type:', toolName)
      break
  }

  return null
}

export default DareToolResultRenderer
