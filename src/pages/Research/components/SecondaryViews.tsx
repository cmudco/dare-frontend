import { FileText, Shapes } from 'lucide-react'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { ResearchSource } from '../types'

// Deliberately sparse views — present, but not competing for attention.

const sourceMeta = (source: ResearchSource): string => {
  const size =
    source.sizeLabel || (source.pageCount ? `${source.pageCount} pages` : '')
  return [source.kind, size, `Added ${formatRelativeDate(source.createdAt)}`]
    .filter(Boolean)
    .join(' · ')
}

export const SourcesView = ({ sources }: { sources: ResearchSource[] }) => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Sources</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Files you have brought into the project. Scout can read across these.
      </p>
    </header>
    {sources.length === 0 ? (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
        <div className='mb-4 rounded-full bg-muted p-3'>
          <FileText className='h-6 w-6 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>No sources yet</p>
        <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
          Add sources when creating the project, or bring them in here later.
        </p>
      </div>
    ) : (
      <div className='space-y-2'>
        {sources.map((source) => (
          <div
            key={source.id}
            className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3'
          >
            <div className='rounded-md bg-muted p-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{source.name}</p>
              <p className='text-xs text-muted-foreground'>
                {sourceMeta(source)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

export const ArtifactsView = () => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Artifacts</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Figures, tables and slides built from approved knowledge — drafted by
        the Presentation Assistant, finished by you.
      </p>
    </header>
    <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
      <div className='mb-4 rounded-full bg-muted p-3'>
        <Shapes className='h-6 w-6 text-muted-foreground' />
      </div>
      <p className='text-sm font-medium'>No artifacts yet</p>
      <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
        Once you have approved enough sources, ask the Presentation Assistant to
        draft a figure or slide here.
      </p>
    </div>
  </div>
)
