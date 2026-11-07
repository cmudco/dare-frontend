import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { RelationLabel } from '@/redux/types/knowledgeGraph'
import { cn } from '@/lib/utils'

import { relationText } from './entityKinds'

const plural = (count: number, word: string) =>
  `${count.toLocaleString()} ${word}${count === 1 ? '' : 's'}`

const statusOf = (label: RelationLabel) =>
  !label.read
    ? 'Not read yet'
    : label.source === 'user'
      ? 'Added by you'
      : 'Suggested'

const RelationLabelRow = ({
  label,
  onDelete,
}: {
  label: RelationLabel
  onDelete: () => void
}) => {
  const [open, setOpen] = useState(false)
  const canOpen = label.examples.length > 0

  return (
    <div className='border-b border-border last:border-0'>
      <div className='flex items-center gap-3 py-2'>
        <button
          type='button'
          className='flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default'
          aria-expanded={open}
          disabled={!canOpen}
          onClick={() => setOpen(!open)}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-90',
              !canOpen && 'invisible'
            )}
          />
          <span className='min-w-0'>
            <span className='block truncate text-sm font-medium'>
              {relationText(label.name)}
              {label.twoWay && (
                <span className='ml-2 text-xs font-normal text-muted-foreground'>
                  both ways
                </span>
              )}
            </span>
            {label.description && (
              <span className='block truncate text-xs text-muted-foreground'>
                {label.description}
              </span>
            )}
          </span>
        </button>
        <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
          {plural(label.pairCount, 'pair')}
        </span>
        <span className='shrink-0 text-xs text-muted-foreground'>
          {statusOf(label)}
        </span>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 shrink-0'
          aria-label={`Remove ${label.name}`}
          onClick={onDelete}
        >
          <X className='h-3.5 w-3.5' />
        </Button>
      </div>
      {open && (
        <ul className='mb-3 ml-5.5 space-y-2'>
          {label.examples.map((example) => (
            <li
              key={`${example.subject}-${example.object}`}
              className='rounded-md bg-muted/50 px-3 py-2'
            >
              <p className='text-sm'>
                <span className='font-medium'>{example.subject}</span>{' '}
                <span className='text-muted-foreground italic'>
                  {relationText(label.name)}
                </span>{' '}
                <span className='font-medium'>{example.object}</span>
              </p>
              <p className='mt-0.5 line-clamp-3 text-xs text-muted-foreground'>
                “{example.evidence}”
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {example.fileName}
                {example.page != null && `, page ${example.page}`}
                {example.sources > 1 &&
                  ` · stated in ${plural(example.sources, 'chunk')}`}
              </p>
            </li>
          ))}
          {label.pairCount > label.examples.length && (
            <li className='text-xs text-muted-foreground'>
              The strongest {label.examples.length} of{' '}
              {plural(label.pairCount, 'pair')}. Select a name on the graph to
              see the rest.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default RelationLabelRow
