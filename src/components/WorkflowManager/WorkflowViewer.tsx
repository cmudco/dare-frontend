import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { clearSelectedWorkflowRun } from '@/redux/workflowSlice'
import { getRunStatusBadge } from '@/utils/constants/workflow'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { WorkflowRunDrawerProps } from '@/redux/types/workflow'
import { formatDistance, formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '../Conversation/CodeBlock'
import { MermaidBlock } from '../Conversation/MermaidBlock'
import {
  Clock,
  Calendar,
  CheckCircle,
  Terminal,
  X,
  CirclePlay,
  Target,
  Timer,
  ListTodo,
  MessagesSquare,
  AlertCircle,
  FileText,
  Eye,
} from 'lucide-react'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'

interface WorkflowViewerProps extends WorkflowRunDrawerProps {
  title?: string
  mode?: 'run' | 'view'
  workflowName?: string
  showActions?: boolean
}

const WorkflowViewer: React.FC<WorkflowViewerProps> = ({
  runId,
  isOpen,
  onClose,
  title = 'Workflow Run Details',
  mode = 'run',
  workflowName,
  showActions = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflowRun, loading, error } = useSelector(
    (state: RootState) => state.workflow
  )

  useEffect(() => {
    if (runId && isOpen) {
      dispatch(getWorkflowRunById(runId))

      if (selectedWorkflowRun?.status === 'running') {
        const interval = setInterval(() => {
          dispatch(getWorkflowRunById(runId))
        }, 5000)
        return () => clearInterval(interval)
      }
    }
  }, [dispatch, runId, isOpen, selectedWorkflowRun?.status])

  const handleClose = () => {
    if (!selectedWorkflowRun || selectedWorkflowRun.status !== 'running') {
      dispatch(clearSelectedWorkflowRun())
    }
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      <div className='flex flex-col'>
        <div className='flex items-center gap-1.5 text-sm text-gray-700'>
          <Calendar className='h-4 w-4' />
          <span>
            {date.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className='mt-1 flex items-center gap-1.5 text-xs text-gray-500'>
          <Clock className='h-3.5 w-3.5' />
          <span>{date.toLocaleTimeString()}</span>
          <span className='ml-1 text-gray-400'>
            ({formatDistanceToNow(date, { addSuffix: true })})
          </span>
        </div>
      </div>
    )
  }

  const getIconForMode = () => {
    if (mode === 'run') {
      return <Terminal className='h-5 w-5' />
    } else {
      return <Eye className='h-5 w-5' />
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent
        position='right'
        className='w-[600px] max-w-[90vw] rounded-l-2xl shadow-xl'
        aria-hidden='false'
        overlayProps={{
          className: 'bg-black/40',
          'aria-hidden': 'false',
        }}
        dragHandleProps={
          {
            className:
              'absolute left-4 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-full bg-gray-200 cursor-ew-resize hover:bg-blue-300 transition-colors horizontal-drag-handle',
            'data-testid': 'horizontal-drag-handle',
          } as React.HTMLAttributes<HTMLDivElement>
        }
      >
        <DrawerHeader className='relative border-b pb-4 pr-12'>
          <div className='flex items-center'>
            <div
              className={
                mode === 'run'
                  ? 'mr-3 rounded-lg bg-blue-100 p-2 text-blue-600'
                  : 'mr-3 rounded-lg bg-purple-100 p-2 text-purple-600'
              }
            >
              {getIconForMode()}
            </div>
            <div>
              <DrawerTitle className='text-xl font-semibold'>
                {title}
              </DrawerTitle>
              <DrawerDescription className='text-gray-500'>
                {workflowName && (
                  <span className='font-medium'>{workflowName}</span>
                )}
                {workflowName ? ' - ' : ''}View the complete results and
                execution details
              </DrawerDescription>
            </div>
          </div>
          <DrawerClose
            className='absolute right-4 top-4 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
            tabIndex={0}
          >
            <X size={18} className='text-gray-500' />
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea
          className='h-[calc(100vh-110px)] flex-1'
          aria-hidden='false'
        >
          <div className='p-6'>
            {loading && !selectedWorkflowRun ? (
              <div className='flex h-40 items-center justify-center'>
                <div className='flex animate-pulse flex-col items-center text-blue-600'>
                  <span className='flex h-10 w-10 animate-spin items-center justify-center'>
                    <CirclePlay className='h-10 w-10' />
                  </span>
                  <span className='mt-3 text-sm font-medium'>
                    Loading workflow details...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className='my-8 rounded-lg border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm'>
                <h4 className='flex items-center text-lg font-medium'>
                  <AlertCircle className='mr-2 h-5 w-5' />
                  Error Loading Workflow Run
                </h4>
                <p className='mt-2'>{error}</p>
                <Button
                  variant='outline'
                  onClick={() => runId && dispatch(getWorkflowRunById(runId))}
                  className='mt-4 border-red-200 bg-white text-red-600 hover:bg-red-50'
                >
                  Retry
                </Button>
              </div>
            ) : selectedWorkflowRun ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                    <h4 className='mb-2 flex items-center font-medium text-gray-700'>
                      <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100'>
                        <CheckCircle className='h-4 w-4 text-blue-600' />
                      </div>
                      Status
                    </h4>
                    <div>{getRunStatusBadge(selectedWorkflowRun.status)}</div>
                  </div>

                  <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                    <h4 className='mb-2 flex items-center font-medium text-gray-700'>
                      <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100'>
                        <Timer className='h-4 w-4 text-green-600' />
                      </div>
                      Duration
                    </h4>
                    <div className='font-medium text-gray-800'>
                      {selectedWorkflowRun.endedAt
                        ? formatDistance(
                            new Date(selectedWorkflowRun.endedAt),
                            new Date(selectedWorkflowRun.startedAt),
                            { includeSeconds: true }
                          )
                        : 'Running...'}
                    </div>
                  </div>
                </div>

                <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                  <h4 className='mb-3 flex items-center font-medium text-gray-700'>
                    <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100'>
                      <Target className='h-4 w-4 text-indigo-600' />
                    </div>
                    Timeline
                  </h4>
                  <div className='grid grid-cols-1 gap-4'>
                    <div className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
                      <div className='mb-2 flex items-center text-sm font-medium text-indigo-700'>
                        <CirclePlay className='mr-1.5 h-4 w-4' />
                        Started
                      </div>
                      {formatDate(selectedWorkflowRun.startedAt)}
                    </div>
                    {selectedWorkflowRun.endedAt && (
                      <div className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
                        <div className='mb-2 flex items-center text-sm font-medium text-green-700'>
                          <CheckCircle className='mr-1.5 h-4 w-4' />
                          Completed
                        </div>
                        {formatDate(selectedWorkflowRun.endedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <div className='rounded-xl border border-gray-200 bg-white p-4 pb-6 shadow-sm'>
                  <h4 className='mb-4 flex items-center font-medium text-gray-700'>
                    <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100'>
                      <ListTodo className='h-4 w-4 text-purple-600' />
                    </div>
                    Steps
                  </h4>
                  {selectedWorkflowRun.steps.length === 0 ? (
                    <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center'>
                      <p className='text-gray-500'>
                        No steps have been executed yet.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {selectedWorkflowRun.steps.map((step) => (
                        <div
                          key={step.id}
                          className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'
                        >
                          <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4'>
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
                          </div>

                          {step.response && (
                            <div className='p-4'>
                              <h5 className='mb-2 flex items-center text-sm font-medium text-gray-700'>
                                <MessagesSquare className='mr-1.5 h-4 w-4 text-blue-600' />
                                Response
                              </h5>
                              <div className='prose prose-sm max-w-none overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800'>
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkMath]}
                                  rehypePlugins={[
                                    rehypeKatex,
                                    rehypeHighlight,
                                    rehypeRaw,
                                  ]}
                                  components={{
                                    code({ className, children, ...props }) {
                                      const match = /language-(\w+)/.exec(
                                        className || ''
                                      )
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
                                          <CodeBlock
                                            className={className}
                                            {...props}
                                          >
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showActions && (
                  <div className='flex justify-end gap-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-1.5'
                      onClick={() => {
                        /* Add action here */
                      }}
                    >
                      <FileText className='h-4 w-4' />
                      Export Results
                    </Button>

                    {selectedWorkflowRun.status !== 'running' && (
                      <Button
                        variant='default'
                        size='sm'
                        className='flex items-center gap-1.5'
                        onClick={() => {
                          /* Add action here */
                        }}
                      >
                        <CirclePlay className='h-4 w-4' />
                        Run Again
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500'>
                <Terminal className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                <p className='text-lg font-medium'>No run data available</p>
                <p className='mt-1'>
                  Please select a workflow run to view its details
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default WorkflowViewer
