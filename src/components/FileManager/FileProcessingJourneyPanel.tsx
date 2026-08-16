import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  MinusCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react'

import { getFileProcessingJourneyAPI } from '@/api/files'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileProcessingJourneyResponse,
  ProcessingJourneyAttempt,
  ProcessingJourneyStage,
  ProcessingJourneyStageStatus,
} from '@/redux/types/files'
import { FileStatus } from '@/utils/constants/file'
import {
  JOURNEY_DETAIL_LABELS,
  STAGE_ICONS,
  STAGE_STATUS_LABELS,
  STAGE_STATUS_VARIANTS,
} from '@/utils/constants/fileProcessingJourney'
import { formatDateTime } from '@/utils/dateUtils'
import { formatJourneyDetail, formatJourneyDuration } from '@/utils/files'

interface FileProcessingJourneyPanelProps {
  fileId: number | null
}

const FileProcessingJourneyPanel = ({
  fileId,
}: FileProcessingJourneyPanelProps) => {
  const [data, setData] = useState<FileProcessingJourneyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJourney = useCallback(async () => {
    if (!fileId) return
    try {
      const response = await getFileProcessingJourneyAPI(fileId)
      setData(response)
      setError(null)
    } catch {
      setError('Could not load this processing journey. Try again.')
    } finally {
      setLoading(false)
    }
  }, [fileId])

  useEffect(() => {
    setData(null)
    setError(null)
    setLoading(Boolean(fileId))
    fetchJourney()
  }, [fetchJourney, fileId])

  useEffect(() => {
    if (!fileId || data?.status !== FileStatus.PROCESSING) return
    const timeout = window.setTimeout(fetchJourney, 2000)
    return () => window.clearTimeout(timeout)
  }, [data, fetchJourney, fileId])

  if (loading && !data) {
    return (
      <div className='space-y-3 p-1'>
        <Skeleton className='h-24 w-full' />
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className='h-20 w-full' />
        ))}
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className='flex flex-col items-center justify-center space-y-3 py-12'>
        <AlertCircle className='h-10 w-10 text-destructive' />
        <p className='text-sm text-muted-foreground'>{error}</p>
        <Button variant='outline' size='sm' onClick={fetchJourney}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!data) return null

  const attempts = data.journey.attempts ?? []
  const latestAttempt = attempts[attempts.length - 1]

  return (
    <div className='space-y-4 p-1'>
      <section className='rounded-lg border border-border bg-card p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-sm font-medium'>Processing journey</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Uploaded {formatDateTime(data.createdAt)}
            </p>
          </div>
          <JourneyStatusBadge data={data} />
        </div>

        <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
          <JourneyMetric
            label='Total time'
            value={formatJourneyDuration(latestAttempt?.durationSeconds)}
          />
          <JourneyMetric label='Attempts' value={String(attempts.length)} />
          <JourneyMetric
            label='Parser'
            value={data.parserName || 'Not recorded'}
          />
          <JourneyMetric
            label='Pages'
            value={data.pageCount == null ? '—' : String(data.pageCount)}
          />
        </div>
      </section>

      {attempts.length === 0 ? (
        <div className='rounded-lg border border-dashed border-border p-8 text-center'>
          <Clock3 className='mx-auto h-8 w-8 text-muted-foreground' />
          <p className='mt-3 text-sm font-medium'>No detailed trace recorded</p>
          <p className='mx-auto mt-1 max-w-lg text-sm text-muted-foreground'>
            This file was processed before journey tracing was enabled.
            Reprocess it to record Docling, vision, embedding, and indexing
            timings.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {[...attempts].reverse().map((attempt, index) => (
            <AttemptCard
              key={`${attempt.number}-${attempt.startedAt}`}
              attempt={attempt}
              latest={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const JourneyStatusBadge = ({
  data,
}: {
  data: FileProcessingJourneyResponse
}) => {
  if (data.status === FileStatus.PROCESSING) {
    return (
      <Badge variant='blue'>
        <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
        {data.stageLabel}
      </Badge>
    )
  }
  if (data.status === FileStatus.FAILED) {
    return (
      <Badge variant='red'>
        <XCircle className='mr-1.5 h-3.5 w-3.5' /> Failed
      </Badge>
    )
  }
  if (data.status === FileStatus.NEEDS_OCR) {
    return <Badge variant='yellow'>Needs OCR</Badge>
  }
  return (
    <Badge variant='green'>
      <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' /> Complete
    </Badge>
  )
}

const JourneyMetric = ({ label, value }: { label: string; value: string }) => (
  <div className='rounded-md bg-muted p-3'>
    <p className='text-xs text-muted-foreground'>{label}</p>
    <p className='mt-1 truncate text-sm font-medium tabular-nums' title={value}>
      {value}
    </p>
  </div>
)

const AttemptCard = ({
  attempt,
  latest,
}: {
  attempt: ProcessingJourneyAttempt
  latest: boolean
}) => (
  <details
    open={latest}
    className='group rounded-lg border border-border bg-card'
  >
    <summary className='flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden'>
      <div className='flex min-w-0 items-center gap-3'>
        <RotateCcw className='h-4 w-4 shrink-0 text-muted-foreground' />
        <div className='min-w-0'>
          <p className='text-sm font-medium'>Attempt {attempt.number}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {formatDateTime(attempt.startedAt)} ·{' '}
            {formatJourneyDuration(attempt.durationSeconds)}
          </p>
        </div>
      </div>
      <AttemptStatusBadge attempt={attempt} />
    </summary>

    <div className='border-t border-border px-4 py-2'>
      {attempt.stages.map((stage, index) => (
        <StageRow
          key={`${stage.key}-${stage.startedAt}`}
          stage={stage}
          last={index === attempt.stages.length - 1}
        />
      ))}
      {attempt.error &&
        !attempt.stages.some(
          (stage) => stage.status === 'failed' && stage.error === attempt.error
        ) && (
          <div className='my-3 rounded-md border border-destructive/30 bg-destructive/5 p-3'>
            <p className='text-xs font-medium text-destructive'>
              Attempt error
            </p>
            <p className='mt-1 text-xs break-words text-muted-foreground'>
              {attempt.error}
            </p>
          </div>
        )}
    </div>
  </details>
)

const AttemptStatusBadge = ({
  attempt,
}: {
  attempt: ProcessingJourneyAttempt
}) => {
  if (attempt.status === 'processing') {
    return (
      <Badge variant='blue'>
        <Loader2 className='mr-1 h-3 w-3 animate-spin' /> Running
      </Badge>
    )
  }
  if (attempt.status === 'failed') return <Badge variant='red'>Failed</Badge>
  if (attempt.outcome === 'needs ocr') {
    return <Badge variant='yellow'>Needs OCR</Badge>
  }
  return <Badge variant='green'>Complete</Badge>
}

const StageRow = ({
  stage,
  last,
}: {
  stage: ProcessingJourneyStage
  last: boolean
}) => {
  const Icon = STAGE_ICONS[stage.key]
  const entries = Object.entries(stage.details ?? {}).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  )

  return (
    <div className='relative flex gap-3 py-3'>
      {!last && (
        <span className='absolute top-9 bottom-[-0.75rem] left-[0.9375rem] w-px bg-border' />
      )}
      <div className='relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background'>
        <Icon className='h-4 w-4 text-muted-foreground' />
        <span className='absolute -right-1 -bottom-1 rounded-full bg-background'>
          <StageStatusIcon status={stage.status} />
        </span>
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <p className='text-sm font-medium'>{stage.label}</p>
            <p className='text-xs text-muted-foreground'>
              {formatJourneyDuration(stage.durationSeconds)}
            </p>
          </div>
          <Badge variant={STAGE_STATUS_VARIANTS[stage.status]}>
            {STAGE_STATUS_LABELS[stage.status]}
          </Badge>
        </div>

        {entries.length > 0 && (
          <dl className='mt-2 grid grid-cols-1 gap-x-4 gap-y-1 rounded-md bg-muted/60 p-2.5 text-xs sm:grid-cols-2'>
            {entries.map(([key, value]) => (
              <div key={key} className='flex min-w-0 justify-between gap-2'>
                <dt className='text-muted-foreground'>
                  {JOURNEY_DETAIL_LABELS[key] ?? key}
                </dt>
                <dd
                  className='truncate text-right font-medium'
                  title={String(value)}
                >
                  {formatJourneyDetail(key, value)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {stage.error && (
          <div className='mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5'>
            <p className='text-xs font-medium text-destructive'>
              Failed at this stage
            </p>
            <p className='mt-1 text-xs break-words text-muted-foreground'>
              {stage.error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const StageStatusIcon = ({
  status,
}: {
  status: ProcessingJourneyStageStatus
}) => {
  const className = 'h-4 w-4'
  if (status === 'running') {
    return <Loader2 className={`${className} animate-spin text-blue-500`} />
  }
  if (status === 'complete') {
    return <CheckCircle2 className={`${className} text-green-500`} />
  }
  if (status === 'failed') {
    return <XCircle className={`${className} text-destructive`} />
  }
  if (status === 'partial') {
    return <AlertCircle className={`${className} text-yellow-500`} />
  }
  if (status === 'skipped') {
    return <MinusCircle className={`${className} text-muted-foreground`} />
  }
  return <Circle className={`${className} text-muted-foreground`} />
}

export default FileProcessingJourneyPanel
