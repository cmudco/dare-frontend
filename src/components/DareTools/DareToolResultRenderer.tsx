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
import { DareMermaidResult } from './DareMermaidResult'

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
 * - create_diagram → DareMermaidResult (Mermaid)
 *
 * Returns null for unsupported tools (rendering handled elsewhere).
 */
export const DareToolResultRenderer: React.FC<DareToolResultRendererProps> = ({
  toolName,
  result,
  className = '',
}) => {
  // If no result or not successful, don't render
  if (!result || !result.success) {
    return null
  }
  switch (toolName) {
    case DareToolName.CREATE_CHART:
      if (result.chartConfig) {
        return (
          <DareChartResult
            chartConfig={result.chartConfig as ChartConfig}
            className={className}
          />
        )
      }
      break

    case DareToolName.CREATE_DIAGRAM:
      if (result.mermaidCode) {
        return (
          <DareMermaidResult
            mermaidCode={result.mermaidCode}
            className={className}
          />
        )
      }
      break

    default:
      break
  }

  return null
}

export default DareToolResultRenderer
