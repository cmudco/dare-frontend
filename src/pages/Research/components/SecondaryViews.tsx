import { useState } from 'react'
import {
  Code2,
  FileText,
  LayoutGrid,
  Loader2,
  Rows3,
  Shapes,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAppDispatch } from '@/redux/hooks'
import { getResearchProject } from '@/redux/asyncThunks/research'
import { generateArtifactAPI } from '@/api/research'
import { formatRelativeDate } from '@/utils/dateUtils'
import { ArtifactRenderer } from '@/components/Artifacts/ArtifactRenderer'
import type { Artifact, ArtifactType } from '@/redux/types/artifact'
import { AgentRunRole, isRunInFlight } from '@/utils/constants/research'
import type { AgentRun, ResearchArtifact, ResearchSource } from '../types'

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
  artifact: ResearchArtifact | null
  onClose: () => void
}) => (
  <Dialog open={!!artifact} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className='flex h-[92vh] max-w-[94vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[94vw]'>
      {artifact && (
        <>
          <DialogHeader className='shrink-0 space-y-0.5 border-b border-border px-5 py-3 pr-12 text-left'>
            <DialogTitle className='truncate text-sm'>
              {artifact.title || artifact.artifactType}
            </DialogTitle>
            <p className='text-xs text-muted-foreground'>
              {artifact.artifactType} · {artifact.source} ·{' '}
              {formatRelativeDate(artifact.createdAt)}
            </p>
          </DialogHeader>
          <div className='min-h-0 flex-1 overflow-auto'>
            <ArtifactRenderer artifact={toArtifact(artifact)} />
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
)

const ARTIFACT_TYPES = [
  { key: '', label: 'Auto' },
  { key: 'diagram', label: 'Diagram' },
  { key: 'svg', label: 'SVG' },
  { key: 'html', label: 'HTML' },
  { key: 'excalidraw', label: 'Excalidraw' },
  { key: 'document', label: 'Document' },
  { key: 'docx', label: 'Word' },
  { key: 'pptx', label: 'Slides' },
]

// Fire-and-queue: each Generate enqueues a run on the backend and refreshes so
// it shows up as a generating row. The composer stays open, so several artifacts
// can run at once — their progress is tracked from server state, not here.
const GenerateBar = ({ projectId }: { projectId?: number }) => {
  const dispatch = useAppDispatch()
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const generate = async () => {
    if (!projectId || !prompt.trim() || submitting) return
    setSubmitting(true)
    try {
      await generateArtifactAPI(projectId, prompt.trim(), type)
      setPrompt('')
      dispatch(getResearchProject(projectId)) // surface the new run immediately
    } catch {
      // stays ready to retry
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-3 rounded-2xl border border-border bg-card p-4'>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='Describe an artifact to generate — e.g. "a Mermaid diagram of the causal mechanisms" or "an HTML one-pager of the working thesis"'
        rows={2}
      />
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        <div className='flex flex-wrap items-center gap-1.5'>
          {ARTIFACT_TYPES.map((t) => (
            <button
              key={t.key}
              type='button'
              onClick={() => setType(t.key)}
              aria-pressed={type === t.key}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                type === t.key
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button
          onClick={generate}
          disabled={!prompt.trim() || submitting}
          className='ml-auto shrink-0'
        >
          {submitting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' /> Queuing…
            </>
          ) : (
            <>
              <Sparkles className='h-4 w-4' /> Generate
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export const ArtifactsView = ({
  projectId,
  artifacts,
  runs = [],
}: {
  projectId?: number
  artifacts: ResearchArtifact[]
  runs?: AgentRun[]
}) => {
  const [mode, setMode] = useState<'grid' | 'list'>('grid')
  const [open, setOpen] = useState<ResearchArtifact | null>(null)

  // In-flight artifact runs come from server state, so their rows survive tab
  // switches and several can generate at once.
  const pendingRuns = runs.filter(
    (r) => r.role === AgentRunRole.PRESENTER && isRunInFlight(r.status)
  )

  return (
    <div className='space-y-6'>
      <header className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>Artifacts</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Diagrams, figures and pages — describe one below to generate it, or
            ask in Chat. Each lands here, rendered.
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

      <GenerateBar projectId={projectId} />

      {pendingRuns.length > 0 && (
        <div className='space-y-2'>
          {pendingRuns.map((r) => (
            <div
              key={r.id}
              className='flex items-center gap-3 rounded-xl border border-border bg-card p-4'
            >
              <div className='rounded-lg bg-muted p-2'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>
                  {r.task || 'Generating artifact…'}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  {r.statusDetail || 'Generating…'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {artifacts.length === 0 && pendingRuns.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <Shapes className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>No artifacts yet</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Describe one above (or ask in Chat) — a diagram, SVG figure, or HTML
            summary — and it'll render here.
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

      <ArtifactModal artifact={open} onClose={() => setOpen(null)} />
    </div>
  )
}
