import { BookMarked, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ResearchKnowledgeItem } from '@/redux/types/research'
import { getSignalMeta, getToolLabel } from './signals'

const displayYear = (year: number | null): string => {
  return year ? String(year) : 'Year unknown'
}

const ProjectKnowledge = ({ items }: { items: ResearchKnowledgeItem[] }) => {
  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>
          Project Knowledge
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Sources and claims you have approved. Their rationale, confidence and
          provenance travel with them.
        </p>
      </header>

      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <BookMarked className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>Nothing approved yet</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Approve a staged item in the Review Inbox and it will become durable
            project knowledge here.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {items.map((item) => {
            const signal = getSignalMeta(item.evidenceLabel)
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
                    {item.confidence}% confidence · via{' '}
                    {getToolLabel(item.provenance.tool)}
                  </span>
                </div>
                <h3 className='text-[15px] font-semibold leading-snug tracking-tight'>
                  {item.title}
                </h3>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {item.authors || 'Unknown author'} ·{' '}
                  {item.venue || 'Unknown venue'} · {displayYear(item.year)}
                </p>
                <p className='mt-2 text-sm text-foreground/80'>
                  {item.rationale || item.content || 'No rationale recorded.'}
                </p>
                <div className='mt-3 flex flex-wrap items-center gap-2'>
                  <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                    Approved {new Date(item.approvedAt).toLocaleDateString()}
                  </span>
                  {item.soulFileTitle && (
                    <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                      {item.soulFileTitle} v{item.soulFileVersionNumber ?? 1}
                    </span>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target='_blank'
                      rel='noreferrer'
                      className='ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline'
                    >
                      Open <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProjectKnowledge
