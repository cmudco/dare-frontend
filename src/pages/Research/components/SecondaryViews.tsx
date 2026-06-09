import { useState } from 'react'
import {
  Code2,
  FileText,
  LayoutGrid,
  Rows3,
  Shapes,
  Workflow,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/utils/dateUtils'
import { ArtifactRenderer } from '@/components/Artifacts/ArtifactRenderer'
import type { Artifact, ArtifactType } from '@/redux/types/artifact'
import type { ResearchArtifact, ResearchSource } from '../types'

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

// Map a research artifact onto DARE's Artifact shape for the shared renderer.
const toArtifact = (a: ResearchArtifact): Artifact => ({
  id: a.id,
  title: a.title,
  content: a.content,
  artifactType: a.artifactType as ArtifactType,
  status: 'completed',
  filename: '',
  contentType: '',
})

const typeIcon = (type: string) => {
  if (type === 'diagram' || type === 'svg' || type === 'excalidraw')
    return Workflow
  if (type === 'html') return FileText
  return Code2
}

const ArtifactModal = ({
  artifact,
  onClose,
}: {
  artifact: ResearchArtifact
  onClose: () => void
}) => (
  <div
    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6'
    onClick={onClose}
  >
    <div
      className='flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='flex items-center justify-between border-b border-border px-5 py-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>
            {artifact.title || artifact.artifactType}
          </p>
          <p className='text-xs text-muted-foreground'>
            {artifact.artifactType} · {artifact.source} ·{' '}
            {formatRelativeDate(artifact.createdAt)}
          </p>
        </div>
        <button
          onClick={onClose}
          className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
      <div className='min-h-0 flex-1 overflow-auto p-2'>
        <div className='h-[70vh]'>
          <ArtifactRenderer artifact={toArtifact(artifact)} />
        </div>
      </div>
    </div>
  </div>
)

export const ArtifactsView = ({
  artifacts,
}: {
  artifacts: ResearchArtifact[]
}) => {
  const [mode, setMode] = useState<'grid' | 'list'>('grid')
  const [open, setOpen] = useState<ResearchArtifact | null>(null)

  return (
    <div className='space-y-6'>
      <header className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>Artifacts</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Diagrams, figures and pages the agent produced — ask for one in Chat
            (e.g. "draw a Mermaid diagram of …") and it lands here.
          </p>
        </div>
        {artifacts.length > 0 && (
          <div className='flex shrink-0 items-center gap-0.5 rounded-lg border border-border p-0.5'>
            {(['grid', 'list'] as const).map((m) => {
              const Icon = m === 'grid' ? LayoutGrid : Rows3
              return (
                <button
                  key={m}
                  type='button'
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    mode === m
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className='h-4 w-4' />
                </button>
              )
            })}
          </div>
        )}
      </header>

      {artifacts.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <Shapes className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>No artifacts yet</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            In Chat, ask the agent for a diagram, an SVG figure, or an HTML
            summary — it'll render here.
          </p>
        </div>
      ) : mode === 'grid' ? (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {artifacts.map((a) => {
            const Icon = typeIcon(a.artifactType)
            return (
              <button
                key={a.id}
                type='button'
                onClick={() => setOpen(a)}
                className='group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30'
              >
                <div className='mb-3 flex items-center justify-between'>
                  <div className='rounded-lg bg-muted p-2'>
                    <Icon className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <Badge variant='gray'>{a.artifactType}</Badge>
                </div>
                <p className='truncate text-sm font-medium'>
                  {a.title || a.artifactType}
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {a.source} · {formatRelativeDate(a.createdAt)}
                </p>
                <p className='mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100'>
                  Open ↗
                </p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className='space-y-6'>
          {artifacts.map((a) => (
            <div
              key={a.id}
              className='overflow-hidden rounded-xl border border-border bg-card'
            >
              <div className='flex items-center justify-between border-b border-border px-4 py-2.5'>
                <p className='truncate text-sm font-medium'>
                  {a.title || a.artifactType}
                </p>
                <span className='shrink-0 text-xs text-muted-foreground'>
                  {a.artifactType} · {a.source} ·{' '}
                  {formatRelativeDate(a.createdAt)}
                </span>
              </div>
              <div className='h-[440px]'>
                <ArtifactRenderer artifact={toArtifact(a)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <ArtifactModal artifact={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
