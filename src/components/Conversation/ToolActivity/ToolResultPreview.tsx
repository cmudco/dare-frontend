import React from 'react'

import { FileText, Presentation, Search } from 'lucide-react'

import { ToolCallOrigin } from '@/utils/constants/dareTools'
import type { ToolCall } from '@/redux/types/conversation'

import { ProviderToolResultView } from './ProviderToolResultView'

interface ToolResultPreviewProps {
  toolCall: ToolCall
}

export const ToolResultPreview: React.FC<ToolResultPreviewProps> = ({
  toolCall,
}) => {
  if (toolCall.origin === ToolCallOrigin.PROVIDER && toolCall.providerResult) {
    return <ProviderToolResultView result={toolCall.providerResult} />
  }

  if (toolCall.origin === ToolCallOrigin.DARE && toolCall.dareResult) {
    const result = toolCall.dareResult
    if (result.docConfig) {
      return (
        <div className='mt-2 flex items-center gap-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
          <FileText className='h-4 w-4 shrink-0' />
          <span>
            {result.docConfig.title} · {result.docConfig.blocks.length} content
            block{result.docConfig.blocks.length === 1 ? '' : 's'}
          </span>
        </div>
      )
    }
    if (result.pptConfig) {
      return (
        <div className='mt-2 flex items-center gap-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
          <Presentation className='h-4 w-4 shrink-0' />
          <span>
            {result.pptConfig.title} · {result.pptConfig.slides.length} slide
            {result.pptConfig.slides.length === 1 ? '' : 's'}
          </span>
        </div>
      )
    }
    if (result.chartConfig) {
      return (
        <div className='mt-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
          Chart ready · {result.chartConfig.title}
        </div>
      )
    }
    if (result.mermaidCode) {
      return (
        <div className='mt-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
          Diagram ready
        </div>
      )
    }
  }

  const textContent = toolCall.mcpResult?.content
    ?.filter((item) => item.type === 'text' && item.text)
    .map((item) => item.text)
    .join('\n\n')

  if (textContent) {
    return (
      <div className='mt-2 flex items-start gap-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
        <Search className='mt-0.5 h-4 w-4 shrink-0' />
        <p className='max-h-40 overflow-auto break-words whitespace-pre-wrap'>
          {textContent}
        </p>
      </div>
    )
  }

  return null
}

export default ToolResultPreview
