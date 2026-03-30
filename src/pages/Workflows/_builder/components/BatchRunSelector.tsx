import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setSelectedBatchRunId } from '@/redux/workflowBuilder'
import {
  selectShouldShowBatch,
  selectEffectiveBatchRunId,
  selectBatchRunOptions,
} from '@/redux/workflowBuilder'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Batch run dropdown with file status options.
 * All state derived from centralized selectors — no local derivation.
 */
export function BatchRunSelector() {
  const dispatch = useAppDispatch()
  const shouldShowBatch = useAppSelector(selectShouldShowBatch)
  const effectiveBatchRunId = useAppSelector(selectEffectiveBatchRunId)
  const batchRunOptions = useAppSelector(selectBatchRunOptions)

  if (!shouldShowBatch || batchRunOptions.length === 0) return null

  return (
    <div className='min-w-[180px]'>
      <Select
        value={effectiveBatchRunId ? effectiveBatchRunId.toString() : ''}
        onValueChange={(value) => {
          dispatch(setSelectedBatchRunId(Number(value)))
        }}
      >
        <SelectTrigger className='h-8 bg-background text-xs'>
          <SelectValue placeholder='Select batch run' />
        </SelectTrigger>
        <SelectContent>
          {batchRunOptions.map((status) => (
            <SelectItem
              key={status.workflowRunId}
              value={String(status.workflowRunId)}
            >
              {status.fileName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
