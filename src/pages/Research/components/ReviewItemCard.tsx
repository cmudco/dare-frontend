import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  MessageCircleQuestion,
  ShieldCheck,
  ShieldAlert,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReviewItem } from '../types'
import ConfidenceBar from './ConfidenceBar'
import { signalMeta, toolMeta } from './signals'

interface Props {
  item: ReviewItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onLater: (id: string) => void
  onAskCritic: (id: string) => void
}

const ReviewItemCard = ({
  item,
  onApprove,
  onReject,
  onLater,
  onAskCritic,
}: Props) => {
  const [expanded, setExpanded] = useState(false)
  const signal = signalMeta[item.citationSignal]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className='rounded-xl border border-border bg-card text-card-foreground shadow-sm'
    >
      {/* Collapsed summary — the only thing shown at rest */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className='flex w-full items-start gap-3 px-5 pt-5 text-left'
      >
        <div className='min-w-0 flex-1'>
          <div className='mb-1.5 flex flex-wrap items-center gap-2'>
            <Badge variant={signal.badge} className='gap-1.5'>
              <span className={cn('h-1.5 w-1.5 rounded-full', signal.dot)} />
              {signal.label}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              via {toolMeta[item.toolSource]}
            </span>
          </div>
          <h3 className='truncate text-[15px] font-semibold leading-snug tracking-tight'>
            {item.title}
          </h3>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {item.authors} · {item.venue} · {item.year}
          </p>
          <p className='mt-2 line-clamp-1 text-sm text-foreground/80'>
            {item.whyItMatters}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* Confidence sits with the summary so judgement is never hidden */}
      <div className='px-5 pt-3'>
        <ConfidenceBar value={item.confidence} />
      </div>

      {/* Progressive disclosure — rationale, context, provenance */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='overflow-hidden px-5'
        >
          <div className='mt-4 space-y-4 border-t border-border pt-4 text-sm'>
            <Field label='Why it matters'>{item.rationale}</Field>
            <Field label='Confidence rationale'>
              {item.confidenceRationale}
            </Field>
            <Field label='Citation context'>
              <span className='italic text-foreground/80'>
                {item.citationContext}
              </span>
            </Field>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
              <span>Source: {toolMeta[item.toolSource]}</span>
              <span>·</span>
              <span>{item.provenance.retrievalDepth}</span>
              <span>·</span>
              <span>{item.provenance.retrievedAt}</span>
              <span>·</span>
              <span>Standards: {item.provenance.soulFileVersion}</span>
              <a
                href={item.url}
                target='_blank'
                rel='noreferrer'
                onClick={(e) => e.stopPropagation()}
                className='inline-flex items-center gap-1 text-primary hover:underline'
              >
                Open <ExternalLink className='h-3 w-3' />
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Critic verdict, once requested */}
      {item.critic && (
        <div className='mx-5 mt-4 rounded-lg border border-border bg-muted/40 p-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            {item.critic.outcome === 'pass' ? (
              <ShieldCheck className='h-4 w-4 text-green-600 dark:text-green-400' />
            ) : (
              <ShieldAlert className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            )}
            Critic ·{' '}
            {item.critic.outcome === 'pass'
              ? 'Holds up'
              : 'Worth a second look'}
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {item.critic.reasoning}
          </p>
        </div>
      )}

      {/* Actions — approval is the deliberate, human act */}
      <div className='flex flex-wrap items-center gap-2 p-5 pt-4'>
        <Button size='sm' onClick={() => onApprove(item.id)}>
          <Check className='h-4 w-4' /> Approve
        </Button>
        <Button size='sm' variant='outline' onClick={() => onReject(item.id)}>
          <X className='h-4 w-4' /> Reject
        </Button>
        <Button size='sm' variant='ghost' onClick={() => onLater(item.id)}>
          <Clock className='h-4 w-4' /> Later
        </Button>
        <Button
          size='sm'
          variant='ghost'
          className='ml-auto'
          disabled={!!item.critic}
          onClick={() => onAskCritic(item.id)}
        >
          <MessageCircleQuestion className='h-4 w-4' />
          {item.critic ? 'Critic asked' : 'Ask Critic'}
        </Button>
      </div>
    </motion.div>
  )
}

const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div>
    <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
      {label}
    </p>
    <p className='leading-relaxed text-foreground/90'>{children}</p>
  </div>
)

export default ReviewItemCard
