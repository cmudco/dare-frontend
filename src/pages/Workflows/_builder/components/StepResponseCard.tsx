/**
 * StepResponseCard - Individual step response with rich content rendering
 *
 * Displays workflow step execution results including:
 * - Step header with number badge and status
 * - Response content with markdown rendering
 * - Context snippets from RAG
 * - Web search sources with citations
 */

import { memo, useState } from 'react'
import {
  Loader2,
  CheckCircle,
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wrench,
  XCircle,
  ListTree,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '@/components/Conversation/CodeBlock'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'
import type {
  NodeState,
  WorkflowStepSnippet,
  WorkflowStepToolCall,
  WorkflowStepWebSearchSource,
} from '@/redux/types/workflow'

export interface StepResponseCardProps {
  nodeId: string
  nodeName: string
  label?: string
  nodeType?: string
  content: string
  isActive: boolean
  snippets?: WorkflowStepSnippet[]
  webSearchSources?: WorkflowStepWebSearchSource[]
  toolCalls?: WorkflowStepToolCall[]
  contextTrace?: NodeState['contextTrace']
}

const toolCallStatusIcon = (status: string) => {
  if (status === 'completed')
    return (
      <CheckCircle className='h-3 w-3 text-green-600 dark:text-green-400' />
    )
  if (status === 'failed')
    return <XCircle className='h-3 w-3 text-destructive' />
  return <Loader2 className='h-3 w-3 animate-spin text-dare' />
}

export const StepResponseCard = memo(function StepResponseCard({
  nodeName,
  label,
  nodeType,
  content,
  isActive,
  snippets,
  webSearchSources,
  toolCalls,
  contextTrace,
}: StepResponseCardProps) {
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  const [webSourcesOpen, setWebSourcesOpen] = useState(false)
  const [traceOpen, setTraceOpen] = useState(false)

  const hasSnippets = snippets && snippets.length > 0
  const hasWebSources = webSearchSources && webSearchSources.length > 0
  const hasToolCalls = toolCalls && toolCalls.length > 0
  const traceStages = contextTrace?.stages ?? []

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all',
        isActive && 'border-primary/30 bg-primary/5',
        !isActive &&
          content &&
          'border-border bg-linear-to-br from-secondary/30 to-dare/5'
      )}
    >
      {/* Step header with number badge */}
      <div className='mb-2 flex items-center gap-2'>
        {/* Label badge */}
        {label && (
          <div className='flex h-auto min-h-5 shrink-0 items-center justify-center rounded-full bg-dare px-1.5 text-[10px] font-bold text-dare-foreground'>
            {label}
          </div>
        )}
        {isActive ? (
          <Loader2 className='h-4 w-4 animate-spin text-dare' />
        ) : (
          <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
        )}
        <span className='text-sm font-medium'>{nodeName}</span>
        {isActive && (
          <span className='text-xs text-muted-foreground'>Streaming...</span>
        )}
      </div>

      {/* Node metadata line */}
      {nodeType && (
        <div className='mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground'>
          <span className='rounded-sm bg-muted px-1.5 py-0.5 font-mono'>
            {nodeType}
          </span>
        </div>
      )}

      {/* Tool calls — live while streaming, persisted after completion */}
      {hasToolCalls && (
        <div className='mt-2 space-y-1'>
          {toolCalls!.map((call) => (
            <div
              key={call.toolCallId}
              className='flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs'
            >
              <Wrench className='h-3 w-3 shrink-0 text-muted-foreground' />
              {toolCallStatusIcon(call.status)}
              <span className='font-mono font-medium text-foreground'>
                {call.toolName}
              </span>
              <span className='text-muted-foreground'>
                {call.serverSlug}
                {(call.round ?? call.roundIndex) != null &&
                  ` · round ${call.round ?? call.roundIndex}`}
                {call.executionTimeMs != null &&
                  call.executionTimeMs > 0 &&
                  ` · ${call.executionTimeMs}ms`}
              </span>
              {call.error && (
                <span className='truncate text-destructive'>{call.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response content with markdown */}
      {content && (
        <div className='mt-2 rounded-sm bg-background/80 p-2'>
          <div className='prose prose-sm max-w-full text-foreground dark:prose-invert prose-code:bg-transparent prose-code:p-0 prose-pre:bg-transparent prose-pre:p-0'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={
                isActive ? [rehypeRaw] : [rehypeHighlight, rehypeRaw]
              }
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
                      className='max-w-full overflow-x-auto text-xs wrap-break-word whitespace-pre-wrap'
                      {...props}
                    >
                      {children}
                    </pre>
                  )
                },
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (match && match[1] === 'mermaid') {
                    if (isActive) {
                      return (
                        <div className='not-prose my-4 text-xs text-muted-foreground'>
                          Loading diagram...
                        </div>
                      )
                    }
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
                      className='not-prose rounded-sm border border-border bg-muted px-1 text-xs break-all text-foreground'
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
            {isActive && <span className='animate-pulse text-dare'>|</span>}
          </div>
        </div>
      )}

      {/* Citations - only show when step is complete (not streaming) */}
      {!isActive &&
        (hasSnippets || hasWebSources || traceStages.length > 0) && (
          <div className='mt-3 space-y-2'>
            {/* Context assembly trace */}
            {traceStages.length > 0 && (
              <Collapsible open={traceOpen} onOpenChange={setTraceOpen}>
                <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md border border-border bg-muted/50 px-2 py-1.5 text-xs transition-colors hover:bg-accent'>
                  <span className='flex items-center font-medium text-foreground'>
                    <ListTree className='mr-1.5 h-3 w-3' />
                    Context Trace ({traceStages.length} stages)
                  </span>
                  {traceOpen ? (
                    <ChevronUp className='h-3 w-3 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-3 w-3 text-muted-foreground' />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className='space-y-1 pt-1.5'>
                  {traceStages.map((stage, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-r-md border-l-2 border-border bg-background p-1.5 pl-2 text-xs'
                    >
                      <span className='font-medium text-foreground'>
                        {String(
                          stage.title ?? stage.kind ?? `Stage ${index + 1}`
                        )}
                      </span>
                      <span className='text-muted-foreground'>
                        {typeof stage.ms === 'number' ? `${stage.ms}ms` : ''}
                      </span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

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
                        (b.similarityScore || 0) - (a.similarityScore || 0)
                    )
                    .map((snippet) => (
                      <div
                        key={snippet.id}
                        className='rounded-r-md border-l-2 border-border bg-background p-1.5 pl-2 text-xs'
                      >
                        <div className='mb-0.5 flex items-center justify-between'>
                          <span className='font-medium text-foreground'>
                            {snippet.file?.name ||
                              snippet.library?.name ||
                              'Unknown source'}{' '}
                            ({snippet.similarityScore?.toFixed(2) || 'N/A'})
                          </span>
                          <span className='text-muted-foreground'>
                            #{snippet.chunkIndex || 0}
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
              <Collapsible
                open={webSourcesOpen}
                onOpenChange={setWebSourcesOpen}
              >
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
                      className='rounded-r-md border-l-2 border-blue-500 bg-background p-1.5 pl-2 text-xs'
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
                      {source.citedText && (
                        <p className='mt-0.5 line-clamp-2 text-muted-foreground italic'>
                          &ldquo;{source.citedText}&rdquo;
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
})
