import { useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  setSelectedBatchRunId,
  setShowExecutionPanel,
  setBatchProgressDismissed,
} from '@/redux/workflowBuilder'
import { X } from 'lucide-react'

export default function BatchProgressPanel() {
  const dispatch = useAppDispatch()
  const batchRun = useAppSelector((s) => s.workflowBuilder.batch.batchRun)

  const progress = useMemo(() => {
    if (!batchRun.totalFiles) return 0
    const completed = batchRun.completedCount + batchRun.failedCount
    return Math.min(100, Math.round((completed / batchRun.totalFiles) * 100))
  }, [batchRun])

  const handleViewRun = (runId: number) => {
    dispatch(setSelectedBatchRunId(runId))
    dispatch(setShowExecutionPanel(true))
  }

  const handleDismiss = () => {
    if (!batchRun.batchId) return
    dispatch(setBatchProgressDismissed(batchRun.batchId))
    if (batchRun.workflowId) {
      localStorage.setItem(
        `workflowBatchDismissed:${batchRun.workflowId}`,
        String(batchRun.batchId)
      )
    }
  }

  useEffect(() => {
    if (!batchRun.workflowId || !batchRun.batchId) return
    const key = `workflowBatchDismissed:${batchRun.workflowId}`
    const dismissed = localStorage.getItem(key)
    if (dismissed && Number(dismissed) === batchRun.batchId) {
      dispatch(setBatchProgressDismissed(batchRun.batchId))
    }
  }, [batchRun.workflowId, batchRun.batchId, dispatch])

  useEffect(() => {
    if (!batchRun.workflowId || !batchRun.batchId || !batchRun.isActive) return
    const key = `workflowBatchDismissed:${batchRun.workflowId}`
    localStorage.removeItem(key)
    dispatch(setBatchProgressDismissed(null))
  }, [batchRun.workflowId, batchRun.batchId, batchRun.isActive, dispatch])

  const showPanel =
    batchRun.batchId !== null &&
    batchRun.fileStatuses.length > 0 &&
    batchRun.dismissedBatchId !== batchRun.batchId

  if (!showPanel) return null

  return (
    <div className='fixed right-6 bottom-6 z-30 w-[340px] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-sm'>
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <div>
          <p className='text-sm font-semibold text-foreground'>
            Batch Progress
          </p>
          <p className='text-xs text-muted-foreground'>
            {batchRun.completedCount + batchRun.failedCount}/
            {batchRun.totalFiles} complete
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              batchRun.isActive
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700'
            )}
          >
            {batchRun.isActive ? 'Running' : 'Completed'}
          </span>
          {!batchRun.isActive && (
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={handleDismiss}
              aria-label='Close batch progress'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      <div className='px-4 py-3'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
          <div
            className='h-full rounded-full bg-primary transition-all'
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
          <span>{progress}%</span>
          <span>{batchRun.failedCount} failed</span>
        </div>
      </div>

      <div className='max-h-[280px] overflow-y-auto px-4 pb-4'>
        <ul className='space-y-2'>
          {batchRun.fileStatuses.map((fileStatus) => (
            <li
              key={fileStatus.fileId}
              className='rounded-lg border border-border/60 bg-background px-3 py-2'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-medium wrap-break-word text-foreground'>
                    {fileStatus.fileName}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    File {fileStatus.index} of {batchRun.totalFiles}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                    fileStatus.status === 'running' &&
                      'bg-blue-100 text-blue-700',
                    fileStatus.status === 'completed' &&
                      'bg-emerald-100 text-emerald-700',
                    fileStatus.status === 'failed' && 'bg-red-100 text-red-700'
                  )}
                >
                  {fileStatus.status}
                </span>
              </div>
              {fileStatus.workflowRunId && (
                <div className='mt-2 flex justify-end'>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 px-2 text-xs'
                    onClick={() => {
                      if (fileStatus.workflowRunId != null)
                        handleViewRun(fileStatus.workflowRunId)
                    }}
                  >
                    View details
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
