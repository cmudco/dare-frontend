import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CheckCheck, Inbox, MessagesSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AgentRun, ReviewItem, ReviewReasonTag } from '../types'
import ReviewItemCard from './ReviewItemCard'
import ScoutGroupHeader from './ScoutGroupHeader'
import { groupByScout, isStrong } from './signals'

interface Props {
  pending: ReviewItem[]
  later: ReviewItem[]
  runs: AgentRun[]
  /** The item currently being assessed by the Critic, if any. */
  criticItemId: number | null
  onDecide: (
    id: number,
    decision: 'approve' | 'reject',
    note: string,
    tags: ReviewReasonTag[]
  ) => Promise<void>
  onApproveMany: (ids: number[]) => Promise<void>
  onLater: (id: number) => void
  onAskCritic: (id: number) => void
  onOpenThread: (threadId: number) => void
  onGoToChat: () => void
}

const byStrength = (a: ReviewItem, b: ReviewItem) =>
  Number(isStrong(b)) - Number(isStrong(a)) ||
  (b.confidence ?? 0) - (a.confidence ?? 0)

const ReviewInbox = ({
  pending,
  later,
  runs,
  criticItemId,
  onDecide,
  onApproveMany,
  onLater,
  onAskCritic,
  onOpenThread,
  onGoToChat,
}: Props) => {
  const [approving, setApproving] = useState<string | null>(null)
  const runById = new Map(runs.map((r) => [r.id, r]))
  const groups = groupByScout(pending)

  const approveAll = async (key: string, items: ReviewItem[]) => {
    setApproving(key)
    try {
      await onApproveMany(items.map((i) => i.id))
    } finally {
      setApproving(null)
    }
  }

  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Review Inbox</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          What each Scout found, grouped by the question it was sent to answer.
          Each finding shows the sentence on the page that backs it. Nothing
          becomes project knowledge until you approve it.
        </p>
      </header>

      {pending.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <Inbox className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>Your inbox is clear</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Ask a question in Chat and send a Scout to look into it. What it
            finds lands here.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={onGoToChat}
          >
            <MessagesSquare className='h-4 w-4' /> Go to Chat
          </Button>
        </div>
      ) : (
        groups.map((group) => {
          const strong = group.items.filter(isStrong)
          return (
            <section key={group.key} className='space-y-3'>
              <ScoutGroupHeader
                focus={group.focus}
                task={group.task}
                run={group.runId ? runById.get(group.runId) : undefined}
                count={group.items.length}
              >
                {strong.length > 1 && (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={approving !== null}
                    onClick={() => void approveAll(group.key, strong)}
                    title='Approve the findings that were opened, quoted correctly, unflagged and at least 70% confident'
                  >
                    <CheckCheck className='h-4 w-4' />
                    {approving === group.key
                      ? 'Approving…'
                      : `Approve ${strong.length} checked`}
                  </Button>
                )}
              </ScoutGroupHeader>
              <AnimatePresence mode='popLayout'>
                {[...group.items].sort(byStrength).map((item) => (
                  <ReviewItemCard
                    key={item.id}
                    item={item}
                    critiquing={criticItemId === item.id}
                    onDecide={onDecide}
                    onLater={onLater}
                    onAskCritic={onAskCritic}
                    onOpenThread={onOpenThread}
                  />
                ))}
              </AnimatePresence>
            </section>
          )
        })
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
                className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>
                    {item.finding || item.title}
                  </p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {[item.title, item.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => void onDecide(item.id, 'approve', '', [])}
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
