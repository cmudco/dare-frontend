import { AnimatePresence } from 'framer-motion'
import { Compass, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MemoryProposal, ReviewItem } from '../types'
import MemoryProposalQueue from './MemoryProposalQueue'
import ReviewItemCard from './ReviewItemCard'

interface Props {
  pending: ReviewItem[]
  later: ReviewItem[]
  /** The item currently being assessed by the Critic, if any. */
  criticItemId: number | null
  /** Facts the agent wants to remember — the same kind of decision as a source. */
  memoryProposals: MemoryProposal[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onLater: (id: number) => void
  onAskCritic: (id: number) => void
  onGoToOverview: () => void
  onMemoryDecided: () => void
}

const ReviewInbox = ({
  pending,
  later,
  criticItemId,
  memoryProposals,
  onApprove,
  onReject,
  onLater,
  onAskCritic,
  onGoToOverview,
  onMemoryDecided,
}: Props) => {
  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Review Inbox</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Scout's findings wait here. Nothing becomes project knowledge until
          you approve it.
        </p>
      </header>

      {/* Memory decisions surface here too. A scholar who only ever opens the
          inbox should not have to find a second queue behind a tab. */}
      <MemoryProposalQueue
        proposals={memoryProposals}
        onDecided={onMemoryDecided}
        title='Memory the agent wants to keep'
        note='Keep it and it becomes project memory you own; discard it and the agent forgets it too.'
      />

      {pending.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <Inbox className='h-6 w-6 text-muted-foreground' />
          </div>
          {/* Names sources specifically: memory decisions can be waiting right
              above this, and "your inbox is clear" would contradict them. */}
          <p className='text-sm font-medium'>No sources waiting</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Run Scout from the Overview to gather candidate sources for review.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={onGoToOverview}
          >
            <Compass className='h-4 w-4' /> Go to Overview
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          <AnimatePresence mode='popLayout'>
            {pending.map((item) => (
              <ReviewItemCard
                key={item.id}
                item={item}
                critiquing={criticItemId === item.id}
                onApprove={onApprove}
                onReject={onReject}
                onLater={onLater}
                onAskCritic={onAskCritic}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {later.length > 0 && (
        <section className='pt-2'>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
            Saved for later · {later.length}
          </h3>
          <div className='space-y-2'>
            {later.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3'
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>{item.title}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {item.authors} · {item.year}
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onApprove(item.id)}
                >
                  Approve
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ReviewInbox
