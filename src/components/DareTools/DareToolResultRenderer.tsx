import React from 'react'
import { ChartRenderer, MermaidRenderer } from '../Artifacts/renderers'
import { debugLog } from '@/utils/debugLogger'
import type { DareToolResult } from '@/redux/types/dareToolResults'

interface DareToolResultRendererProps {
  toolName: string
  result: DareToolResult | null
}

/**
 * DareToolResultRenderer - Renders DARE tool results inline in messages
 *
 * Handles:
 * - create_chart: Renders chart using ChartRenderer
 * - create_diagram: Renders Mermaid diagram using MermaidRenderer
 */
export const DareToolResultRenderer: React.FC<DareToolResultRendererProps> = ({
  toolName,
  result,
}) => {
  debugLog('[DareToolResultRenderer] Rendering:', { toolName, result })

  if (!result) {
    return null
  }

  if (!result.success) {
    return (
      <div className='my-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
        Error: {result.error || 'Unknown error'}
      </div>
    )
  }

  // Handle chart results
  if (toolName === 'create_chart' && result.chartConfig) {
    // Transform to ChartConfig format expected by ChartRenderer
    const chartData = result.chartConfig.data || []
    const config = {
      type: result.chartConfig.type as 'bar' | 'line' | 'pie' | 'area',
      title: result.chartConfig.title,
      data: chartData.map((d) => ({ label: d.label, value: d.value })),
      dataKeys: ['value'],
      xAxisKey: 'label',
      ...result.chartConfig.options,
    }
    return (
      <div className='not-prose my-4 h-80'>
        <ChartRenderer config={config} />
      </div>
    )
  }

  // Handle diagram results
  if (toolName === 'create_diagram' && result.mermaidCode) {
    return (
      <div className='not-prose my-4 h-80'>
        <MermaidRenderer code={result.mermaidCode} />
      </div>
    )
  }

  // Fallback - just log and return null
  debugLog('[DareToolResultRenderer] No renderer for:', toolName)
  return null
}

export default DareToolResultRenderer
