/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Features:
 * - Live streaming LLM responses during execution with markdown rendering
 * - Rich content display: snippets, web search sources, code blocks
 * - Human validation UI when required
 * - Connection status indicator
 */

import { useRef, useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  Loader2,
  CheckCircle,
  Wifi,
  WifiOff,
  X,
  Play,
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  setShowExecutionPanel,
  clearStreamingResponses,
} from '@/redux/workflowBuilderSlice'
import { workflowSocketSubmitValidation } from '@/redux/middleware/workflowSocketMiddleware'
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
import type { StreamingResponse } from '@/redux/types/workflowBuilder'

export default function WorkflowExecutionPanel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  // Get execution state from Redux
  const {
    currentRun,
    isRunning,
    streamingResponses,
    activeStreamingNodeId,
    wsConnectionStatus,
    pendingValidation,
    nodes,
  } = useAppSelector((state) => state.workflowBuilder)

  // Close panel handler
  const handleClose = () => {
    dispatch(setShowExecutionPanel(false))
    dispatch(clearStreamingResponses())
  }

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (scrollRef.current && activeStreamingNodeId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [streamingResponses, activeStreamingNodeId])

  // Get node name by id
  const getNodeName = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    return (node?.data?.label as string) || node?.type || 'Step'
  }

  // Check if we have any streaming data to show
  const hasStreamingData = Object.keys(streamingResponses).length > 0

  // Sort streaming responses by step order (based on node position in workflow)
  const sortedResponses = Object.entries(streamingResponses).sort(
    ([idA], [idB]) => {
      const nodeA = nodes.find((n) => n.id === idA)
      const nodeB = nodes.find((n) => n.id === idB)
      const stepA = (nodeA?.data?.stepNumber as number) || 0
      const stepB = (nodeB?.data?.stepNumber as number) || 0
      return stepA - stepB
    }
  ) as [string, StreamingResponse][]

  return (
    <div className='absolute right-0 top-0 z-20 flex h-full min-w-96 max-w-[50vw] flex-col border-l border-border/50 bg-white/95 shadow-lg backdrop-blur-sm'>
      {/* Header with connection status and close button */}
      <div className='flex items-center justify-between border-b border-border p-4'>
        <div>
          <h3 className='font-semibold text-foreground'>Execution Preview</h3>
          <p className='text-xs text-muted-foreground'>
            {isRunning
              ? activeStreamingNodeId
                ? 'Streaming response...'
                : 'Workflow running...'
              : pendingValidation
                ? 'Awaiting validation'
                : 'Ready'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            {wsConnectionStatus === 'connected' ? (
              <Wifi className='h-4 w-4 text-green-500' />
            ) : wsConnectionStatus === 'connecting' ? (
              <Loader2 className='h-4 w-4 animate-spin text-yellow-500' />
            ) : (
              <WifiOff className='h-4 w-4 text-gray-400' />
            )}
            <span className='text-xs text-muted-foreground'>
              {wsConnectionStatus === 'connected'
                ? 'Live'
                : wsConnectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Offline'}
            </span>
          </div>
          <Button variant='ghost' size='sm' onClick={handleClose}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Execution log - scrollable */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4'>
        {/* Human Validation UI */}
        {pendingValidation && (
          <ValidationPanel
            validation={pendingValidation}
            workflowRunId={currentRun?.id}
            nodeName={getNodeName(pendingValidation.nodeId)}
          />
        )}

        {/* Empty state */}
        {!hasStreamingData && !pendingValidation && !isRunning && (
          <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
            <div className='mb-2'>
              <Play className='h-12 w-12 opacity-30' />
            </div>
            <p className='text-sm'>Preview your workflow</p>
            <p className='text-xs'>Click Run to see execution in real-time</p>
          </div>
        )}

        {/* Running but no data yet */}
        {isRunning &&
          !hasStreamingData &&
          !activeStreamingNodeId &&
          !pendingValidation && (
            <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
              <Loader2 className='mb-2 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-sm'>Starting workflow...</p>
            </div>
          )}

        {/* Streaming responses */}
        {hasStreamingData && (
          <div className='space-y-4'>
            {sortedResponses.map(([nodeId, streamingData]) => {
              const isActive = activeStreamingNodeId === nodeId
              const nodeName = getNodeName(nodeId)
              const content = streamingData.content
              const snippets = streamingData.snippets
              const webSearchSources = streamingData.webSearchSources

              return (
                <StepResponseCard
                  key={nodeId}
                  nodeId={nodeId}
                  nodeName={nodeName}
                  content={content}
                  isActive={isActive}
                  snippets={snippets}
                  webSearchSources={webSearchSources}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with run info */}
      {currentRun && (
        <div className='border-t border-border p-3'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>Run #{currentRun.id}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                currentRun.status === 'completed' &&
                  'bg-green-100 text-green-700',
                currentRun.status === 'running' && 'bg-blue-100 text-blue-700',
                currentRun.status === 'failed' && 'bg-red-100 text-red-700',
                currentRun.status === 'pending_human_input' &&
                  'bg-yellow-100 text-yellow-700'
              )}
            >
              {currentRun.status}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ValidationPanel - Human-in-the-loop validation UI
 */
interface ValidationPanelProps {
  validation: {
    nodeId: string
    routes: Array<{ name: string; description?: string }>
    context?: Record<string, unknown>
    aiRecommendation?: string
  }
  workflowRunId?: number
  nodeName: string
}

function ValidationPanel({
  validation,
  workflowRunId,
  nodeName,
}: ValidationPanelProps) {
  const dispatch = useAppDispatch()
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!selectedRoute || !workflowRunId) return

    setIsSubmitting(true)
    dispatch(
      workflowSocketSubmitValidation({
        workflowRunId,
        nodeId: validation.nodeId,
        selectedRoute,
        continueExecution: true,
      })
    )
  }

  return (
    <div className='mb-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400'>
          <span className='text-xs font-bold text-yellow-900'>?</span>
        </div>
        <span className='font-medium text-yellow-900'>
          Human Validation Required
        </span>
      </div>

      <p className='mb-3 text-sm text-yellow-800'>
        The workflow is waiting for your decision at <strong>{nodeName}</strong>
        . Please select a route to continue.
      </p>

      {validation.aiRecommendation && (
        <div className='mb-3 rounded bg-yellow-100 p-2 text-xs text-yellow-800'>
          <strong>AI Recommendation:</strong> {validation.aiRecommendation}
        </div>
      )}

      <div className='mb-4 space-y-2'>
        {validation.routes.map((route) => (
          <button
            key={route.name}
            onClick={() => setSelectedRoute(route.name)}
            className={cn(
              'w-full rounded-lg border p-3 text-left transition-all',
              selectedRoute === route.name
                ? 'border-yellow-500 bg-yellow-100'
                : 'border-yellow-200 bg-white hover:border-yellow-400'
            )}
          >
            <div className='font-medium text-gray-900'>{route.name}</div>
            {route.description && (
              <div className='text-xs text-gray-600'>{route.description}</div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedRoute || isSubmitting}
        className='w-full'
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Submitting...
          </>
        ) : (
          'Continue Workflow'
        )}
      </Button>
    </div>
  )
}

/**
 * StepResponseCard - Individual step response with rich content rendering
 */
interface StepResponseCardProps {
  nodeId: string
  nodeName: string
  content: string
  isActive: boolean
  snippets?: Array<{
    id: number
    file: { id: number; name: string } | null
    text: string
    similarity_score: number
    chunk_index: number
    vector_db_source: string
  }>
  webSearchSources?: Array<{
    id: number
    url: string
    title: string
    cited_text: string
    page_age?: string
    provider: string
  }>
}

function StepResponseCard({
  nodeName,
  content,
  isActive,
  snippets,
  webSearchSources,
}: StepResponseCardProps) {
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  const [webSourcesOpen, setWebSourcesOpen] = useState(false)

  const hasSnippets = snippets && snippets.length > 0
  const hasWebSources = webSearchSources && webSearchSources.length > 0

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all',
        isActive && 'border-blue-200 bg-blue-50/50',
        !isActive && content && 'border-green-200 bg-green-50/50'
      )}
    >
      {/* Step header */}
      <div className='mb-2 flex items-center gap-2'>
        {isActive ? (
          <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
        ) : (
          <CheckCircle className='h-4 w-4 text-green-500' />
        )}
        <span className='text-sm font-medium'>{nodeName}</span>
        {isActive && (
          <span className='text-xs text-blue-600'>Streaming...</span>
        )}
      </div>

      {/* Response content with markdown */}
      {content && (
        <div className='mt-2 rounded bg-white/80 p-2'>
          <div className='prose prose-sm max-w-full text-gray-700 dark:prose-invert prose-code:bg-transparent prose-code:p-0 prose-pre:bg-transparent prose-pre:p-0'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
              components={{
                table({ children, ...props }) {
                  return (
                    <div className='max-w-full overflow-x-auto'>
                      <table className='min-w-full text-xs' {...props}>
                        {children}
                      </table>
                    </div>
                  )
                },
                pre({ children, ...props }) {
                  return (
                    <pre
                      className='max-w-full overflow-x-auto whitespace-pre-wrap break-words text-xs'
                      {...props}
                    >
                      {children}
                    </pre>
                  )
                },
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (match && match[1] === 'mermaid') {
                    return (
                      <MermaidBlock
                        code={String(children).trim()}
                        streaming={isActive}
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
                      className='not-prose break-all rounded border border-border bg-muted px-1 text-xs text-foreground'
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {isActive && <span className='animate-pulse text-blue-500'>|</span>}
          </div>
        </div>
      )}

      {/* Citations - only show when step is complete (not streaming) */}
      {!isActive && (hasSnippets || hasWebSources) && (
        <div className='mt-3 space-y-2'>
          {/* Context Snippets */}
          {hasSnippets && (
            <Collapsible open={snippetsOpen} onOpenChange={setSnippetsOpen}>
              <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md border border-border bg-muted/50 px-2 py-1.5 text-xs transition-colors hover:bg-accent'>
                <span className='flex items-center font-medium text-foreground'>
                  <FileText className='mr-1.5 h-3 w-3' />
                  Context ({snippets!.length})
                </span>
                {snippetsOpen ? (
                  <ChevronUp className='h-3 w-3 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-3 w-3 text-muted-foreground' />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className='space-y-1.5 pt-1.5'>
                {[...snippets!]
                  .sort(
                    (a, b) =>
                      (b.similarity_score || 0) - (a.similarity_score || 0)
                  )
                  .map((snippet) => (
                    <div
                      key={snippet.id}
                      className='rounded-r-md border-l-2 border-border bg-white p-1.5 pl-2 text-xs'
                    >
                      <div className='mb-0.5 flex items-center justify-between'>
                        <span className='font-medium text-foreground'>
                          {snippet.file?.name || 'Unknown file'} (
                          {snippet.similarity_score?.toFixed(2) || 'N/A'})
                        </span>
                        <span className='text-muted-foreground'>
                          #{snippet.chunk_index || 0}
                        </span>
                      </div>
                      <p className='line-clamp-2 text-muted-foreground'>
                        {snippet.text}
                      </p>
                    </div>
                  ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Web Search Sources */}
          {hasWebSources && (
            <Collapsible open={webSourcesOpen} onOpenChange={setWebSourcesOpen}>
              <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md border border-border bg-muted/50 px-2 py-1.5 text-xs transition-colors hover:bg-accent'>
                <span className='flex items-center font-medium text-foreground'>
                  <Globe className='mr-1.5 h-3 w-3' />
                  Web Sources ({webSearchSources!.length})
                </span>
                {webSourcesOpen ? (
                  <ChevronUp className='h-3 w-3 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-3 w-3 text-muted-foreground' />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className='space-y-1.5 pt-1.5'>
                {webSearchSources!.map((source) => (
                  <div
                    key={source.id}
                    className='rounded-r-md border-l-2 border-blue-500 bg-white p-1.5 pl-2 text-xs'
                  >
                    <a
                      href={source.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1 font-medium text-foreground hover:text-blue-600'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source.title || source.url}
                      <ExternalLink className='h-2.5 w-2.5' />
                    </a>
                    {source.cited_text && (
                      <p className='mt-0.5 line-clamp-2 italic text-muted-foreground'>
                        &ldquo;{source.cited_text}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  )
}
