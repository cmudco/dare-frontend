/**
 * StepResponseCard - Individual step response with rich content rendering
 *
 * Displays workflow step execution results including:
 * - Step header with number badge and status
 * - Response content with markdown rendering
 * - Context snippets from RAG
 * - Web search sources with citations
 */

import { useState } from 'react'
import {
  Loader2,
  CheckCircle,
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '@/components/Conversation/CodeBlock'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'
import type {
  WorkflowStepSnippet,
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
}

export function StepResponseCard({
  nodeName,
  label,
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
        {/* Label badge */}
        {label && (
          <div className='flex h-auto min-h-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#023572] to-[#EE183C] px-1.5 text-[10px] font-bold text-white'>
            {label}
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
      {nodeType && (
        <div className='mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground'>
          <span className='rounded bg-muted px-1.5 py-0.5 font-mono'>
            {nodeType}
          </span>
        </div>
      )}

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
                      (b.similarityScore || 0) - (a.similarityScore || 0)
                  )
                  .map((snippet) => (
                    <div
                      key={snippet.id}
                      className='rounded-r-md border-l-2 border-border bg-white p-1.5 pl-2 text-xs'
                    >
                      <div className='mb-0.5 flex items-center justify-between'>
                        <span className='font-medium text-foreground'>
                          {snippet.file?.name || 'Unknown file'} (
                          {snippet.similarityScore?.toFixed(2) || 'N/A'})
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
                    {source.citedText && (
                      <p className='mt-0.5 line-clamp-2 italic text-muted-foreground'>
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
}
