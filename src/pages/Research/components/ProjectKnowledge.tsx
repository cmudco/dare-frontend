import { BookMarked, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { REVIEW_REASON_TAGS } from '@/utils/constants/research'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { KnowledgeItem, ReviewItem } from '../types'
import { evidenceMeta, toolLabel } from './signals'

const tagLabel = (value: string) =>
  REVIEW_REASON_TAGS.find((tag) => tag.value === value)?.label ?? value

/** What was turned down and why — so a rejection is a record, not a gap. */
const RejectedSources = ({ items }: { items: ReviewItem[] }) => (
  <section className='space-y-3 pt-2'>
    <header>
      <h3 className='text-sm font-semibold'>Rejected · {items.length}</h3>
      <p className='mt-0.5 text-xs text-muted-foreground'>
        Sources you turned down, with your reason. They never become knowledge,
        but the agent learns from why.
      </p>
    </header>
    {items.map((item) => {
      const meta = item.reviewMetadata
      const reason = meta.note || item.rejectionReason
      const tags = meta.tags ?? []
      return (
        <div
          key={item.id}
          className='rounded-xl border border-dashed border-border px-5 py-3'
        >
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <h4 className='text-sm font-medium'>{item.title}</h4>
            <span className='text-xs text-muted-foreground'>
              {[item.authors, item.venue, item.year]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            {tags.map(tagLabel).join(', ')}
            {tags.length > 0 && reason ? ' · ' : ''}
            {reason ? (
              <span className='text-foreground'>“{reason}”</span>
            ) : (
              tags.length === 0 && 'No reason given'
            )}
            {meta.decidedAt && ` · ${formatRelativeDate(meta.decidedAt)}`}
          </p>
        </div>
      )
    })}
  </section>
)

const ProjectKnowledge = ({
  items,
  rejected,
}: {
  items: KnowledgeItem[]
  rejected: ReviewItem[]
}) => {
  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>
          Project Knowledge
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Sources you have approved — their rationale, confidence and provenance
          travel with them — and, below, what you rejected and why.
        </p>
      </header>

      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <BookMarked className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>Nothing approved yet</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Approve a finding in the Review Inbox and it will become durable
            knowledge here.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {items.map((item) => {
            const signal = evidenceMeta(item.evidenceLabel)
            const confidence = Math.round((item.confidence ?? 0) * 100)
            return (
              <div
                key={item.id}
                className='rounded-xl border border-border bg-card p-5'
              >
                <div className='mb-1.5 flex flex-wrap items-center gap-2'>
                  <Badge variant={signal.badge} className='gap-1.5'>
                    <span
                      className={cn('h-1.5 w-1.5 rounded-full', signal.dot)}
                    />
                    {signal.label}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>
                    {confidence}% confidence · via{' '}
                    {toolLabel(item.provenance?.tool ?? '')}
                  </span>
                </div>
                <h3 className='text-[15px] leading-snug font-semibold tracking-tight'>
                  {item.title}
                </h3>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {[item.authors, item.venue, item.year]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className='mt-2 text-sm text-foreground/80'>
                  {item.rationale}
                </p>
                <div className='mt-3 flex flex-wrap items-center gap-2'>
                  {item.usedIn?.map((section) => (
                    <span
                      key={section}
                      className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                    >
                      {section}
                    </span>
                  ))}
                  <a
                    href={item.url}
                    target='_blank'
                    rel='noreferrer'
                    className='ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline'
                  >
                    Open <ExternalLink className='h-3 w-3' />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {rejected.length > 0 && <RejectedSources items={rejected} />}
    </div>
  )
}

export default ProjectKnowledge
