import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Clock,
  Loader2,
  MessageSquareText,
  MessagesSquare,
  ShieldQuestion,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReviewItem, ReviewReasonTag } from '../types'
import EvidenceCard from './EvidenceCard'
import ReviewNotePanel from './ReviewNotePanel'

interface Props {
  item: ReviewItem
  /** True while the Critic is assessing this item. */
  critiquing: boolean
  onDecide: (
    id: number,
    decision: 'approve' | 'reject',
    note: string,
    tags: ReviewReasonTag[]
  ) => Promise<void>
  onLater: (id: number) => void
  onAskCritic: (id: number) => void
  /** Open the chat thread whose Scout staged this item. */
  onOpenThread?: (threadId: number) => void
}

// forwardRef: AnimatePresence's popLayout measures each card through a ref.
const ReviewItemCard = forwardRef<HTMLDivElement, Props>(
  function ReviewItemCard(
    { item, critiquing, onDecide, onLater, onAskCritic, onOpenThread },
    ref
  ) {
    const [noting, setNoting] = useState<'approve' | 'reject' | null>(null)
    const [deciding, setDeciding] = useState(false)
    const hasCritic = !!(item.criticMetadata as { verdict?: string })?.verdict

    const decide = async (
      decision: 'approve' | 'reject',
      note: string,
      tags: ReviewReasonTag[]
    ) => {
      setDeciding(true)
      try {
        await onDecide(item.id, decision, note, tags)
      } finally {
        setDeciding(false)
        setNoting(null)
      }
    }

    const actions = (
      <>
        {noting && (
          <div className='-mx-5 pb-3'>
            <ReviewNotePanel
              decision={noting}
              busy={deciding}
              onConfirm={(note, tags) => void decide(noting, note, tags)}
              onCancel={() => setNoting(null)}
            />
          </div>
        )}
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            size='sm'
            disabled={deciding}
            onClick={() => void decide('approve', '', [])}
          >
            <Check className='h-4 w-4' /> Approve
          </Button>
          <Button
            size='sm'
            variant='ghost'
            disabled={deciding}
            onClick={() => setNoting('approve')}
            aria-label='Approve with a note'
          >
            <MessageSquareText className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            disabled={deciding}
            onClick={() => setNoting('reject')}
          >
            <X className='h-4 w-4' /> Reject
          </Button>
          <Button size='sm' variant='ghost' onClick={() => onLater(item.id)}>
            <Clock className='h-4 w-4' /> Later
          </Button>
          {item.threadId && onOpenThread && (
            <Button
              size='sm'
              variant='ghost'
              className='ml-auto'
              onClick={() => onOpenThread(item.threadId as number)}
            >
              <MessagesSquare className='h-4 w-4' /> Thread
            </Button>
          )}
          <Button
            size='sm'
            variant='ghost'
            className={item.threadId && onOpenThread ? '' : 'ml-auto'}
            disabled={critiquing}
            onClick={() => onAskCritic(item.id)}
          >
            {critiquing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' /> Assessing…
              </>
            ) : (
              <>
                <ShieldQuestion className='h-4 w-4' />
                {hasCritic ? 'Re-run Critic' : 'Ask Critic'}
              </>
            )}
          </Button>
        </div>
      </>
    )

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
      >
        <EvidenceCard item={item} footer={actions} />
      </motion.div>
    )
  }
)

export default ReviewItemCard
