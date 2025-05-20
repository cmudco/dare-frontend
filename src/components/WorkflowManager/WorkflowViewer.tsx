import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { getRunStatusBadge } from '@/utils/constants/workflow'
import {
  WorkflowRunStepStatus,
  WORKFLOW_MODES,
} from '@/utils/constants/workflows'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { formatDistance } from 'date-fns'
import {
  CheckCircle,
  Terminal,
  X,
  CirclePlay,
  Target,
  Timer,
  ListTodo,
  AlertCircle,
  FileText,
  ListOrdered,
  Layers,
} from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import { PDFDocument } from './WorkflowPdfResult.tsx'
import { WorkflowStep } from './WorkflowStep.tsx'
import { setSelectedWorkflowRun } from '@/redux/workflowSlice.ts'

const WorkflowViewer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflow, selectedWorkflowRun, error } = useSelector(
    (state: RootState) => state.workflow
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getIconForMode = () => {
    if (selectedWorkflow?.mode) {
      const modeDetails = WORKFLOW_MODES.find(
        (m) => m.id === selectedWorkflow.mode
      )
      if (modeDetails?.id === 1) {
        return <ListOrdered className='mr-2 h-5 w-5 text-gray-700' />
      } else if (modeDetails?.id === 2) {
        return <Layers className='mr-2 h-5 w-5 text-gray-700' />
      }
    }
    return null
  }

  const handleExportResults = async () => {
    if (!selectedWorkflowRun) return

    const stepsForPdf = selectedWorkflowRun.steps
      .filter(
        (step): step is typeof step & { response: string } => !!step.response
      )
      .map((step) => ({
        order: step.order,
        response: step.response,
      }))

    if (stepsForPdf.length === 0) {
      console.warn('No steps with responses to export.')
      return
    }

    const blob = await pdf(<PDFDocument steps={stepsForPdf} />).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedWorkflow?.title || 'workflow'}-results.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Drawer
      open={!!selectedWorkflowRun}
      direction='right'
      onOpenChange={() => dispatch(setSelectedWorkflowRun(null))}
    >
      <DrawerContent className='fixed bottom-0 right-0 top-0 mt-0 h-full w-[500px] rounded-l-lg bg-white p-0 shadow-lg'>
        <ScrollArea className='h-full w-full'>
          <div className='p-6'>
            <DrawerHeader className='p-0 text-left'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  {getIconForMode()}
                  <DrawerTitle className='text-lg font-semibold text-gray-900'>
                    {selectedWorkflow?.title
                      ? `${selectedWorkflow.title} - Workflow Details`
                      : 'Workflow Details'}
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='absolute right-4 top-4 rounded-full'
                    onClick={() => dispatch(setSelectedWorkflowRun(null))}
                  >
                    <X className='h-5 w-5' />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className='p-6'>
              {error ? (
                <div className='my-8 rounded-lg border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm'>
                  <h4 className='flex items-center text-lg font-medium'>
                    <AlertCircle className='mr-2 h-5 w-5' />
                    Error Loading Workflow Run
                  </h4>
                  <p className='mt-2'>{error}</p>
                  <Button
                    variant='outline'
                    onClick={() =>
                      selectedWorkflowRun?.id &&
                      dispatch(getWorkflowRunById(selectedWorkflowRun.id))
                    }
                    className='mt-4 border-red-200 bg-white text-red-600 hover:bg-red-50'
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className='space-y-6'>
                  {/* Run Details */}
                  {selectedWorkflowRun ? (
                    <div className='space-y-6'>
                      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                          <h4 className='mb-2 flex items-center font-medium text-gray-700'>
                            <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100'>
                              <CheckCircle className='h-4 w-4 text-blue-600' />
                            </div>
                            Status
                          </h4>
                          <div>
                            {getRunStatusBadge(selectedWorkflowRun.status)}
                          </div>
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
                                  new Date(selectedWorkflowRun.startedAt)
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
                        <WorkflowStep
                          runId={selectedWorkflowRun.id}
                          isOpen={!!selectedWorkflowRun}
                          workflowName={selectedWorkflow?.title}
                        />
                      </div>
                      {selectedWorkflowRun?.status !==
                        WorkflowRunStepStatus.Running && (
                        <div className='flex justify-end gap-3'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='flex items-center gap-1.5'
                            onClick={handleExportResults}
                          >
                            <FileText className='h-4 w-4' />
                            Export Results
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500'>
                      <Terminal className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                      <p className='text-lg font-medium'>
                        No run data available
                      </p>
                      <p className='mt-1'>
                        Please select a workflow run to view its details
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default memo(WorkflowViewer)
