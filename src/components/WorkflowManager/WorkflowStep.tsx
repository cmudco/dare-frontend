import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '../Conversation/CodeBlock'
import { MermaidBlock } from '../Conversation/MermaidBlock'
import { MessagesSquare, AlertCircle, CirclePlay } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { useEffect, useRef } from 'react'
import { getWorkflowRunById, getWorkflows } from '@/redux/asyncThunks/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { getRunStatusBadge } from '@/utils/constants/workflow'
import { getWallet } from '@/redux/aynscThunks/billing'

export const WorkflowStep: React.FC<{
  runId: string | null
  isOpen: boolean
  workflowName?: string
}> = ({ runId, isOpen }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflowRun, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const hasDispatchedGetWorkflows = useRef(false)

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
      <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center'>
        <p className='text-gray-500'>No steps have been executed yet.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {selectedWorkflowRun.steps.map((step) => (
        <Collapsible
          key={step.id}
          open={step.status === WorkflowRunStepStatus.Completed}
          className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'
        >
          <CollapsibleTrigger className='flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 p-4'>
            <div className='flex items-center'>
              <span className='mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700'>
                {step.order}
              </span>
              <div>
                <div className='font-medium text-gray-800'>
                  Step {step.order}
                </div>
                <div className='text-xs text-gray-500'>
                  {new Date(step.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div>{getRunStatusBadge(step.status)}</div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {step.response && (
              <div className='p-4'>
                <h5 className='mb-2 flex items-center text-sm font-medium text-gray-700'>
                  <MessagesSquare className='mr-1.5 h-4 w-4 text-blue-600' />
                  Response
                </h5>
                <div className='prose prose-sm max-w-none overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800'>
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
      ))}
    </div>
  )
}
