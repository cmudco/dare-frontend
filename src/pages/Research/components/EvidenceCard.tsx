import { useState } from 'react'
import {
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { REVIEW_REASON_TAGS } from '@/utils/constants/research'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { ReviewItem } from '../types'
import ConfidenceBar from './ConfidenceBar'
import SourceCheckBadges from './SourceCheckBadges'
import { evidenceMeta, toolLabel } from './signals'

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

const tagLabel = (value: string) =>
  REVIEW_REASON_TAGS.find((tag) => tag.value === value)?.label ?? value

interface Props {
  item: ReviewItem
  /** Hide the Scout's question when the card already sits under it. */
  showTask?: boolean
  /** Actions (review) or the approval line (knowledge). */
  footer?: React.ReactNode
}

/**
 * One finding as a researcher reads it: what the source establishes, the
 * sentence on the page that backs it, then the source. The same card is used
 * in the Review Inbox and in approved knowledge, so nothing is lost on approval.
 */
const EvidenceCard = ({ item, showTask = false, footer }: Props) => {
  const [open, setOpen] = useState(false)
  const signal = evidenceMeta(item.evidenceLabel)
  const confidence = Math.round((item.confidence ?? 0) * 100)
  const check = item.provenance?.check
  const critic = item.criticMetadata as CriticVerdict | undefined
  const verdict = critic?.verdict ? CRITIC_META[critic.verdict] : undefined
  const review = item.reviewMetadata ?? {}
  const finding = item.finding || item.rationale
  const why = item.finding ? item.rationale : ''

  return (
    <div className='rounded-xl border border-border bg-card text-card-foreground shadow-xs'>
      <div className='px-5 pt-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant={signal.badge} className='gap-1.5' title={signal.hint}>
            <span className={cn('h-1.5 w-1.5 rounded-full', signal.dot)} />
            {signal.label}
          </Badge>
          {item.focus && (
            <span className='text-xs text-muted-foreground'>
              on <span className='text-foreground/80'>{item.focus}</span>
            </span>
          )}
          <span className='text-xs text-muted-foreground'>
            · {confidence}% confidence
          </span>
          <SourceCheckBadges check={check} />
        </div>

        <p className='mt-2.5 text-[15px] leading-relaxed font-medium'>
          {finding}
        </p>

        {item.citationContext && (
          <blockquote className='mt-3 border-l-2 border-border pl-3 text-sm text-foreground/80 italic'>
            “{item.citationContext.replace(/\*\*|__/g, '')}”
            {check?.quoteFound && (
              <span className='ml-1.5 text-xs text-muted-foreground not-italic'>
                — found on the page
              </span>
            )}
          </blockquote>
        )}

        <div className='mt-3 flex items-start gap-2 text-xs text-muted-foreground'>
          <div className='min-w-0 flex-1'>
            {item.url ? (
              <a
                href={item.url}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-1 font-medium text-foreground hover:underline'
              >
                {item.title}
                <ExternalLink className='h-3 w-3 shrink-0' />
              </a>
            ) : (
              <span className='font-medium text-foreground'>{item.title}</span>
            )}
            <span>
              {' · '}
              {[item.provenance?.kind, item.authors, item.venue, item.year]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className='inline-flex shrink-0 items-center gap-1 hover:text-foreground'
            aria-expanded={open}
          >
            Details
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className='mx-5 mt-3 space-y-3 border-t border-border pt-3 text-sm'>
          {why && <Field label='Why it matters'>{why}</Field>}
          {showTask && item.task && (
            <Field label='The Scout was asked'>{item.task}</Field>
          )}
          <ConfidenceBar value={confidence} />
          <p className='text-xs text-muted-foreground'>
            {signal.label}: {signal.hint.toLowerCase()}. Found via{' '}
            {toolLabel(item.provenance?.tool ?? '')}
            {item.provenance?.retrievedAt &&
              ` · ${formatRelativeDate(item.provenance.retrievedAt)}`}
            {item.provenance?.soulFileVersion != null &&
              ` · standards v${item.provenance.soulFileVersion}`}
            {item.doi && ` · DOI ${item.doi}`}
          </p>
        </div>
      )}

      {verdict && (
        <div className='mx-5 mt-3 rounded-lg border border-border bg-muted/40 p-3'>
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

      {(review.note || !!review.tags?.length) && (
        <p className='mx-5 mt-3 text-xs text-muted-foreground'>
          Your note: {review.tags?.map(tagLabel).join(', ')}
          {review.tags?.length && review.note ? ' · ' : ''}
          {review.note && (
            <span className='text-foreground'>“{review.note}”</span>
          )}
        </p>
      )}

      <div className='px-5 pt-3 pb-4'>{footer}</div>
    </div>
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
    <p className='mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
      {label}
    </p>
    <p className='leading-relaxed text-foreground/90'>{children}</p>
  </div>
)

export default EvidenceCard
