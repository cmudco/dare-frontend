import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronDown, Clock, ExternalLink, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ResearchStagingItem } from '@/redux/types/research'
import ConfidenceBar from './ConfidenceBar'
import { getSignalMeta, getToolLabel } from './signals'

interface Props {
  item: ResearchStagingItem
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onLater: (id: number) => void
}

const displayYear = (year: number | null): string => {
  return year ? String(year) : 'Year unknown'
}

const ReviewItemCard = ({ item, onApprove, onReject, onLater }: Props) => {
  const [expanded, setExpanded] = useState(false)
  const signal = getSignalMeta(item.evidenceLabel)
  const toolLabel = getToolLabel(item.provenance.tool)
  const summary = item.content || item.rationale || 'No summary provided yet.'

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
        onClick={() => setExpanded((value) => !value)}
        className='flex w-full items-start gap-3 px-5 pt-5 text-left'
      >
        <div className='min-w-0 flex-1'>
          <div className='mb-1.5 flex flex-wrap items-center gap-2'>
            <Badge variant={signal.badge} className='gap-1.5'>
              <span className={cn('h-1.5 w-1.5 rounded-full', signal.dot)} />
              {signal.label}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              via {toolLabel}
            </span>
          </div>
          <h3 className='truncate text-[15px] font-semibold leading-snug tracking-tight'>
            {item.title}
          </h3>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {item.authors || 'Unknown author'} · {item.venue || 'Unknown venue'}{' '}
            · {displayYear(item.year)}
          </p>
          <p className='mt-2 line-clamp-1 text-sm text-foreground/80'>
            {summary}
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
        <ConfidenceBar value={item.confidence} />
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='overflow-hidden px-5'
        >
          <div className='mt-4 space-y-4 border-t border-border pt-4 text-sm'>
            <Field label='Rationale'>
              {item.rationale || 'No rationale yet.'}
            </Field>
            <Field label='Confidence rationale'>
              {item.confidenceRationale || 'No confidence rationale yet.'}
            </Field>
            {item.citationContext && (
              <Field label='Citation context'>
                <span className='italic text-foreground/80'>
                  {item.citationContext}
                </span>
              </Field>
            )}
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
              <span>Source: {toolLabel}</span>
              {item.provenance.retrievalDepth && (
                <>
                  <span>·</span>
                  <span>{item.provenance.retrievalDepth}</span>
                </>
              )}
              {item.provenance.retrievedAt && (
                <>
                  <span>·</span>
                  <span>{item.provenance.retrievedAt}</span>
                </>
              )}
              {item.soulFileTitle && (
                <>
                  <span>·</span>
                  <span>
                    Standards: {item.soulFileTitle} v
                    {item.soulFileVersionNumber ?? 1}
                  </span>
                </>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target='_blank'
                  rel='noreferrer'
                  onClick={(event) => event.stopPropagation()}
                  className='inline-flex items-center gap-1 text-primary hover:underline'
                >
                  Open <ExternalLink className='h-3 w-3' />
                </a>
              )}
            </div>
          </div>
        </motion.div>
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
        <span className='ml-auto text-xs text-muted-foreground'>
          Critic arrives in Phase 6
        </span>
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
