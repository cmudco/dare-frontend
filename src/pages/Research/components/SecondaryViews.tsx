import { Brain, FileText, PlusCircle, Shapes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResearchSource } from '@/redux/types/research'

// Deliberately sparse views — present, but not competing for attention.

const sourceDetail = (source: ResearchSource): string => {
  const details: string[] = [source.kind]
  if (source.year) details.push(String(source.year))
  if (source.doi) details.push(source.doi)
  if (source.url) details.push(source.url)
  return details.join(' · ')
}

interface SourcesViewProps {
  sources: ResearchSource[]
  stagedSourceIds: Set<number>
  isReviewing: boolean
  onStageSource?: (source: ResearchSource) => void
}

export const SourcesView = ({
  sources,
  stagedSourceIds,
  isReviewing,
  onStageSource,
}: SourcesViewProps) => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Sources</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Source records you have brought into the project.
      </p>
    </header>
    {sources.length === 0 ? (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
        <div className='mb-4 rounded-full bg-muted p-3'>
          <FileText className='h-6 w-6 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>No sources attached yet</p>
        <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
          Add source records while creating or editing the project.
        </p>
      </div>
    ) : (
      <div className='space-y-2'>
        {sources.map((source) => (
          <SourceRow
            key={source.id}
            source={source}
            isStaged={stagedSourceIds.has(source.id)}
            isReviewing={isReviewing}
            onStageSource={onStageSource}
          />
        ))}
      </div>
    )}
  </div>
)

const SourceRow = ({
  source,
  isStaged,
  isReviewing,
  onStageSource,
}: {
  source: ResearchSource
  isStaged: boolean
  isReviewing: boolean
  onStageSource?: (source: ResearchSource) => void
}) => (
  <div className='flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center'>
    <div className='flex min-w-0 flex-1 items-start gap-3'>
      <div className='rounded-md bg-muted p-2'>
        <FileText className='h-4 w-4 text-muted-foreground' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{source.title}</p>
        <p className='truncate text-xs text-muted-foreground'>
          {sourceDetail(source)}
        </p>
        {source.notes && (
          <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
            {source.notes}
          </p>
        )}
      </div>
    </div>
    {onStageSource && (
      <Button
        size='sm'
        variant={isStaged ? 'outline' : 'secondary'}
        disabled={isStaged || isReviewing}
        onClick={() => onStageSource(source)}
        className='shrink-0'
      >
        {isStaged ? (
          'Staged'
        ) : (
          <>
            <PlusCircle className='h-4 w-4' /> Stage for review
          </>
        )}
      </Button>
    )}
  </div>
)

export const MemoryView = () => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Memory / Context</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        What the workspace remembers about this project between sessions.
      </p>
    </header>
    <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
      <div className='mb-4 rounded-full bg-muted p-3'>
        <Brain className='h-6 w-6 text-muted-foreground' />
      </div>
      <p className='text-sm font-medium'>Project memory is planned</p>
      <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
        Phase 3 and later phases add soul files, memory proposals, and explicit
        project-memory selection.
      </p>
    </div>
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
        Artifact provenance and Presentation Assistant drafts arrive after
        approved knowledge and Hermes runs are connected.
      </p>
    </div>
  </div>
)
