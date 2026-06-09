import { BookMarked, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { KnowledgeItem } from '../types'
import { evidenceMeta, toolLabel } from './signals'

const ProjectKnowledge = ({ items }: { items: KnowledgeItem[] }) => {
  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>
          Project Knowledge
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Sources you have approved. Their rationale, confidence and provenance
          travel with them.
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
                <h3 className='text-[15px] font-semibold leading-snug tracking-tight'>
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
    </div>
  )
}

export default ProjectKnowledge
