import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { ReviewItem } from '../types'
import ConfidenceBar from './ConfidenceBar'
import { evidenceMeta, toolLabel } from './signals'

interface Props {
  item: ReviewItem
  /** True while the Critic is assessing this item. */
  critiquing: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onLater: (id: number) => void
  onAskCritic: (id: number) => void
}

interface CriticVerdict {
  verdict?: string
  reasoning?: string
  concerns?: string[]
}

const CRITIC_META: Record<
  string,
  { label: string; tone: string; Icon: typeof ShieldCheck }
> = {
  holds: {
    label: 'Holds up',
    tone: 'text-green-600 dark:text-green-400',
    Icon: ShieldCheck,
  },
  overstated: {
    label: 'Overstated',
    tone: 'text-amber-600 dark:text-amber-400',
    Icon: ShieldAlert,
  },
  unsupported: {
    label: 'Unsupported',
    tone: 'text-red-600 dark:text-red-400',
    Icon: ShieldX,
  },
  inconclusive: {
    label: 'Inconclusive',
    tone: 'text-muted-foreground',
    Icon: ShieldQuestion,
  },
}

const ReviewItemCard = ({
  item,
  critiquing,
  onApprove,
  onReject,
  onLater,
  onAskCritic,
}: Props) => {
  const [expanded, setExpanded] = useState(false)
  const signal = evidenceMeta(item.evidenceLabel)
  const confidence = Math.round((item.confidence ?? 0) * 100)
  const tool = toolLabel(item.provenance?.tool ?? '')
  const critic = item.criticMetadata as CriticVerdict | undefined
  const verdict = critic?.verdict ? CRITIC_META[critic.verdict] : undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className='rounded-xl border border-border bg-card text-card-foreground shadow-sm'
    >
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
            <span className='text-xs text-muted-foreground'>via {tool}</span>
          </div>
          <h3 className='truncate text-[15px] font-semibold leading-snug tracking-tight'>
            {item.title}
          </h3>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {[item.authors, item.venue, item.year].filter(Boolean).join(' · ')}
          </p>
          <p className='mt-2 line-clamp-1 text-sm text-foreground/80'>
            {item.rationale}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      <div className='px-5 pt-3'>
        <ConfidenceBar value={confidence} />
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='overflow-hidden px-5'
        >
          <div className='mt-4 space-y-4 border-t border-border pt-4 text-sm'>
            <Field label='Why it matters'>{item.rationale}</Field>
            {item.confidenceRationale && (
              <Field label='Confidence rationale'>
                {item.confidenceRationale}
              </Field>
            )}
            {item.citationContext && (
              <Field label='Citation context'>
                <span className='italic text-foreground/80'>
                  {item.citationContext}
                </span>
              </Field>
            )}
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
              <span>Tool: {tool}</span>
              {item.provenance?.query && (
                <>
                  <span>·</span>
                  <span className='truncate'>“{item.provenance.query}”</span>
                </>
              )}
              {item.provenance?.retrievedAt && (
                <>
                  <span>·</span>
                  <span>{formatRelativeDate(item.provenance.retrievedAt)}</span>
                </>
              )}
              {item.provenance?.soulFileVersion != null && (
                <>
                  <span>·</span>
                  <span>Standards: v{item.provenance.soulFileVersion}</span>
                </>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target='_blank'
                  rel='noreferrer'
                  onClick={(e) => e.stopPropagation()}
                  className='inline-flex items-center gap-1 text-primary hover:underline'
                >
                  Open <ExternalLink className='h-3 w-3' />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Critic verdict — the adversarial check, once run */}
      {verdict && (
        <div className='mx-5 mt-4 rounded-lg border border-border bg-muted/40 p-3'>
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              verdict.tone
            )}
          >
            <verdict.Icon className='h-4 w-4' />
            Critic · {verdict.label}
          </div>
          {critic?.reasoning && (
            <p className='mt-1 text-sm text-muted-foreground'>
              {critic.reasoning}
            </p>
          )}
          {!!critic?.concerns?.length && (
            <ul className='mt-2 list-disc space-y-0.5 pl-4 text-sm text-muted-foreground'>
              {critic.concerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

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
              {verdict ? 'Re-run Critic' : 'Ask Critic'}
            </>
          )}
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
