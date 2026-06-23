import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph from 'force-graph'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowRight,
  ExternalLink,
  FileText,
  FileCode2,
  Folder,
  History,
  Lightbulb,
  HelpCircle,
} from 'lucide-react'

const OKF_REPO = 'https://github.com/GoogleCloudPlatform/knowledge-catalog'
const OKF_SPEC =
  'https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md'

// How DARE's durable knowledge maps onto the OKF v0.1 pattern, one-to-one.
const OKF_MAP: { from: string; to: string }[] = [
  { from: 'Research question', to: 'index.md (bundle root)' },
  {
    from: 'Working thesis · open question · decision',
    to: 'theses/*.md — frontmatter type',
  },
  {
    from: 'Scholar-promoted source',
    to: 'sources/*.md — type: Research Source',
  },
  { from: 'Observed DOI citations', to: 'markdown links between files' },
  { from: 'Promotion history', to: 'log.md' },
]
import { getResearchOkfBundleAPI } from '@/api/research'
import type {
  OkfBundle,
  OkfBundleFile,
  OkfBundleGraphNode,
} from '@/redux/types/research'

// Evidence palette — shared with the evidence graph for a consistent language.
const LABEL_COLORS: Record<string, string> = {
  supporting: '#22c55e',
  disputing: '#ef4444',
  partial: '#f59e0b',
  tangential: '#94a3b8',
  unverifiable: '#64748b',
}
const THESIS_COLOR = '#3b82f6'

const kindIcon = (file: OkfBundleFile) => {
  if (file.kind === 'index') return FileText
  if (file.kind === 'log') return History
  if (file.kind === 'thesis')
    return file.type === 'Open question' ? HelpCircle : Lightbulb
  return FileCode2
}

const nodeColor = (n: OkfBundleGraphNode) =>
  n.kind === 'thesis'
    ? THESIS_COLOR
    : LABEL_COLORS[n.evidenceLabel] || '#94a3b8'

