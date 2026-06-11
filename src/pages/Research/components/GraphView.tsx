import { useEffect, useRef, useState } from 'react'
import ForceGraph from 'force-graph'
import { ExternalLink, X } from 'lucide-react'
import { getResearchGraphAPI } from '@/api/research'
import type { EvidenceGraph, EvidenceGraphNode } from '@/redux/types/research'

// The evidence palette — readable on light and dark surfaces.
const LABEL_COLORS: Record<string, string> = {
  supporting: '#22c55e',
  disputing: '#ef4444',
  partial: '#f59e0b',
  tangential: '#94a3b8',
  unverifiable: '#64748b',
}
const QUESTION_COLOR = '#3b82f6'
const REQUEST_COLOR = '#94a3b8'
const MENTION_COLOR = '#8b5cf6'

const toolName = (tool?: string) => {
  const t = (tool || '').toLowerCase()
  if (t.includes('scite')) return 'Scite'
  if (t.includes('consensus')) return 'Consensus'
  return 'Web search'
}

type RenderNode = EvidenceGraphNode & { x?: number; y?: number; val?: number }

const nodeRadius = (n: RenderNode) => Math.sqrt(n.val || 4) * 2.2

const nodeColor = (n: RenderNode) =>
  n.kind === 'question'
    ? QUESTION_COLOR
    : LABEL_COLORS[n.evidenceLabel || ''] || REQUEST_COLOR

/**
 * Obsidian-style force-directed view of the project's evidence graph: the
 * research question at the center, sources colored by their reviewed evidence
 * label and sized by confidence, clustered around the scout request that
 * surfaced them. Every node and edge is traceable to stored, reviewed data.
 */
