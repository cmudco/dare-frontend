import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Send } from 'lucide-react'
import { useState } from 'react'

type OutputData = { response?: string }
export default function ChatOutputNode({ selected, data }: NodeProps) {
  const response: string | null = (data as OutputData)?.response ?? null
  const [expanded, setExpanded] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response || '')
    } catch {
      // no-op
    }
  }

  const hasResponse = Boolean((response || '').trim())
  const widthClass = hasResponse ? 'w-[40rem]' : 'w-80'
  return (
    <Card
      className={`${widthClass} border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-sm text-card-foreground'>
          <div className='rounded bg-primary/90 p-1'>
            <Send className='h-4 w-4 text-white' />
          </div>
          Chat Output
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {response ? (
          <div className='text-xs text-foreground'>
            {expanded ? (
              <div
                className='max-h-[48rem] overflow-y-auto whitespace-pre-wrap pr-2 leading-relaxed'
                onWheel={(e) => e.stopPropagation()}
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                style={{ overscrollBehavior: 'contain' }}
              >
                {response}
              </div>
            ) : (
              <div
                className='max-h-40 overflow-y-auto whitespace-pre-wrap pr-2 leading-relaxed'
                onWheel={(e) => e.stopPropagation()}
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                style={{ overscrollBehavior: 'contain' }}
              >
                {response}
              </div>
            )}
            <div className='mt-2 flex items-center justify-end gap-2'>
              <Button
                size='sm'
                variant='ghost'
                className='h-7 px-2 text-xs'
                onMouseDown={(e) => e.stopPropagation()}
                onClick={copyToClipboard}
              >
                Copy
              </Button>
              <Button
                size='sm'
                variant='ghost'
                className='h-7 px-2 text-xs'
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className='mr-1 h-3 w-3' />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className='mr-1 h-3 w-3' />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className='text-xs text-muted-foreground'>Awaiting response...</p>
        )}
      </CardContent>
      <Handle
        type='target'
        position={Position.Left}
        className='h-3 w-3 bg-secondary'
      />
      <Handle
        type='source'
        position={Position.Right}
        className='h-3 w-3 border-2 border-white bg-primary'
      />
    </Card>
  )
}
