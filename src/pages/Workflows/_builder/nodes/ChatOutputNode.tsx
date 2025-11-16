import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import { renderStatusPill, formatWorkflowRunLabel } from '@/utils/workflowUtils'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  toggleNodeCollapse,
  removeNodeWithEdges,
  setNodeSelectedRun,
} from '@/redux/workflowBuilderSlice'
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
  isCollapsed?: boolean
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

export default function ChatOutputNode({ id, selected, data }: NodeProps) {
  const dispatch = useAppDispatch()
  const { executedStepNodeIds, availableRuns, selectedRunIds, currentRun } =
    useAppSelector((s) => s.workflowBuilder)
  const isOutputExecuted = executedStepNodeIds.includes(id)

  const outputData = (data as OutputData) || {}
  const response: string | null = outputData?.response ?? null
  const status = outputData?.status
  const error = outputData?.error
  const isCollapsed = outputData?.isCollapsed || false
  const [expanded, setExpanded] = useState(false)

  // Get the selected run ID for this node, default to current run
  const selectedRunId = selectedRunIds[id] || currentRun?.id
  const hasMultipleRuns = availableRuns.length > 1

  const handleRunChange = (runIdStr: string) => {
    const runId = parseInt(runIdStr, 10)
    dispatch(setNodeSelectedRun({ nodeId: id, runId }))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response || '')
    } catch {
      // no-op
    }
  }

  const hasResponse = Boolean((response || '').trim())
  const hasError = Boolean((error || '').trim())
  const widthClass = hasResponse || hasError ? 'w-[40rem]' : 'w-80'
  return (
    <Card
      className={`${widthClass} ${
        isOutputExecuted
          ? 'border-green-500/50 bg-green-50/30 dark:bg-green-950/20'
          : 'border-border'
      } ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-2'>
        <div className='space-y-2'>
          <CardTitle className='flex items-center justify-between text-sm text-card-foreground'>
            <div className='flex items-center gap-2'>
              <div className='rounded bg-primary/90 p-1'>
                <Send className='h-4 w-4 text-white' />
              </div>
              <span>Chat Output</span>
            </div>
            <div className='flex items-center gap-1'>
              {isOutputExecuted && (
                <CheckCircle2 className='h-4 w-4 text-green-500' />
              )}
              {renderStatusPill(status || null)}
              <Button
                size='sm'
                variant='ghost'
                onClick={() => dispatch(toggleNodeCollapse(id))}
                className='h-6 w-6 p-0'
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronUp className='h-4 w-4' />
                )}
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => dispatch(removeNodeWithEdges({ nodeId: id }))}
                className='h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                title='Delete node'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </CardTitle>
          {hasMultipleRuns && selectedRunId && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground'>Version:</span>
              <Select
                value={selectedRunId.toString()}
                onValueChange={handleRunChange}
              >
                <SelectTrigger className='h-7 w-full text-xs'>
                  <SelectValue placeholder='Select version' />
                </SelectTrigger>
                <SelectContent>
                  {availableRuns.map((run, index) => (
                    <SelectItem
                      key={run.id}
                      value={run.id.toString()}
                      className='text-xs'
                    >
                      {formatWorkflowRunLabel(
                        run,
                        availableRuns.length - index
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
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
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
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
              {status !== WorkflowRunStepStatus.Skipped && (
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
              )}
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>
              {status === WorkflowRunStepStatus.Running
                ? 'Generating...'
                : status === WorkflowRunStepStatus.Pending
                  ? 'Pending...'
                  : 'No output yet'}
            </p>
          )}
        </CardContent>
      )}
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
