import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow.ts'
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
import { setSelectedWorkflowRun } from '@/redux/workflowSlice.ts'
import { WorkflowStep } from './WorkflowStep.tsx'
import { exportWorkflowRunPdfAPI } from '@/api/workflows'

const WorkflowViewer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflow, selectedWorkflowRun, error } = useSelector(
    (state: RootState) => state.workflow
  )

  const [isExporting, setIsExporting] = useState(false)

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
        return <ListOrdered className='mr-2 h-5 w-5 text-foreground' />
      } else if (modeDetails?.id === 2) {
        return <Layers className='mr-2 h-5 w-5 text-foreground' />
      }
    }
    return null
  }

  const handleExportResults = async () => {
    if (!selectedWorkflowRun) return

    setIsExporting(true)

    try {
      const { blob, filename } = await exportWorkflowRunPdfAPI(
        selectedWorkflowRun.id
      )

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      // TODO: Show error toast/notification to user
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Drawer
      open={!!selectedWorkflowRun}
      direction='right'
      onOpenChange={() => dispatch(setSelectedWorkflowRun(null))}
    >
      <DrawerContent className='fixed bottom-0 right-0 top-0 mt-0 h-full w-[100vw] rounded-l-lg bg-white p-0 shadow-lg'>
        <ScrollArea className='h-full w-full'>
          <div className='p-4'>
            <DrawerHeader className='p-0 text-left'>
              <div className='flex w-full items-center justify-between px-6 py-4'>
                <div className='flex items-center'>
                  {getIconForMode()}
                  <DrawerTitle className='text-lg font-semibold text-foreground'>
                    {selectedWorkflow?.title
                      ? `${selectedWorkflow.title} - Workflow Details`
                      : 'Workflow Details'}
                  </DrawerTitle>
                </div>
                <div className='flex'>
                  <DrawerClose asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full transition-colors hover:bg-muted'
                      onClick={() => dispatch(setSelectedWorkflowRun(null))}
                    >
                      <X className='h-5 w-5 text-muted-foreground transition-colors hover:text-foreground' />
                      <span className='sr-only'>Close</span>
                    </Button>
                  </DrawerClose>
                </div>
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
                  {selectedWorkflowRun?.status !==
                    WorkflowRunStepStatus.Running && (
                    <div className='flex justify-end gap-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-1.5'
                        onClick={handleExportResults}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <>
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <FileText className='h-4 w-4' />
                            Export Results
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {selectedWorkflowRun ? (
                    <div className='space-y-6'>
                      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                        <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
                          <h4 className='mb-2 flex items-center font-medium text-foreground'>
                            <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
                              <CheckCircle className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                            </div>
                            Status
                          </h4>
                          <div>
                            {getRunStatusBadge(selectedWorkflowRun.status)}
                          </div>
                        </div>
                        <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
                          <h4 className='mb-2 flex items-center font-medium text-foreground'>
                            <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                              <Timer className='h-4 w-4 text-green-600 dark:text-green-400' />
                            </div>
                            Duration
                          </h4>
                          <div className='font-medium text-foreground'>
                            {selectedWorkflowRun.endedAt
                              ? formatDistance(
                                  new Date(selectedWorkflowRun.endedAt),
                                  new Date(selectedWorkflowRun.startedAt)
                                )
                              : 'Running...'}
                          </div>
                        </div>
                      </div>
                      <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
                        <h4 className='mb-3 flex items-center font-medium text-foreground'>
                          <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
                            <Target className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                          </div>
                          Timeline
                        </h4>
                        <div className='grid grid-cols-1 gap-4'>
                          <div className='rounded-lg border border-border bg-card p-4'>
                            <div className='mb-2 flex items-center text-sm font-medium text-indigo-700'>
                              <CirclePlay className='mr-1.5 h-4 w-4' />
                              Started
                            </div>
                            {formatDate(selectedWorkflowRun.startedAt)}
                          </div>
                          {selectedWorkflowRun.endedAt && (
                            <div className='rounded-lg border border-border bg-card p-4'>
                              <div className='mb-2 flex items-center text-sm font-medium text-green-700'>
                                <CheckCircle className='mr-1.5 h-4 w-4' />
                                Completed
                              </div>
                              {formatDate(selectedWorkflowRun.endedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='rounded-xl border border-border bg-card p-4 pb-6 shadow-sm'>
                        <h4 className='mb-4 flex items-center font-medium text-foreground'>
                          <div className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                            <ListTodo className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                          </div>
                          Steps
                        </h4>
                        <WorkflowStep
                          runId={selectedWorkflowRun.id}
                          isOpen={!!selectedWorkflowRun}
                          workflowName={selectedWorkflow?.title}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='rounded-xl border border-dashed border-border bg-muted py-12 text-center text-muted-foreground'>
                      <Terminal className='mx-auto mb-3 h-12 w-12 text-muted-foreground' />
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
