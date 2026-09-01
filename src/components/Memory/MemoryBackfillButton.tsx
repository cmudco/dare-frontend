import { useEffect, useRef, useState } from 'react'
import { History, Loader2, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  getMemoryBackfill,
  getMemoryItems,
  getRetiredMemoryItems,
  startMemoryBackfill,
  stopMemoryBackfill,
} from '@/redux/asyncThunks/memory'
import { MemoryBackfillStatus } from '@/redux/types/memory'
import { toast } from '@/utils/toast'

const POLL_INTERVAL_MS = 3000

const MemoryBackfillButton = () => {
  const dispatch = useAppDispatch()
  const run = useAppSelector((state) => state.memory.backfillRun)
  const runId = run?.id
  const loading = useAppSelector((state) => state.memory.backfillLoading)
  const starting = useAppSelector((state) => state.memory.backfillStarting)
  const stopping = useAppSelector((state) => state.memory.backfillStopping)
  const error = useAppSelector((state) => state.memory.backfillError)
  const trackedRunId = useRef<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [since, setSince] = useState('')
  const [until, setUntil] = useState('')

  const inProgress =
    run?.status === MemoryBackfillStatus.QUEUED ||
    run?.status === MemoryBackfillStatus.RUNNING

  useEffect(() => {
    if (!inProgress || !runId) return
    trackedRunId.current = runId

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const poll = async () => {
      const result = await dispatch(getMemoryBackfill())
      if (cancelled || !getMemoryBackfill.fulfilled.match(result)) return

      const next = result.payload.run
      const stillRunning =
        next?.status === MemoryBackfillStatus.QUEUED ||
        next?.status === MemoryBackfillStatus.RUNNING
      if (stillRunning) timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    timer = setTimeout(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [dispatch, inProgress, runId])

  useEffect(() => {
    if (!run || trackedRunId.current !== run.id) return
    if (run.status === MemoryBackfillStatus.COMPLETED) {
      trackedRunId.current = null
      dispatch(getMemoryItems())
      dispatch(getRetiredMemoryItems())
      toast.success(
        `Built memory from ${run.processedTurns} past ${
          run.processedTurns === 1 ? 'chat turn' : 'chat turns'
        }`
      )
    } else if (run.status === MemoryBackfillStatus.STOPPED) {
      trackedRunId.current = null
      dispatch(getMemoryItems())
      dispatch(getRetiredMemoryItems())
      toast.info(`Memory import stopped after ${run.processedTurns} chat turns`)
    } else if (run.status === MemoryBackfillStatus.FAILED) {
      trackedRunId.current = null
      toast.error(run.errorMessage || 'Memory building stopped. Try again.')
    }
  }, [dispatch, run])

  const handleStart = async () => {
    if (since && until && since > until) {
      toast.error('End date must be on or after the start date')
      return
    }

    const result = await dispatch(
      startMemoryBackfill({
        ...(since ? { since } : {}),
        ...(until ? { until } : {}),
      })
    )
    if (startMemoryBackfill.rejected.match(result)) {
      toast.error(
        (result.payload as string) || 'Memory building could not start'
      )
      return
    }
    if (!startMemoryBackfill.fulfilled.match(result) || !result.payload.run)
      return

    setDialogOpen(false)
    if (result.payload.run.status === MemoryBackfillStatus.COMPLETED) {
      toast.info('No unprocessed chat turns were found in that date range')
      return
    }
    toast.info('Memory build started — you can leave this page while it runs')
  }

  const handleStop = async () => {
    const result = await dispatch(stopMemoryBackfill())
    if (stopMemoryBackfill.rejected.match(result)) {
      toast.error((result.payload as string) || 'Memory import could not stop')
    }
  }

  const progressLabel =
    run?.status === MemoryBackfillStatus.QUEUED
      ? 'Preparing chats…'
      : `Building ${run?.processedTurns ?? 0}/${run?.totalTurns ?? 0}`

  if (inProgress) {
    return (
      <div className='flex items-center gap-2'>
        <Button variant='outline' disabled>
          <Loader2 className='h-4 w-4 animate-spin' />
          {progressLabel}
        </Button>
        <Button variant='outline' onClick={handleStop} disabled={stopping}>
          {stopping ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Square className='h-3.5 w-3.5' />
          )}
          {stopping ? 'Stopping…' : 'Stop import'}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant='outline'
        onClick={() => setDialogOpen(true)}
        disabled={(loading && !run) || starting}
        title={
          error ||
          'Review your previous conversations through the current memory pipeline'
        }
      >
        {(loading && !run) || starting ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <History className='h-4 w-4' />
        )}
        {loading && !run ? 'Checking chats…' : 'Build from past chats'}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Build memory from past chats</DialogTitle>
            <DialogDescription>
              Run past chat turns through the current memory pipeline. Leave
              both dates empty to review all unprocessed chats.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='memory-backfill-since'>From (optional)</Label>
              <Input
                id='memory-backfill-since'
                type='date'
                value={since}
                max={until || undefined}
                onChange={(event) => setSince(event.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='memory-backfill-until'>To (optional)</Label>
              <Input
                id='memory-backfill-until'
                type='date'
                value={until}
                min={since || undefined}
                onChange={(event) => setUntil(event.target.value)}
              />
            </div>
          </div>

          <p className='text-xs text-muted-foreground'>
            The range is inclusive. Memories already created are skipped, and
            stopping later does not remove completed memories.
          </p>

          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setDialogOpen(false)}
              disabled={starting}
            >
              Cancel
            </Button>
            <Button type='button' onClick={handleStart} disabled={starting}>
              {starting && <Loader2 className='h-4 w-4 animate-spin' />}
              {starting ? 'Starting…' : 'Start import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MemoryBackfillButton
