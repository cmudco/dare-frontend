import { useState } from 'react'
import { Download, Folder, Share2 } from 'lucide-react'
import { useAppDispatch } from '@/redux/hooks'
import { downloadOkfBundle } from '@/redux/asyncThunks/research'
import { cn } from '@/lib/utils'
import GraphView from './GraphView'
import KnowledgeBundleView from './KnowledgeBundleView'

type View = 'evidence' | 'bundle'

/**
 * The Maps tab — a container for the project's visualizations. Switches between
 * the live evidence graph (staging-derived provenance) and the durable OKF
 * knowledge bundle (scholar-promoted theses + sources), and offers the bundle as
 * a downloadable zip.
 */
const VisualizationView = ({ projectId }: { projectId?: number }) => {
  const dispatch = useAppDispatch()
  const [view, setView] = useState<View>('evidence')
  const [downloading, setDownloading] = useState(false)
  const [evidenceCount, setEvidenceCount] = useState<number | null>(null)
  const [bundleCount, setBundleCount] = useState<number | null>(null)

  const download = async () => {
    if (!projectId) return
    setDownloading(true)
    try {
      await dispatch(downloadOkfBundle(projectId))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
        <div className='inline-flex gap-0.5 rounded-lg bg-muted/60 p-0.5'>
          <Segment
            active={view === 'evidence'}
            onClick={() => setView('evidence')}
            icon={Share2}
            label='Evidence graph'
            count={evidenceCount}
          />
          <Segment
            active={view === 'bundle'}
            onClick={() => setView('bundle')}
            icon={Folder}
            label='Knowledge bundle'
            count={bundleCount}
          />
        </div>
        <button
          onClick={download}
          disabled={!projectId || downloading}
          className='inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50'
        >
          <Download className='h-3.5 w-3.5' />
          {downloading ? 'Preparing…' : 'Download .zip'}
        </button>
      </div>

      <p className='mb-3 text-xs text-muted-foreground'>
        {view === 'evidence'
          ? 'Every candidate in review — staged + approved (rejected excluded). The working layer; faded nodes are still in review.'
          : 'Promoted knowledge only — what the scholar committed to the durable record. The exportable layer.'}
      </p>

      {view === 'evidence' ? (
        <GraphView projectId={projectId} onCount={setEvidenceCount} />
      ) : (
        <KnowledgeBundleView projectId={projectId} onCount={setBundleCount} />
      )}
    </div>
  )
}

const Segment = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  count?: number | null
}) => (
  <button
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
      active
        ? 'bg-background font-medium text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    )}
  >
    <Icon className='h-3.5 w-3.5' />
    {label}
    {typeof count === 'number' && (
      <span className='ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums'>
        {count}
      </span>
    )}
  </button>
)

export default VisualizationView
