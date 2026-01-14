/**
 * DareToolResultRenderer Component
 *
 * Strategy-based component that renders DARE tool results based on tool type.
 * Maps tool names to appropriate visualizers (charts, diagrams, etc.)
 */

import React from 'react'
import { parseDareToolResult } from '@/redux/types/dareToolResults'
import { DareChartResult } from './DareChartResult'

interface DareToolResultRendererProps {
  toolName: string
  result: string // Raw JSON string from tool call
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
  const parsedResult = parseDareToolResult(result)

  // If parsing failed or not successful, don't render
  if (!parsedResult || !parsedResult.success) {
    return null
  }

  // Route to appropriate renderer based on tool name
  switch (toolName) {
    case 'create_chart':
      if (parsedResult.chartConfig) {
        return (
          <DareChartResult
            chartConfig={parsedResult.chartConfig}
            className={className}
          />
        )
      }
      break

    case 'create_diagram':
      // TODO: Mermaid diagram support
      // For now, mermaid code is included in the message text itself
      // so it will be rendered by the existing MermaidBlock component
      break

    default:
      // Unknown tool type - no inline rendering
      break
  }

  return null
}

export default DareToolResultRenderer