const GraphView = ({ projectId }: { projectId?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [graph, setGraph] = useState<EvidenceGraph | null>(null)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<EvidenceGraphNode | null>(null)

  useEffect(() => {
    if (!projectId) return
    getResearchGraphAPI(projectId)
      .then(setGraph)
      .catch(() => setError(true))
  }, [projectId])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !graph) return

    const labelColor = getComputedStyle(el).color
    const nodes: RenderNode[] = graph.nodes.map((n) => ({
      ...n,
      val:
        n.kind === 'question'
          ? 24
          : n.kind === 'request'
            ? 6
            : 4 + (n.confidence || 0.5) * 10,
    }))
    const links = graph.edges.map((e) => ({ ...e }))

    const fg = ForceGraph()(el)
      .graphData({ nodes, links })
      .backgroundColor('rgba(0,0,0,0)')
      .nodeVal((n) => (n as RenderNode).val || 4)
      .nodeLabel(() => '')
      .linkColor((l) => {
        const kind = (l as { kind?: string; label?: string }).kind
        if (kind === 'evidence') {
          const label = (l as { label?: string }).label || ''
          return (LABEL_COLORS[label] || REQUEST_COLOR) + '73'
        }
        if (kind === 'mention') return MENTION_COLOR + 'aa'
        return REQUEST_COLOR + '40'
      })
      .linkWidth((l) => {
        const kind = (l as { kind?: string }).kind
        return kind === 'evidence' ? 1.6 : kind === 'mention' ? 2 : 0.7
      })
      .linkLineDash((l) =>
        (l as { kind?: string }).kind === 'mention' ? [3, 2] : null
      )
      .nodeCanvasObject((node, ctx) => {
        const n = node as RenderNode
        if (n.x === undefined || n.y === undefined) return
        const r = nodeRadius(n)
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, 2 * Math.PI)
        if (n.kind === 'request') {
          ctx.fillStyle = 'rgba(148,163,184,0.15)'
          ctx.strokeStyle = REQUEST_COLOR
          ctx.lineWidth = 0.8
          ctx.fill()
          ctx.stroke()
        } else {
          ctx.fillStyle = nodeColor(n)
          ctx.shadowColor = ctx.fillStyle
          ctx.shadowBlur = n.kind === 'question' ? 20 : 8
          ctx.fill()
          ctx.shadowBlur = 0
        }

        const text =
          n.kind === 'question'
            ? 'RESEARCH QUESTION'
            : n.kind === 'request'
              ? `“${n.label.length > 36 ? n.label.slice(0, 34) + '…' : n.label}”`
              : n.label.length > 44
                ? n.label.slice(0, 42) + '…'
                : n.label
        ctx.font = `${n.kind === 'question' ? '600 5px' : n.kind === 'request' ? '3.4px' : '3.8px'} ui-sans-serif, system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = labelColor
        ctx.globalAlpha = n.kind === 'request' ? 0.55 : 0.9
        ctx.fillText(text, n.x, n.y + r + 1.5)
        ctx.globalAlpha = 1
      })
      .onNodeClick((node) => {
        const n = node as RenderNode
        setSelected(n.kind === 'source' ? n : null)
      })
      .onBackgroundClick(() => setSelected(null))

    fg.d3Force('charge')?.strength(-220)
    let fitted = false
    fg.onEngineStop(() => {
      if (!fitted) {
        fitted = true
        fg.zoomToFit(400, 60)
      }
    })

    const resize = () => fg.width(el.clientWidth).height(el.clientHeight)
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    return () => {
      observer.disconnect()
      fg._destructor()
    }
  }, [graph])

  if (!projectId) {
    return (
      <div className='rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground'>
        The evidence graph is available once the project is saved.
      </div>
    )
  }
  if (error) {
    return (
      <div className='rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground'>
        The evidence graph could not be loaded.
      </div>
    )
  }

  const sources = graph?.nodes.filter((n) => n.kind === 'source') ?? []

  return (
    <section className='flex h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-xl border border-border bg-card'>
      <div className='relative min-w-0 flex-1'>
        <div ref={containerRef} className='h-full w-full text-foreground' />
        {graph && sources.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center text-sm text-muted-foreground'>
            No sources yet — run Scout and the graph builds itself.
          </div>
        )}
        <div className='pointer-events-none absolute bottom-3 left-3 rounded-lg border border-border bg-background/85 px-3 py-2 text-[11px] leading-5 text-muted-foreground backdrop-blur'>
          <Dot color={LABEL_COLORS.supporting} /> supporting{' '}
          <Dot color={LABEL_COLORS.disputing} /> disputing{' '}
          <Dot color={LABEL_COLORS.partial} /> partial{' '}
          <Dot color={LABEL_COLORS.tangential} /> tangential
          <br />
          <Dot color={QUESTION_COLOR} /> question{' '}
          <Dot color={REQUEST_COLOR} hollow /> scout request{' '}
          <Dot color={MENTION_COLOR} /> citation mention · size = confidence
        </div>
      </div>

      {selected && (
        <aside className='w-80 shrink-0 overflow-y-auto border-l border-border p-5'>
          <div className='mb-2 flex items-start justify-between gap-2'>
            <h3 className='text-sm font-semibold leading-snug'>
              {selected.label}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
          <div className='mb-3 flex flex-wrap gap-1.5'>
            {selected.evidenceLabel && (
              <Badge
                color={LABEL_COLORS[selected.evidenceLabel] || REQUEST_COLOR}
              >
                {selected.evidenceLabel}
              </Badge>
            )}
            {typeof selected.confidence === 'number' && (
              <Badge color={QUESTION_COLOR}>
                {Math.round(selected.confidence * 100)}% confidence
              </Badge>
            )}
            <Badge color={REQUEST_COLOR}>{toolName(selected.sourceTool)}</Badge>
          </div>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            {selected.authors}
            {selected.venue && (
              <>
                <br />
                {selected.venue}
                {selected.year ? ` · ${selected.year}` : ''}
              </>
            )}
            {selected.doi && (
              <>
                <br />
                DOI: {selected.doi}
              </>
            )}
          </p>
          {selected.rationale && (
            <p className='mt-3 border-l-2 border-border pl-3 text-xs leading-relaxed'>
              {selected.rationale}
            </p>
          )}
          {selected.url && (
            <a
              href={selected.url}
              target='_blank'
              rel='noreferrer'
              className='mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400'
            >
              Open source <ExternalLink className='h-3 w-3' />
            </a>
          )}
        </aside>
      )}
    </section>
  )
}

const Dot = ({ color, hollow }: { color: string; hollow?: boolean }) => (
  <span
    className='inline-block h-2 w-2 rounded-full align-baseline'
    style={
      hollow ? { border: `1px solid ${color}` } : { backgroundColor: color }
    }
  />
)

const Badge = ({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) => (
  <span
    className='inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium'
    style={{
      color,
      backgroundColor: `${color}1f`,
      border: `1px solid ${color}55`,
    }}
  >
    {children}
  </span>
)

export default GraphView
