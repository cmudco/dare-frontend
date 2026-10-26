import { ArrowRight } from 'lucide-react'
import { AssistantMarkdown } from '@/components/Assistant/AssistantMarkdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RELEASE_NOTE_KIND_LABEL } from '@/constants/releaseNotes'
import type { ReleaseNote } from '@/redux/types/releaseNotes'
import { formatShortDate } from '@/utils/dateUtils'

interface ReleaseNoteEntryProps {
  note: ReleaseNote
  onTryIt: (path: string) => void
}

/** A release: its first item is the headline, the rest a compact list. */
export function ReleaseNoteEntry({ note, onTryIt }: ReleaseNoteEntryProps) {
  const [featured, ...rest] = note.items

  return (
    <article className='space-y-4'>
      <header className='space-y-1'>
        <p className='text-xs text-muted-foreground'>
          {formatShortDate(note.publishedAt)}
        </p>
        <h3 className='text-lg leading-snug font-semibold text-foreground'>
          {note.title}
        </h3>
        {note.summary && (
          <p className='text-sm text-muted-foreground'>{note.summary}</p>
        )}
      </header>

      {featured && (
        <section className='space-y-2 rounded-[0.75rem] border border-border bg-card p-4'>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>
              {RELEASE_NOTE_KIND_LABEL[featured.kind]}
            </Badge>
            <h4 className='text-sm font-medium text-foreground'>
              {featured.title}
            </h4>
          </div>
          {featured.body && <AssistantMarkdown content={featured.body} />}
          {featured.linkPath && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onTryIt(featured.linkPath)}
            >
              Try it
              <ArrowRight className='ml-1 h-3.5 w-3.5' />
            </Button>
          )}
        </section>
      )}

      {rest.length > 0 && (
        <section className='space-y-2'>
          <h4 className='text-xs text-muted-foreground'>
            Also in this release
          </h4>
          <ul className='divide-y divide-border'>
            {rest.map((item) => (
              <li key={item.id} className='flex gap-3 py-2.5'>
                <span className='w-16 shrink-0 pt-0.5 text-xs text-muted-foreground'>
                  {RELEASE_NOTE_KIND_LABEL[item.kind]}
                </span>
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <p className='text-sm font-medium text-foreground'>
                    {item.title}
                  </p>
                  {item.body && (
                    <div className='text-muted-foreground'>
                      <AssistantMarkdown content={item.body} />
                    </div>
                  )}
                </div>
                {item.linkPath && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 shrink-0'
                    aria-label={`Try ${item.title}`}
                    onClick={() => onTryIt(item.linkPath)}
                  >
                    <ArrowRight className='h-3.5 w-3.5' />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
