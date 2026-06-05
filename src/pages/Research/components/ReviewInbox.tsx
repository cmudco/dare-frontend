import { AnimatePresence } from 'framer-motion'
import { Compass, Inbox, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResearchStagingItem } from '@/redux/types/research'
import ReviewItemCard from './ReviewItemCard'

interface Props {
  pending: ResearchStagingItem[]
  later: ResearchStagingItem[]
  rejected: ResearchStagingItem[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onLater: (id: number) => void
  onRestore: (id: number) => void
  onGoToOverview: () => void
}

const ReviewInbox = ({
  pending,
  later,
  rejected,
  onApprove,
  onReject,
  onLater,
  onRestore,
  onGoToOverview,
}: Props) => {
  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Review Inbox</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Staged findings wait here. Nothing becomes project knowledge until you
          approve it.
        </p>
      </header>

      {pending.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <Inbox className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>Your inbox is clear</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Stage a source from the Sources tab or wait for delegated agents in
            a later phase.
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
                onApprove={onApprove}
                onReject={onReject}
                onLater={onLater}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {later.length > 0 && (
        <ReviewQueue
          title={`Saved for later · ${later.length}`}
          items={later}
          reasonField='laterReason'
          onRestore={onRestore}
        />
      )}

      {rejected.length > 0 && (
        <ReviewQueue
          title={`Rejected · ${rejected.length}`}
          items={rejected}
          reasonField='rejectionReason'
          onRestore={onRestore}
        />
      )}
    </div>
  )
}

const ReviewQueue = ({
  title,
  items,
  reasonField,
  onRestore,
}: {
  title: string
  items: ResearchStagingItem[]
  reasonField: 'laterReason' | 'rejectionReason'
  onRestore: (id: number) => void
}) => (
  <section className='pt-2'>
    <h3 className='mb-3 text-sm font-medium text-muted-foreground'>{title}</h3>
    <div className='space-y-2'>
      {items.map((item) => (
        <div
          key={item.id}
          className='flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3'
        >
          <div className='min-w-0'>
            <p className='truncate text-sm font-medium'>{item.title}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {item[reasonField] || 'No reason recorded.'}
            </p>
          </div>
          <Button size='sm' variant='ghost' onClick={() => onRestore(item.id)}>
            <RotateCcw className='h-4 w-4' /> Restore
          </Button>
        </div>
      ))}
    </div>
  </section>
)

export default ReviewInbox
