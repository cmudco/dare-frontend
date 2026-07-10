import { useState } from 'react'
import { ArrowUpRight, Workflow } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ArtifactRenderer from '@/components/Artifacts/ArtifactRenderer'
import type { Artifact, ArtifactType } from '@/redux/types/artifact'

const LABELS: Record<string, string> = {
  svg: 'SVG figure',
  html: 'HTML page',
  excalidraw: 'Excalidraw scene',
  diagram: 'Diagram',
}

// A renderable payload the agent emitted in chat (raw SVG/HTML/Excalidraw)
// shows as a compact card instead of a wall of markup; click renders it.
const ChatArtifactCard = ({
  type,
  content,
}: {
  type: string
  content: string
}) => {
  const [open, setOpen] = useState(false)
  const label = LABELS[type] ?? 'Artifact'
  const artifact: Artifact = {
    id: 0,
    title: label,
    content,
    artifactType: type as ArtifactType,
    status: 'completed',
    filename: '',
    contentType: '',
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='not-prose my-2 flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted'
      >
        <Workflow className='h-4 w-4 shrink-0 text-muted-foreground' />
        <span className='min-w-0 flex-1'>
          <span className='block text-sm font-medium'>{label}</span>
          <span className='block text-xs text-muted-foreground'>
            Click to view
          </span>
        </span>
        <ArrowUpRight className='h-4 w-4 shrink-0 text-muted-foreground' />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='flex h-[92vh] max-w-[94vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[94vw]'>
          <DialogHeader className='shrink-0 border-b border-border px-5 py-3 pr-12 text-left'>
            <DialogTitle className='truncate text-sm'>{label}</DialogTitle>
          </DialogHeader>
          <div className='min-h-0 flex-1 overflow-auto'>
            <ArtifactRenderer artifact={artifact} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChatArtifactCard
