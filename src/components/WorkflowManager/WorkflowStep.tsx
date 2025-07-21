import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '../Conversation/CodeBlock'
import { MermaidBlock } from '../Conversation/MermaidBlock'
import {
  MessagesSquare,
  AlertCircle,
  CirclePlay,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { useEffect, useRef, useState } from 'react'
import { getWorkflowRunById, getWorkflows } from '@/redux/asyncThunks/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { getRunStatusBadge } from '@/utils/constants/workflow'
import { getWallet } from '@/redux/asyncThunks/billing'

export const WorkflowStep: React.FC<{
  runId: string | null
  isOpen: boolean
  workflowName?: string
  forceExpandAll?: boolean
}> = ({ runId, isOpen, forceExpandAll = false }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflowRun, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const hasDispatchedGetWorkflows = useRef(false)
  const [openSnippets, setOpenSnippets] = useState<{ [key: string]: boolean }>(
    {}
  )

  const toggleSnippets = (stepId: string) => {
    setOpenSnippets((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined

    if (runId && isOpen) {
      dispatch(getWorkflowRunById(runId))

      if (selectedWorkflowRun?.status === WorkflowRunStepStatus.Running) {
        intervalId = setInterval(() => {
          dispatch(getWorkflowRunById(runId))
        }, 5000)
      } else if (
        selectedWorkflowRun?.status === WorkflowRunStepStatus.Completed &&
        !hasDispatchedGetWorkflows.current
      ) {
        dispatch(getWorkflows())
        dispatch(getWallet())
        hasDispatchedGetWorkflows.current = true
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [dispatch, runId, isOpen, selectedWorkflowRun?.status])

  if (loading && !selectedWorkflowRun) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='flex animate-pulse flex-col items-center text-blue-600'>
          <span className='flex h-10 w-10 animate-spin items-center justify-center'>
            <CirclePlay className='h-10 w-10' />
          </span>
          <span className='mt-3 text-sm font-medium'>
            Loading workflow steps...
          </span>
        </div>
      </div>
    )
  }

  if (!selectedWorkflowRun || selectedWorkflowRun.steps.length === 0) {
    return (
      <div className='rounded-lg border border-dashed border-border bg-muted p-6 text-center'>
        <p className='text-muted-foreground'>
          No steps have been executed yet.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {selectedWorkflowRun.steps.map((step) => {
        const isWorkflowCompleted =
          selectedWorkflowRun?.status === WorkflowRunStepStatus.Completed
        const isStepCompleted = step.status === WorkflowRunStepStatus.Completed
        const isSnippetsOpen = openSnippets[step.id] || false

        return (
          <Collapsible
            key={step.id}
            {...(forceExpandAll ? { open: true } : {})}
            {...(!forceExpandAll && isWorkflowCompleted && !isStepCompleted
              ? { open: true }
              : {})}
            {...(!forceExpandAll && isWorkflowCompleted && isStepCompleted
              ? { defaultOpen: true }
              : {})}
            className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
          >
            <CollapsibleTrigger className='flex w-full items-center justify-between border-b border-border bg-muted p-4'>
              <div className='flex items-center'>
                <span className='mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                  {step.order}
                </span>
                <div>
                  <div className='font-medium text-foreground'>
                    Step {step.order}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(step.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div>{getRunStatusBadge(step.status)}</div>
            </CollapsibleTrigger>
            <CollapsibleContent className='bg-card p-4'>
              {step.response && (
                <div className='p-4'>
                  <h5 className='mb-2 flex items-center text-sm font-medium text-foreground'>
                    <MessagesSquare className='mr-2 h-4 w-4' />
                    Response
                  </h5>
                  <div className='prose prose-sm max-w-none overflow-hidden rounded-lg border border-border bg-background p-4 text-sm text-foreground'>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          if (match && match[1] === 'mermaid') {
                            return (
                              <MermaidBlock
                                code={String(children).trim()}
                                onRendered={() => {}}
                                streaming={false}
                              />
                            )
                          }
                          if (match) {
                            return (
                              <CodeBlock className={className} {...props}>
                                {children}
                              </CodeBlock>
                            )
                          }
                          return (
                            <code
                              className='not-prose rounded bg-gray-100 px-1'
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {step.response}
                    </ReactMarkdown>
                  </div>

                  {step.snippets && step.snippets.length > 0 && (
                    <div className='mt-6'>
                      <Collapsible open={isSnippetsOpen}>
                        <CollapsibleTrigger
                          className='flex w-full items-center justify-between rounded-md border border-border bg-muted px-4 py-3 transition-colors hover:bg-accent'
                          onClick={() => toggleSnippets(step.id)}
                        >
                          <h5 className='flex items-center text-sm font-medium text-foreground'>
                            <FileText className='mr-2 h-4 w-4' />
                            Context Snippets ({step.snippets.length})
                          </h5>
                          {isSnippetsOpen ? (
                            <ChevronUp className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <ChevronDown className='h-4 w-4 text-muted-foreground' />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className='space-y-3 p-4'>
                          {[...step.snippets]
                            .sort(
                              (a, b) =>
                                (b.similarityScore || 0) -
                                (a.similarityScore || 0)
                            )
                            .map((snippet) => (
                              <div
                                key={snippet.id}
                                className='rounded-r-lg border-l-4 border-border bg-background p-3 pl-4'
                              >
                                <div className='mb-1 flex items-center justify-between'>
                                  <span className='text-sm font-medium text-foreground'>
                                    From {snippet.file.name} (Score:{' '}
                                    {snippet.similarityScore?.toFixed(2) ||
                                      'N/A'}
                                    )
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {snippet.vectorDbSource ? (
                                      <>
                                        <span className='font-medium'>
                                          {snippet.vectorDbSource}
                                        </span>{' '}
                                        - Chunk {snippet.chunkIndex || 0}
                                      </>
                                    ) : (
                                      <>Chunk {snippet.chunkIndex || 0}</>
                                    )}
                                  </span>
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                  {snippet.text}
                                </p>
                              </div>
                            ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
                </div>
              )}

              {step.error && (
                <div className='p-4'>
                  <h5 className='mb-2 flex items-center text-sm font-medium text-red-600'>
                    <AlertCircle className='mr-1.5 h-4 w-4' />
                    Error
                  </h5>
                  <div className='rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600'>
                    {step.error}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