/** href -> conceptId for an in-bundle markdown link (`/sources/source-12.md`). */
const hrefToConceptId = (href: string) =>
  href.replace(/^\//, '').replace(/\.md$/, '')

/**
 * Native viewer for the project's durable-knowledge OKF bundle: a file tree, the
 * rendered markdown of each concept (frontmatter as chips + the body), and a
 * link graph of source-to-source citations. In-bundle markdown links navigate
 * between concepts. Mirrors what Google's static OKF visualizer shows, themed
 * with DARE tokens and fed by `GET .../okf-bundle/`.
 */
const KnowledgeBundleView = ({
  projectId,
  onCount,
}: {
  projectId?: number
  onCount?: (n: number) => void
}) => {
  const [bundle, setBundle] = useState<OkfBundle | null>(null)
  const [error, setError] = useState(false)
  const [activeId, setActiveId] = useState('index')
  const graphRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!projectId) return
    getResearchOkfBundleAPI(projectId)
      .then((b) => {
        setBundle(b)
        setActiveId(b.files[0]?.conceptId ?? 'index')
      })
      .catch(() => setError(true))
  }, [projectId])

  useEffect(() => {
    if (bundle && onCount) {
      onCount(bundle.files.filter((f) => f.kind === 'source').length)
    }
  }, [bundle, onCount])

  const byId = useMemo(() => {
    const map = new Map<string, OkfBundleFile>()
    bundle?.files.forEach((f) => map.set(f.conceptId, f))
    return map
  }, [bundle])

  const tree = useMemo(() => {
    const top: OkfBundleFile[] = []
    const folders = new Map<string, OkfBundleFile[]>()
    bundle?.files.forEach((f) => {
      const slash = f.path.indexOf('/')
      if (slash === -1) top.push(f)
      else {
        const dir = f.path.slice(0, slash)
        if (!folders.has(dir)) folders.set(dir, [])
        folders.get(dir)!.push(f)
      }
    })
    return { top, folders }
  }, [bundle])

  useEffect(() => {
    const el = graphRef.current
    if (!el || !bundle || bundle.graph.nodes.length === 0) return

    const labelColor = getComputedStyle(el).color
    const nodes = bundle.graph.nodes.map((n) => ({ ...n }))
    const links = bundle.graph.edges.map((e) => ({ ...e }))

    const fg = new ForceGraph(el)
      .graphData({ nodes, links })
      .backgroundColor('rgba(0,0,0,0)')
      .nodeRelSize(5)
      .nodeLabel((n) => (n as OkfBundleGraphNode).label)
      .linkColor(() => '#94a3b899')
      .linkWidth(1)
      .nodeCanvasObject((node, ctx, globalScale) => {
        const n = node as OkfBundleGraphNode & { x?: number; y?: number }
        if (n.x === undefined || n.y === undefined) return
        ctx.beginPath()
        ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = nodeColor(n)
        ctx.fill()
        const label = n.id.split('/').pop() ?? n.label
        ctx.font = `${11 / globalScale}px ui-sans-serif, system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = labelColor
        ctx.globalAlpha = 0.65
        ctx.fillText(label, n.x, n.y + 6)
        ctx.globalAlpha = 1
      })
      .onNodeClick((node) => setActiveId((node as OkfBundleGraphNode).id))

    fg.d3Force('charge')?.strength(-140)
    fg.onEngineStop(() => fg.zoomToFit(300, 28))
    const resize = () => {
      fg.width(el.clientWidth).height(el.clientHeight)
      fg.zoomToFit(200, 28)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    return () => {
      observer.disconnect()
      fg._destructor()
    }
  }, [bundle])

  if (!projectId) {
    return (
      <div className='rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground'>
        The knowledge bundle is available once the project is saved.
      </div>
    )
  }
  if (error) {
    return (
      <div className='rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground'>
        The knowledge bundle could not be loaded.
      </div>
    )
  }

  const active = byId.get(activeId)
  const hasGraph = (bundle?.graph.nodes.length ?? 0) > 0

  return (
    <div className='space-y-4'>
      <section className='flex h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-xl border border-border bg-card'>
        <div className='flex w-64 shrink-0 flex-col border-r border-border'>
          <div className='flex-1 overflow-y-auto p-3 text-sm'>
            {tree.top.map((f) => (
              <TreeItem
                key={f.conceptId}
                file={f}
                active={f.conceptId === activeId}
                onClick={() => setActiveId(f.conceptId)}
              />
            ))}
            {[...tree.folders.entries()].map(([dir, files]) => (
              <div key={dir} className='mt-1'>
                <div className='flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground'>
                  <Folder className='h-3.5 w-3.5' /> {dir}/
                </div>
                {files.map((f) => (
                  <TreeItem
                    key={f.conceptId}
                    file={f}
                    indent
                    active={f.conceptId === activeId}
                    onClick={() => setActiveId(f.conceptId)}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className='border-t border-border'>
            <div className='flex items-center justify-between px-3 pt-2'>
              <span className='text-[11px] text-muted-foreground'>
                citation graph
              </span>
              <span className='flex items-center gap-2 text-[10px] text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <span
                    className='inline-block h-2 w-2 rounded-full'
                    style={{ backgroundColor: LABEL_COLORS.supporting }}
                  />
                  supporting
                </span>
                <span className='flex items-center gap-1'>
                  <span
                    className='inline-block h-2 w-2 rounded-full'
                    style={{ backgroundColor: LABEL_COLORS.disputing }}
                  />
                  disputing
                </span>
              </span>
            </div>
            <div className='relative h-48'>
              <div ref={graphRef} className='h-full w-full text-foreground' />
              {!hasGraph && (
                <div className='absolute inset-0 flex items-center justify-center px-4 text-center text-[11px] text-muted-foreground'>
                  No concepts yet — promote knowledge to build the bundle.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='min-w-0 flex-1 overflow-y-auto p-6'>
          {active ? (
            <article>
              <p className='font-mono text-xs text-muted-foreground'>
                {active.conceptId} · {active.type.toLowerCase()}
              </p>
              {active.kind !== 'index' && active.kind !== 'log' && (
                <Frontmatter file={active} />
              )}
              <div className='prose prose-sm mt-3 max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:mt-5 prose-h1:text-base prose-a:text-blue-600 dark:prose-a:text-blue-400'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
                      const url = href ?? ''
                      if (url.startsWith('/')) {
                        const id = hrefToConceptId(url)
                        return (
                          <a
                            role='button'
                            tabIndex={0}
                            className='cursor-pointer'
                            onClick={() => byId.has(id) && setActiveId(id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && byId.has(id))
                                setActiveId(id)
                            }}
                          >
                            {children}
                          </a>
                        )
                      }
                      return (
                        <a href={url} target='_blank' rel='noreferrer'>
                          {children}
                        </a>
                      )
                    },
                  }}
                >
                  {active.body}
                </ReactMarkdown>
              </div>
            </article>
          ) : (
            <p className='text-sm text-muted-foreground'>Select a file.</p>
          )}
        </div>
      </section>
      <BundleFooter />
    </div>
  )
}

const BundleFooter = () => (
  <details open className='rounded-xl border border-border bg-card p-4 text-sm'>
    <summary className='cursor-pointer font-medium text-foreground'>
      Built with the Open Knowledge Format (OKF v0.1)
    </summary>
    <div className='mt-3 space-y-3 text-muted-foreground'>
      <p className='leading-relaxed'>
        This bundle follows Google Cloud&apos;s Open Knowledge Format — a
        directory of markdown files with YAML frontmatter, where links between
        files form the graph. We map DARE&apos;s durable knowledge onto that
        pattern one-to-one:
      </p>
      <ul className='space-y-1.5'>
        {OKF_MAP.map((m) => (
          <li key={m.from} className='flex flex-wrap items-center gap-2'>
            <span className='text-foreground'>{m.from}</span>
            <ArrowRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            <span className='font-mono text-xs'>{m.to}</span>
          </li>
        ))}
      </ul>
      <div className='flex flex-wrap gap-4 pt-1'>
        <a
          className='inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400'
          href={OKF_SPEC}
          target='_blank'
          rel='noreferrer'
        >
          <ExternalLink className='h-3.5 w-3.5' /> OKF specification (SPEC.md)
        </a>
        <a
          className='inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400'
          href={OKF_REPO}
          target='_blank'
          rel='noreferrer'
        >
          <ExternalLink className='h-3.5 w-3.5' /> knowledge-catalog on GitHub
        </a>
      </div>
    </div>
  </details>
)

const TreeItem = ({
  file,
  active,
  indent,
  onClick,
}: {
  file: OkfBundleFile
  active: boolean
  indent?: boolean
  onClick: () => void
}) => {
  const Icon = kindIcon(file)
  const name = file.path.split('/').pop()
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors ${
        indent ? 'pl-6' : ''
      } ${
        active
          ? 'bg-muted font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      }`}
    >
      <Icon className='h-3.5 w-3.5 shrink-0' />
      <span className='truncate'>{name}</span>
    </button>
  )
}

const Frontmatter = ({ file }: { file: OkfBundleFile }) => {
  const fm = file.frontmatter
  const tags = Array.isArray(fm.tags) ? (fm.tags as string[]) : []
  const resource = typeof fm.resource === 'string' ? fm.resource : ''
  const timestamp = typeof fm.timestamp === 'string' ? fm.timestamp : ''
  return (
    <div className='mt-2'>
      <h2 className='text-lg leading-snug font-semibold'>{file.title}</h2>
      <div className='mt-2 flex flex-wrap gap-1.5'>
        <Chip color='#64748b'>{file.type}</Chip>
        {file.evidenceLabel && (
          <Chip color={LABEL_COLORS[file.evidenceLabel] || '#94a3b8'}>
            {file.evidenceLabel}
          </Chip>
        )}
        {typeof file.confidence === 'number' && (
          <Chip color={THESIS_COLOR}>
            confidence {file.confidence.toFixed(2)}
          </Chip>
        )}
      </div>
      {resource && (
        <a
          href={resource.startsWith('http') ? resource : undefined}
          target='_blank'
          rel='noreferrer'
          className={`mt-2 inline-flex items-center gap-1 text-xs break-all ${
            resource.startsWith('http')
              ? 'text-blue-600 hover:underline dark:text-blue-400'
              : 'text-muted-foreground'
          }`}
        >
          {resource.startsWith('http') && <ExternalLink className='h-3 w-3' />}
          {resource}
        </a>
      )}
      {(tags.length > 0 || timestamp) && (
        <p className='mt-1 text-xs text-muted-foreground'>
          {tags.length > 0 && <>tags: {tags.join(', ')}</>}
          {tags.length > 0 && timestamp && ' · '}
          {timestamp && <>updated {timestamp.slice(0, 10)}</>}
        </p>
      )}
    </div>
  )
}

const Chip = ({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) => (
  <span
    className='inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium'
    style={{
      color,
      backgroundColor: `${color}1f`,
      border: `1px solid ${color}55`,
    }}
  >
    {children}
  </span>
)

export default KnowledgeBundleView
