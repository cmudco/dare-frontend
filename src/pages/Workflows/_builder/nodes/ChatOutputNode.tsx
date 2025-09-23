import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import { CodeBlock } from '@/components/Conversation/CodeBlock'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'
import mermaid from 'mermaid'

type OutputData = {
  response?: string
  status?: string
  stepNumber?: number
  error?: string
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

export default function ChatOutputNode({ selected, data }: NodeProps) {
  const outputData = (data as OutputData) || {}
  const response: string | null = outputData?.response ?? null
  const status = outputData?.status
  const error = outputData?.error
  const [expanded, setExpanded] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response || '')
    } catch {
      // no-op
    }
  }

  // Render status pill for the output
  const renderStatusPill = () => {
    if (!status) return null

    const getStatusIcon = () => {
      switch (status) {
        case WorkflowRunStepStatus.Pending:
          return <Clock className='h-3 w-3' />
        case WorkflowRunStepStatus.Running:
          return <Loader2 className='h-3 w-3 animate-spin' />
        case WorkflowRunStepStatus.Completed:
          return <CheckCircle className='h-3 w-3' />
        case WorkflowRunStepStatus.Failed:
          return <XCircle className='h-3 w-3' />
        default:
          return null
      }
    }

    const getStatusColor = () => {
      switch (status) {
        case WorkflowRunStepStatus.Pending:
          return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        case WorkflowRunStepStatus.Running:
          return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
        case WorkflowRunStepStatus.Completed:
          return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
        case WorkflowRunStepStatus.Failed:
          return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
        default:
          return 'bg-muted text-muted-foreground border-border'
      }
    }

    return (
      <div
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className='capitalize'>{status}</span>
      </div>
    )
  }

  const hasResponse = Boolean((response || '').trim())
  const hasError = Boolean((error || '').trim())
  const widthClass = hasResponse || hasError ? 'w-[40rem]' : 'w-80'
  return (
    <Card
      className={`${widthClass} border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between text-sm text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='rounded bg-primary/90 p-1'>
              <Send className='h-4 w-4 text-white' />
            </div>
            Chat Output
          </div>
          {renderStatusPill()}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {error ? (
          <div className='text-xs text-destructive'>
            <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3'>
              <p className='font-medium'>Error:</p>
              <p className='mt-1 whitespace-pre-wrap'>{error}</p>
            </div>
          </div>
        ) : response ? (
          <div className='text-xs text-foreground'>
            <div
              className={`${
                expanded ? 'max-h-[48rem]' : 'max-h-40'
              } overflow-y-auto pr-2 leading-relaxed`}
              onWheel={(e) => e.stopPropagation()}
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ overscrollBehavior: 'contain' }}
            >
              <div
                className='prose prose-sm max-w-full text-foreground dark:prose-invert prose-code:bg-transparent prose-code:p-0 prose-code:shadow-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none'
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                  components={{
                    table({ children, ...props }) {
                      return (
                        <div className='max-w-full overflow-x-auto'>
                          <table className='min-w-full' {...props}>
                            {children}
                          </table>
                        </div>
                      )
                    },
                    pre({ children, ...props }) {
                      return (
                        <pre
                          className='max-w-full overflow-x-auto whitespace-pre-wrap break-words'
                          {...props}
                        >
                          {children}
                        </pre>
                      )
                    },
                    p({ children, ...props }) {
                      return (
                        <p
                          className='break-words'
                          style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                          {...props}
                        >
                          {children}
                        </p>
                      )
                    },
                    a({ children, href, ...props }) {
                      return (
                        <a
                          href={href}
                          className='break-all'
                          style={{
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                          }}
                          {...props}
                        >
                          {children}
                        </a>
                      )
                    },
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      if (match && match[1] === 'mermaid') {
                        return (
                          <MermaidBlock
                            code={String(children).trim()}
                            streaming={false}
                          />
                        )
                      }
                      if (match) {
                        return (
                          <CodeBlock className={className} props={props}>
                            {children}
                          </CodeBlock>
                        )
                      }
                      return (
                        <code
                          className='not-prose break-all rounded border border-border bg-muted px-1 text-foreground transition-colors hover:bg-muted/80'
                          style={{
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
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
          <p className='text-xs text-muted-foreground'>
            {status === WorkflowRunStepStatus.Running
              ? 'Generating response...'
              : status === WorkflowRunStepStatus.Pending
                ? 'Waiting to start...'
                : 'Awaiting response...'}
          </p>
        )}
      </CardContent>
      <Handle
        type='target'
        position={Position.Left}
        className='h-4 w-4 bg-secondary'
      />
      <Handle
        type='source'
        position={Position.Right}
        className='h-4 w-4 border-2 border-white bg-primary'
      />
    </Card>
  )
}
