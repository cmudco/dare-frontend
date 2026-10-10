import { useState } from 'react'
import {
  CheckCircle2,
  CircleSlash,
  CornerDownRight,
  Loader2,
  Square,
  Telescope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cancelAgentRunAPI, redirectScoutAPI } from '@/api/research'
import { AgentRunStatus, isRunInFlight } from '@/utils/constants/research'
import type { ScoutSummary } from '@/redux/types/research'
import BecauseOfYou from './BecauseOfYou'
import ScoutActivityFeed from './ScoutActivityFeed'

interface Props {
  scouts: ScoutSummary[]
  onChanged: () => void
  onGoToReview: () => void
}

const StatusIcon = ({ status }: { status: string }) => {
  if (isRunInFlight(status))
    return <Loader2 className='h-4 w-4 animate-spin text-primary' />
  if (status === AgentRunStatus.COMPLETED)
    return <CheckCircle2 className='h-4 w-4 text-primary' />
  return <CircleSlash className='h-4 w-4 text-muted-foreground' />
}

const ScoutRow = ({
  scout,
  onChanged,
}: {
  scout: ScoutSummary
  onChanged: () => void
}) => {
  const [redirecting, setRedirecting] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const live = isRunInFlight(scout.status)

  const stop = async () => {
    setBusy(true)
    try {
      await cancelAgentRunAPI(scout.runId)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  const redirect = async () => {
    const text = instruction.trim()
    if (!text) return
    setBusy(true)
    try {
      await redirectScoutAPI(scout.runId, text)
      setRedirecting(false)
      setInstruction('')
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className='py-2.5'>
      <div className='flex items-center gap-2.5'>
        <StatusIcon status={scout.status} />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{scout.focus}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {scout.statusDetail || scout.status}
            {scout.staged > 0 && !live && ` · ${scout.staged} in your inbox`}
          </p>
        </div>
        {live && (
          <div className='flex shrink-0 gap-1'>
            <Button
              size='sm'
              variant='ghost'
              disabled={busy}
              onClick={() => setRedirecting((open) => !open)}
            >
              <CornerDownRight className='h-3.5 w-3.5' /> Redirect
            </Button>
            <Button size='sm' variant='ghost' disabled={busy} onClick={stop}>
              <Square className='h-3.5 w-3.5' /> Stop
            </Button>
          </div>
        )}
      </div>
      {redirecting && (
        <form
          className='mt-2 flex gap-2 pl-6.5'
          onSubmit={(e) => {
            e.preventDefault()
            void redirect()
          }}
        >
          <Input
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder='e.g. only randomized trials since 2020'
            aria-label={`Redirect ${scout.focus}`}
          />
          <Button
            size='sm'
            type='submit'
            disabled={busy || !instruction.trim()}
          >
            Redirect
          </Button>
        </form>
      )}
      <div className='pl-6.5'>
        <ScoutActivityFeed activity={scout.activity} live={live} />
        {!live && (
          <BecauseOfYou applied={scout.applied} setAside={scout.setAside} />
        )}
      </div>
    </li>
  )
}

/** The live card for a batch of Scouts launched from the thread. */
const ScoutBoard = ({ scouts, onChanged, onGoToReview }: Props) => {
  const running = scouts.filter((s) => isRunInFlight(s.status)).length
  const staged = scouts.reduce((sum, s) => sum + s.staged, 0)
  return (
    <div className='rounded-xl border border-border bg-card px-4 py-3'>
      <div className='flex items-center gap-2 text-sm'>
        <Telescope className='h-4 w-4 text-primary' />
        <span className='font-medium'>
          {running > 0
            ? `${running} of ${scouts.length} Scout${scouts.length === 1 ? '' : 's'} running`
            : `${scouts.length} Scout${scouts.length === 1 ? '' : 's'} finished`}
        </span>
        {running > 0 && (
          <span className='text-xs text-muted-foreground'>
            · keep chatting, they run in the background
          </span>
        )}
        {running === 0 && staged > 0 && (
          <Button
            size='sm'
            variant='link'
            className='ml-auto h-auto p-0'
            onClick={onGoToReview}
          >
            Review {staged} finding{staged === 1 ? '' : 's'}
          </Button>
        )}
      </div>
      <ul className='mt-1 divide-y divide-border'>
        {scouts.map((scout) => (
          <ScoutRow key={scout.runId} scout={scout} onChanged={onChanged} />
        ))}
      </ul>
    </div>
  )
}

export default ScoutBoard
