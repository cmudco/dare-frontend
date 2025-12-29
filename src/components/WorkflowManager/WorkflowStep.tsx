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
  UserCheck,
  Globe,
  ExternalLink,
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
import { HumanValidationModal } from './HumanValidationModal'
import { submitHumanValidationAPI } from '@/api/workflows'
import { Button } from '@/components/ui/button'
import type { PendingValidation } from '@/redux/types/workflow'

export const WorkflowStep: React.FC<{
  runId: number | null
  isOpen: boolean
  workflowName?: string
}> = ({ runId, isOpen }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflowRun, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const hasDispatchedGetWorkflows = useRef(false)
  const [openSnippets, setOpenSnippets] = useState<{ [key: number]: boolean }>(
    {}
  )
  const [openWebSources, setOpenWebSources] = useState<{
    [key: number]: boolean
  }>({})
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [currentValidation, setCurrentValidation] =
    useState<PendingValidation | null>(null)

  const toggleSnippets = (stepId: number) => {
    setOpenSnippets((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  const toggleWebSources = (stepId: number) => {
    setOpenWebSources((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  const handleOpenValidation = (validation: PendingValidation) => {
    setCurrentValidation(validation)
    setShowValidationModal(true)
  }

  const handleSubmitValidation = async (
    nodeId: string,
    chosenRoute: string
  ) => {
    if (!runId) return

    try {
      await submitHumanValidationAPI(runId, nodeId, chosenRoute)
      // Refresh the workflow run to get updated status
      dispatch(getWorkflowRunById(runId))
    } catch (error) {
      console.error('Failed to submit validation:', error)
      throw error
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined

    if (runId && isOpen) {
      dispatch(getWorkflowRunById(runId))

      // Keep polling for Running and PendingHumanInput statuses
      if (
        selectedWorkflowRun?.status === WorkflowRunStepStatus.Running ||
        selectedWorkflowRun?.status === WorkflowRunStepStatus.PendingHumanInput
      ) {
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

  // Helper to check if this step has a pending validation
  const getPendingValidationForStep = (stepId: number) => {
    return selectedWorkflowRun.pendingValidations?.find(
      (validation) => validation.stepId === stepId
    )
  }

  return (
    <div className='space-y-6'>
      {/* Steps */}
      {selectedWorkflowRun.steps.map((step) => {
        const pendingValidation = getPendingValidationForStep(step.id)
        const isWorkflowCompleted =
          selectedWorkflowRun?.status === WorkflowRunStepStatus.Completed
        const isStepCompleted = step.status === WorkflowRunStepStatus.Completed
        const isSnippetsOpen = openSnippets[step.id] || false

        return (
          <Collapsible
            key={step.id}
            {...(isWorkflowCompleted && !isStepCompleted ? { open: true } : {})}
            {...(isWorkflowCompleted && isStepCompleted
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
              {/* Human Validation UI for Routing Steps */}
              {pendingValidation &&
                step.status === WorkflowRunStepStatus.PendingHumanInput && (
                  <div className='mb-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
                    <div className='mb-3 flex items-start gap-3'>
                      <UserCheck className='mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400' />
                      <div className='flex-1'>
                        <h3 className='font-semibold text-purple-900 dark:text-purple-100'>
                          Human Validation Required
                        </h3>
                        <p className='mt-1 text-sm text-purple-700 dark:text-purple-300'>
                          Choose which route the workflow should take to
                          continue.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOpenValidation(pendingValidation)}
                      size='sm'
                      className='w-full bg-purple-600 hover:bg-purple-700'
                    >
                      Make Decision
                    </Button>
                  </div>
                )}

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

                  {/* Web Search Sources */}
                  {step.webSearchSources &&
                    step.webSearchSources.length > 0 && (
                      <div className='mt-6'>
                        <Collapsible open={openWebSources[step.id] || false}>
                          <CollapsibleTrigger
                            className='flex w-full items-center justify-between rounded-md border border-border bg-muted px-4 py-3 transition-colors hover:bg-accent'
                            onClick={() => toggleWebSources(step.id)}
                          >
                            <h5 className='flex items-center text-sm font-medium text-foreground'>
                              <Globe className='mr-2 h-4 w-4' />
                              Web Sources ({step.webSearchSources.length})
                            </h5>
                            {openWebSources[step.id] ? (
                              <ChevronUp className='h-4 w-4 text-muted-foreground' />
                            ) : (
                              <ChevronDown className='h-4 w-4 text-muted-foreground' />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className='space-y-3 p-4'>
                            {step.webSearchSources.map((source) => (
                              <div
                                key={source.id}
                                className='rounded-r-lg border-l-4 border-blue-500 bg-background p-3 pl-4'
                              >
                                <div className='mb-1 flex items-center justify-between'>
                                  <a
                                    href={source.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-1 text-sm font-medium text-foreground hover:text-blue-600'
                                  >
                                    {source.title ||
                                      (() => {
                                        try {
                                          return new URL(source.url).hostname
                                        } catch {
                                          return source.url
                                        }
                                      })()}
                                    <ExternalLink className='h-3 w-3' />
                                  </a>
                                  {source.provider && (
                                    <span className='text-xs text-muted-foreground'>
                                      via {source.provider}
                                    </span>
                                  )}
                                </div>
                                {source.citedText && (
                                  <p className='text-sm italic text-muted-foreground'>
                                    &ldquo;{source.citedText}&rdquo;
                                  </p>
                                )}
                                {source.pageAge && (
                                  <p className='mt-1 text-xs text-muted-foreground'>
                                    {source.pageAge}
                                  </p>
                                )}
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

      {/* Human Validation Modal */}
      <HumanValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validation={currentValidation}
        onSubmit={handleSubmitValidation}
      />
    </div>
  )
}
