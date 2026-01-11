/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Features:
 * - Live streaming LLM responses during execution with markdown rendering
 * - Rich content display: snippets, web search sources, code blocks
 * - Human validation UI when required
 * - Connection status indicator
 */

import { useRef, useEffect, useState, useMemo } from 'react'
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
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { setShowExecutionPanel } from '@/redux/workflowBuilderSlice'
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
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

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

  // Close panel handler - don't clear streaming responses so we can reopen
  const handleClose = () => {
    dispatch(setShowExecutionPanel(false))
    // Note: We no longer clear streaming responses here so peek can show them
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

  // Node types that are execution nodes (have their own response data)
  // Display nodes (chatOutput, start) mirror data from execution nodes - skip to avoid duplication
  const EXECUTION_NODE_TYPES = ['step', 'structuredOutput']

  // Build display data from currentRun.nodeStates when no streaming data
  // This allows viewing completed runs via the "peek" button
  const completedRunResponses = useMemo(() => {
    if (hasStreamingData || !currentRun?.nodeStates) return []

    const responses: [string, StreamingResponse][] = []

    for (const [nodeId, nodeState] of Object.entries(currentRun.nodeStates)) {
      // Only show execution nodes (step, structuredOutput) - skip display nodes (chatOutput, start)
      // Display nodes mirror data from execution nodes, so including them causes duplication
      if (!EXECUTION_NODE_TYPES.includes(nodeState.nodeType)) {
        continue
      }

      // Only show nodes that have completed with a response
      if (
        nodeState.response &&
        (nodeState.status === WorkflowRunStepStatus.Completed ||
          nodeState.status === WorkflowRunStepStatus.Failed)
      ) {
        responses.push([
          nodeId,
          {
            content: nodeState.response,
            snippets: nodeState.snippets?.map((s) => ({
              id: s.id,
              file: s.file ? { id: s.file.id, name: s.file.name } : null,
              text: s.text,
              similarity_score: s.similarityScore,
              chunk_index: s.chunkIndex,
              vector_db_source: s.vectorDbSource || '',
            })),
            webSearchSources: nodeState.webSearchSources?.map((w) => ({
              id: w.id,
              url: w.url,
              title: w.title,
              cited_text: w.citedText,
              page_age: w.pageAge,
              provider: w.provider,
            })),
          },
        ])
      }
    }

    // Sort by step number
    return responses.sort(([idA], [idB]) => {
      const nodeA = nodes.find((n) => n.id === idA)
      const nodeB = nodes.find((n) => n.id === idB)
      const stepA = (nodeA?.data?.stepNumber as number) || 0
      const stepB = (nodeB?.data?.stepNumber as number) || 0
      return stepA - stepB
    })
  }, [hasStreamingData, currentRun?.nodeStates, nodes])

  // Use streaming data if available, otherwise use completed run data
  const displayResponses = hasStreamingData
    ? (Object.entries(streamingResponses).sort(([idA], [idB]) => {
        const nodeA = nodes.find((n) => n.id === idA)
        const nodeB = nodes.find((n) => n.id === idB)
        const stepA = (nodeA?.data?.stepNumber as number) || 0
        const stepB = (nodeB?.data?.stepNumber as number) || 0
        return stepA - stepB
      }) as [string, StreamingResponse][])
    : completedRunResponses

  const hasDisplayData = displayResponses.length > 0
  const isViewingCompletedRun =
    !hasStreamingData && completedRunResponses.length > 0

  return (
    <div className='absolute inset-x-0 bottom-4 top-10 z-20 ml-auto flex w-[90%] max-w-[35vw] flex-col rounded-2xl border border-border/30 bg-white/95 shadow-2xl backdrop-blur-sm'>
      {/* Header with connection status and close button */}
      <div className='flex items-center justify-between rounded-t-2xl border-b border-border/50 bg-gradient-to-r from-slate-50 to-white p-4'>
        <div>
          <h3 className='font-semibold text-foreground'>
            {isViewingCompletedRun ? 'Run Results' : 'Execution Preview'}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {isRunning
              ? activeStreamingNodeId
                ? 'Streaming response...'
                : 'Workflow running...'
              : pendingValidation
                ? 'Awaiting validation'
                : isViewingCompletedRun
                  ? `Viewing run #${currentRun?.id}`
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

        {/* Empty state - only show when no data and not running */}
        {!hasDisplayData && !pendingValidation && !isRunning && (
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
          !hasDisplayData &&
          !activeStreamingNodeId &&
          !pendingValidation && (
            <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
              <Loader2 className='mb-2 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-sm'>Starting workflow...</p>
            </div>
          )}

        {/* Viewing completed run indicator */}
        {isViewingCompletedRun && (
          <div className='mb-4 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2'>
            <History className='h-4 w-4 text-muted-foreground' />
            <span className='text-xs text-muted-foreground'>
              Showing results from previous run
            </span>
          </div>
        )}

        {/* Response cards - streaming or completed run data */}
        {hasDisplayData && (
          <div className='space-y-4'>
            {displayResponses.map(([nodeId, responseData]) => {
              const isActive = activeStreamingNodeId === nodeId
              const node = nodes.find((n) => n.id === nodeId)
              const nodeName =
                (node?.data?.label as string) || node?.type || 'Step'
              const stepNumber = node?.data?.stepNumber as number | undefined
              const nodeType = node?.type
              const content = responseData.content
              const snippets = responseData.snippets
              const webSearchSources = responseData.webSearchSources

              return (
                <StepResponseCard
                  key={nodeId}
                  nodeId={nodeId}
                  nodeName={nodeName}
                  stepNumber={stepNumber}
                  nodeType={nodeType}
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
        <div className='rounded-b-2xl border-t border-border/50 bg-gradient-to-r from-slate-50 to-white p-3'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>Run #{currentRun.id}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                currentRun.status === 'completed' &&
                  'bg-[#023572]/10 text-[#023572]',
                currentRun.status === 'running' &&
                  'bg-[#EE183C]/10 text-[#EE183C]',
                currentRun.status === 'failed' && 'bg-red-100 text-red-700',
                currentRun.status === 'pending_human_input' &&
                  'bg-[#EE183C]/10 text-[#EE183C]'
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
    <div className='mb-4 rounded-lg border border-[#EE183C]/30 bg-gradient-to-br from-[#EE183C]/5 to-[#023572]/5 p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#EE183C] to-[#023572]'>
          <span className='text-xs font-bold text-white'>?</span>
        </div>
        <span className='font-medium text-foreground'>
          Human Validation Required
        </span>
      </div>

      <p className='mb-3 text-sm text-muted-foreground'>
        The workflow is waiting for your decision at{' '}
        <strong className='text-foreground'>{nodeName}</strong>. Please select a
        route to continue.
      </p>

      {validation.aiRecommendation && (
        <div className='mb-3 rounded-md border border-[#023572]/20 bg-[#023572]/5 p-2 text-xs text-muted-foreground'>
          <strong className='text-[#023572]'>AI Recommendation:</strong>{' '}
          {validation.aiRecommendation}
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
                ? 'border-[#EE183C]/50 bg-gradient-to-r from-[#EE183C]/10 to-[#023572]/10'
                : 'border-border bg-white hover:border-[#023572]/30 hover:bg-[#023572]/5'
            )}
          >
            <div className='font-medium text-foreground'>{route.name}</div>
            {route.description && (
              <div className='text-xs text-muted-foreground'>
                {route.description}
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedRoute || isSubmitting}
        className='w-full bg-gradient-to-r from-[#EE183C] to-[#023572] text-white hover:from-[#c41230] hover:to-[#012a5c]'
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
  stepNumber?: number
  nodeType?: string
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
  nodeId,
  nodeName,
  stepNumber,
  nodeType,
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
        isActive && 'border-[#023572]/30 bg-[#023572]/5',
        !isActive &&
          content &&
          'border-[#023572]/20 bg-gradient-to-br from-[#023572]/5 to-[#EE183C]/5'
      )}
    >
      {/* Step header with number badge */}
      <div className='mb-2 flex items-center gap-2'>
        {/* Step number badge */}
        {stepNumber !== undefined && (
          <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#023572] to-[#EE183C] text-[10px] font-bold text-white'>
            {stepNumber}
          </div>
        )}
        {isActive ? (
          <Loader2 className='h-4 w-4 animate-spin text-[#023572]' />
        ) : (
          <CheckCircle className='h-4 w-4 text-[#023572]' />
        )}
        <span className='text-sm font-medium'>{nodeName}</span>
        {isActive && (
          <span className='text-xs text-[#023572]'>Streaming...</span>
        )}
      </div>

      {/* Node metadata line */}
      <div className='mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground'>
        {nodeType && (
          <span className='rounded bg-muted px-1.5 py-0.5 font-mono'>
            {nodeType}
          </span>
        )}
        <span className='rounded bg-muted/50 px-1.5 py-0.5 font-mono text-muted-foreground/70'>
          {nodeId}
        </span>
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
            {isActive && (
              <span className='animate-pulse text-[#EE183C]'>|</span>
            )}
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
