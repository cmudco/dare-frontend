import { Maximize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface OutputNodeContentProps {
  response: string
  onOpenFullView: (e: React.MouseEvent) => void
}

export function OutputNodeContent({
  response,
  onOpenFullView,
}: OutputNodeContentProps) {
  return (
    <div className='border-t border-border/30'>
      <div
        className='nowheel max-h-[500px] overflow-y-auto px-3 py-2'
        onWheel={(e) => e.stopPropagation()}
      >
        <div className='prose prose-sm max-w-full text-foreground dark:prose-invert prose-headings:my-2 prose-p:my-1'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
        </div>
      </div>
      <div className='flex justify-end border-t border-border/30 px-3 py-1.5'>
        <button
          className='flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          onClick={onOpenFullView}
          title='Open full view'
        >
          <Maximize2 size={12} />
          <span>Full view</span>
        </button>
      </div>
    </div>
  )
}
