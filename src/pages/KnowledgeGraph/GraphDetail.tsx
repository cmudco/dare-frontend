import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Search, X } from 'lucide-react'

import { getGraphAPI, getGraphViewAPI } from '@/api/knowledgeGraph'
import AskPanel from '@/components/KnowledgeGraph/AskPanel'
import EntityPanel from '@/components/KnowledgeGraph/EntityPanel'
import EvalPanel from '@/components/KnowledgeGraph/EvalPanel'
import GraphCanvas from '@/components/KnowledgeGraph/GraphCanvas'
import RelationshipsPanel from '@/components/KnowledgeGraph/RelationshipsPanel'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  KnowledgeGraphSummary,
  KnowledgeGraphView,
} from '@/redux/types/knowledgeGraph'

const BUSY = ['preparing', 'discovering', 'building']
const POLL_MS = 2500
const FEW_RELATIONS = 8

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className='min-w-0'>
    <p className='text-lg leading-tight font-semibold tabular-nums'>
      {value.toLocaleString()}
    </p>
    <p className='truncate text-xs text-muted-foreground'>{label}</p>
  </div>
)

const KnowledgeGraphDetail = () => {
  const { graphId } = useParams()
  const id = Number(graphId)
  const [graph, setGraph] = useState<KnowledgeGraphSummary | null>(null)
  const [view, setView] = useState<KnowledgeGraphView | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [pathIds, setPathIds] = useState<number[]>([])
  const [showLinks, setShowLinks] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('graph')

  const refresh = useCallback(async () => {
    const [summary, payload] = await Promise.all([
      getGraphAPI(id),
      getGraphViewAPI(id, focusId),
    ])
    setGraph(summary)
    setView(payload)
    // A graph with few stated relationships would look empty without these.
    setShowLinks((shown) => shown || payload.relations.length < FEW_RELATIONS)
  }, [id, focusId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const busy = !!graph && BUSY.includes(graph.status)
  useEffect(() => {
    if (!busy) return
    const timer = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [busy, refresh])

  const matches = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle || !view) return []
    return view.entities
      .filter((entity) => entity.label.toLowerCase().includes(needle))
      .slice(0, 6)
  }, [search, view])

  if (!graph || !view) {
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-[70vh] w-full rounded-lg' />
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <header className='border-b border-border px-6 pt-4 pb-3'>
        <Link
          to='/knowledge-graphs'
          className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-3 w-3' />
          Knowledge graphs
        </Link>
        <div className='mt-1 flex flex-wrap items-end justify-between gap-x-8 gap-y-3'>
          <div className='min-w-0'>
            <h1 className='truncate text-xl font-semibold'>{graph.name}</h1>
            {graph.description && (
              <p className='truncate text-sm text-muted-foreground'>
                {graph.description}
              </p>
            )}
          </div>
          <div className='flex gap-7'>
            <Stat label='Documents' value={view.stats.documents} />
            <Stat label='Chunks' value={view.stats.passages} />
            <Stat label='Entities' value={view.stats.entities} />
            <Stat label='Merged names' value={view.stats.mergedEntities} />
            <Stat
              label='Across documents'
              value={view.stats.crossDocumentEntities}
            />
            <Stat label='Relationships' value={view.stats.relations} />
          </div>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className='flex min-h-0 flex-1 flex-col'
      >
        <div className='border-b border-border px-6 py-2'>
          <TabsList>
            <TabsTrigger value='graph'>Graph</TabsTrigger>
            <TabsTrigger value='relationships'>Relationships</TabsTrigger>
            <TabsTrigger value='results'>Test results</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='graph' className='mt-0 flex min-h-0 flex-1'>
          <div className='relative min-w-0 flex-1'>
            <div className='absolute top-3 left-3 z-10 w-64'>
              <div className='relative'>
                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  className='bg-card pl-8 shadow-sm'
                  placeholder='Find an entity'
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type='button'
                    aria-label='Clear search'
                    onClick={() => setSearch('')}
                    className='absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
              {matches.length > 0 && (
                <div className='mt-1 overflow-hidden rounded-md border border-border bg-card shadow-sm'>
                  {matches.map((node) => (
                    <button
                      key={node.id}
                      type='button'
                      className='block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-accent'
                      onClick={() => {
                        setSelectedId(node.id)
                        setFocusId(node.id)
                        setSearch('')
                      }}
                    >
                      {node.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className='absolute top-3 right-3 z-10 flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm'>
              <Switch checked={showLinks} onCheckedChange={setShowLinks} />
              Mentioned together
            </label>
            {view.nodes.length > 0 ? (
              <GraphCanvas
                view={view}
                selectedId={selectedId}
                onSelect={setSelectedId}
                showLinks={showLinks}
                highlightedIds={pathIds}
              />
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                {graph.status === 'preparing'
                  ? 'Getting entities ready. This takes about a minute.'
                  : 'No entities yet. They appear once these documents finish processing.'}
              </div>
            )}
          </div>
          <aside className='flex w-[26rem] shrink-0 flex-col border-l border-border'>
            {selectedId != null ? (
              <EntityPanel
                graphId={id}
                entityId={selectedId}
                onClose={() => setSelectedId(null)}
                onSelect={setSelectedId}
                onChanged={() => void refresh()}
              />
            ) : (
              <AskPanel graphId={id} onPath={setPathIds} />
            )}
          </aside>
        </TabsContent>

        <TabsContent
          value='relationships'
          className='mt-0 min-h-0 flex-1 overflow-y-auto'
        >
          <RelationshipsPanel
            graph={graph}
            view={view}
            onChanged={() => void refresh()}
          />
        </TabsContent>

        <TabsContent
          value='results'
          className='mt-0 min-h-0 flex-1 overflow-y-auto'
        >
          <EvalPanel graphId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KnowledgeGraphDetail
