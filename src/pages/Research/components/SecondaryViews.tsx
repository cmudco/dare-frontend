import { Brain, FileText, Shapes } from 'lucide-react'
import { MEMORY, SOURCE_FILES } from '../mockData'

// Deliberately sparse views — present, but not competing for attention.

export const SourcesView = () => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Sources</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Files you have brought into the project. Scout can read across these.
      </p>
    </header>
    <div className='space-y-2'>
      {SOURCE_FILES.map((f) => (
        <div
          key={f.id}
          className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3'
        >
          <div className='rounded-md bg-muted p-2'>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{f.name}</p>
            <p className='text-xs text-muted-foreground'>
              {f.kind} · {f.pages} pages · {f.addedAt}
            </p>
          </div>
        </div>
      ))}
    </div>
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
    <div className='space-y-3'>
      {MEMORY.map((m) => (
        <div key={m.id} className='rounded-xl border border-border bg-card p-5'>
          <div className='flex items-center gap-2'>
            <Brain className='h-4 w-4 text-muted-foreground' />
            <p className='text-sm font-medium'>{m.label}</p>
          </div>
          <p className='mt-2 text-sm text-foreground/80'>{m.detail}</p>
          <p className='mt-2 text-xs text-muted-foreground'>{m.capturedAt}</p>
        </div>
      ))}
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
        Once you have approved enough sources, ask the Presentation Assistant to
        draft a figure or slide here.
      </p>
    </div>
  </div>
)
