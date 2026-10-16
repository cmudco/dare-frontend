import { Inbox, Telescope } from 'lucide-react'
import { REVIEW_REASON_TAGS, isRunInFlight } from '@/utils/constants/research'
import type { ThreadDetail, ThreadEventRow } from '@/redux/types/research'
import ProposalCard from '../learning/ProposalCard'
import ScoutBoard from './ScoutBoard'

interface Props {
  event: ThreadEventRow
  detail: ThreadDetail
  onChanged: () => void
  onGoToReview: () => void
}

const DECISION_VERB = {
  approve: 'approved',
  reject: 'rejected',
  later: 'saved for later',
} as const

const tagLabel = (value: string) =>
  REVIEW_REASON_TAGS.find((tag) => tag.value === value)?.label ?? value

/**
 * A DARE event inside a thread. Scout launches render as a live board;
 * memory proposals as an inline decision card showing their latest status.
 * `scout_finished` and `memory_decided` exist for the agent — the board and
 * the card already show the scholar the same thing, so they render nothing.
 */
const ThreadEvent = ({ event, detail, onChanged, onGoToReview }: Props) => {
  switch (event.eventType) {
    case 'scouts_launched': {
      const ids = new Set(event.payload.scouts.map((s) => s.runId))
      const scouts = detail.scouts.filter((s) => ids.has(s.runId))
      if (scouts.length === 0) return null
      // While they work, progress lives in the live bar by the composer; the
      // full card returns here, with results, once they are done.
      if (scouts.some((s) => isRunInFlight(s.status))) {
        return (
          <p className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Telescope className='h-3.5 w-3.5' />
            Launched {scouts.map((s) => s.focus).join(', ')} — progress is
            below, results land here.
          </p>
        )
      }
      return (
        <ScoutBoard
          scouts={scouts}
          onChanged={onChanged}
          onGoToReview={onGoToReview}
        />
      )
    }
    case 'review_decision': {
      const { decision, title, itemId, note, tags } = event.payload
      return (
        <div className='flex items-start gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground'>
          <Inbox className='mt-0.5 h-3.5 w-3.5 shrink-0' />
          <p>
            You {DECISION_VERB[decision]} #{itemId}{' '}
            <span className='text-foreground'>“{title}”</span>
            {tags.length > 0 && <> · {tags.map(tagLabel).join(', ')}</>}
            {note && (
              <>
                {' '}
                · <span className='text-foreground italic'>“{note}”</span>
              </>
            )}
          </p>
        </div>
      )
    }
    case 'memory_proposed': {
      const latest =
        detail.proposals[String(event.payload.proposalId)] ?? event.payload
      return (
        <ProposalCard
          key={latest.status}
          proposal={{ ...latest, id: latest.proposalId }}
          onDecided={onChanged}
          compact
        />
      )
    }
    case 'scout_finished':
    case 'memory_decided':
      return null
  }
}

export default ThreadEvent
