import React from 'react'
import { FileText, Presentation } from 'lucide-react'
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
 * - create_docx: Renders compact document card
 * - create_pptx: Renders compact presentation card
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
      <div className='my-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
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

  // Handle docx results
  if (toolName === 'create_docx' && result.docConfig) {
    const blockCount = result.docConfig.blocks.length
    return (
      <div className='not-prose my-2 flex items-center gap-2 rounded-lg border border-border bg-muted p-3 text-sm text-foreground'>
        <FileText className='h-5 w-5 shrink-0 text-muted-foreground' />
        <span>
          {result.docConfig.title} &middot; {blockCount} block
          {blockCount !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  // Handle pptx results
  if (toolName === 'create_pptx' && result.pptConfig) {
    const slideCount = result.pptConfig.slides.length
    return (
      <div className='not-prose my-2 flex items-center gap-2 rounded-lg border border-border bg-muted p-3 text-sm text-foreground'>
        <Presentation className='h-5 w-5 shrink-0 text-muted-foreground' />
        <span>
          {result.pptConfig.title} &middot; {slideCount} slide
          {slideCount !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  // Fallback - just log and return null
  debugLog('[DareToolResultRenderer] No renderer for:', toolName)
  return null
}

export default DareToolResultRenderer
