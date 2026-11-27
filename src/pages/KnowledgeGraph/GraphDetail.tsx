import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'

import {
  getGraphAPI,
  getGraphViewAPI,
  PICTURE_SIZES,
} from '@/api/knowledgeGraph'
import AskPanel from '@/components/KnowledgeGraph/AskPanel'
import EntityList from '@/components/KnowledgeGraph/EntityList'
import EntityPanel from '@/components/KnowledgeGraph/EntityPanel'
import EvalPanel from '@/components/KnowledgeGraph/EvalPanel'
import GraphCanvas from '@/components/KnowledgeGraph/GraphCanvas'
import GraphFilesDialog from '@/components/KnowledgeGraph/GraphFilesDialog'
import GraphLegend from '@/components/KnowledgeGraph/GraphLegend'
import GraphPager from '@/components/KnowledgeGraph/GraphPager'
import GraphSearchBox from '@/components/KnowledgeGraph/GraphSearchBox'
import GraphStats from '@/components/KnowledgeGraph/GraphStats'
import NameCheckButton from '@/components/KnowledgeGraph/NameCheckButton'
import RelationshipsPanel from '@/components/KnowledgeGraph/RelationshipsPanel'
import { tierRanges } from '@/components/KnowledgeGraph/tiers'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  GraphStatus,
  KnowledgeGraphSummary,
  KnowledgeGraphView,
} from '@/redux/types/knowledgeGraph'

const BUSY = ['preparing', 'discovering', 'building', 'checking_names']
const POLL_MS = 2500
const FEW_RELATIONS = 8

const KnowledgeGraphDetail = () => {
  const { graphId } = useParams()
  const id = Number(graphId)
  const [graph, setGraph] = useState<KnowledgeGraphSummary | null>(null)
  const [view, setView] = useState<KnowledgeGraphView | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [locate, setLocate] = useState<{ id: number; nonce: number } | null>(
    null
  )
  const [size, setSize] = useState(PICTURE_SIZES[0])
  const [offset, setOffset] = useState(0)
  const [pathIds, setPathIds] = useState<number[]>([])
  const [showLinks, setShowLinks] = useState(false)
  const [tab, setTab] = useState('graph')
  const [side, setSide] = useState('ask')
  // The names list loads the first time it is opened, and reloads on a merge.
  const [namesOpened, setNamesOpened] = useState(false)
  const [revision, setRevision] = useState(0)
  const [failed, setFailed] = useState(false)
  const [editing, setEditing] = useState(false)
  const latestRequest = useRef(0)
  const lastStatus = useRef<GraphStatus | null>(null)

  const refresh = useCallback(async () => {
    const request = ++latestRequest.current
    let summary: KnowledgeGraphSummary
    let payload: KnowledgeGraphView
    try {
      ;[summary, payload] = await Promise.all([
        getGraphAPI(id),
        getGraphViewAPI(id, { focus: focusId, size, offset }),
      ])
    } catch {
      // A failed poll keeps the last good view; only a first load has nothing to show.
      if (request === latestRequest.current) setFailed(true)
      return
    }
    if (request !== latestRequest.current) return
    // A finished name check changed the names, so the list reloads.
    if (
      lastStatus.current === 'checking_names' &&
      summary.status !== 'checking_names'
    ) {
      setRevision((current) => current + 1)
    }
    lastStatus.current = summary.status
    setFailed(false)
    setGraph(summary)
    setView(payload)
    // A graph with few stated relationships would look empty without these.
    setShowLinks((shown) => shown || payload.stats.relations < FEW_RELATIONS)
  }, [id, focusId, size, offset])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const busy = !!graph && BUSY.includes(graph.status)
  useEffect(() => {
    if (!busy) return
    const timer = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [busy, refresh])

  const drawnIds = useMemo(
    () => new Set(view?.nodes.map((node) => node.id)),
    [view]
  )

  /** Selects a name, moves the camera to it, and draws it if it was not. */
  const pick = (entityId: number) => {
    setSelectedId(entityId)
    setLocate((last) => ({ id: entityId, nonce: (last?.nonce ?? 0) + 1 }))
    if (!drawnIds.has(entityId)) setFocusId(entityId)
  }
  const turnTo = (nextOffset: number, nextSize = size) => {
    setOffset(nextOffset)
    setSize(nextSize)
    setFocusId(null)
    setSelectedId(null)
    setLocate(null)
  }
  const openNames = () => {
    setNamesOpened(true)
    setSide('names')
  }
  const reload = async () => {
    await refresh()
    setRevision((current) => current + 1)
  }

  if ((!graph || !view) && failed) {
    return (
      <div className='p-6 text-sm text-muted-foreground'>
        This graph could not be loaded.{' '}
        <Link to='/knowledge-graphs' className='text-foreground underline'>
          Back to knowledge graphs
        </Link>
      </div>
    )
  }
  if (!graph || !view) {
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-[70vh] w-full rounded-lg' />
      </div>
    )
  }

  const focusNode = view.nodes.find((node) => node.id === focusId)

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
            <div className='flex items-center gap-1'>
              <h1 className='truncate text-xl font-semibold'>{graph.name}</h1>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 shrink-0'
                aria-label='Edit graph'
                disabled={busy}
                onClick={() => setEditing(true)}
              >
                <Pencil className='h-3.5 w-3.5' />
              </Button>
            </div>
            {graph.description && (
              <p className='truncate text-sm text-muted-foreground'>
                {graph.description}
              </p>
            )}
            {graph.unreadFileIds.length > 0 && (
              <button
                type='button'
                className='text-sm text-muted-foreground underline hover:text-foreground'
                onClick={() => setTab('relationships')}
              >
                {graph.unreadFileIds.length} new{' '}
                {graph.unreadFileIds.length === 1 ? 'document' : 'documents'}{' '}
                not read for relationships yet
              </button>
            )}
            <div className='mt-2'>
              <NameCheckButton
                graph={graph}
                disabled={busy}
                onStarted={() => void refresh()}
              />
            </div>
          </div>
          <GraphStats stats={view.stats} />
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
            <GraphSearchBox graphId={id} onPick={pick} />
            <GraphLegend showLinks={showLinks} onShowLinks={setShowLinks} />
            {view.nodes.length > 0 && (
              <GraphPager
                offset={offset}
                size={size}
                pageCount={view.stats.pageEntities}
                total={view.stats.entities}
                tiers={tierRanges(view.stats.entityBands)}
                added={
                  focusNode && view.nodes.length > view.stats.pageEntities
                    ? {
                        label: focusNode.label,
                        count: view.nodes.length - view.stats.pageEntities,
                      }
                    : null
                }
                onPage={turnTo}
                onSize={(next) => turnTo(offset, next)}
                onRemoveAdded={() => {
                  if (selectedId === focusId) setSelectedId(null)
                  setFocusId(null)
                  setLocate(null)
                }}
                onBrowse={() => {
                  setSelectedId(null)
                  openNames()
                }}
              />
            )}
            {view.nodes.length > 0 ? (
              <GraphCanvas
                view={view}
                selectedId={selectedId}
                focusId={focusId}
                locate={locate}
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
            {selectedId != null && (
              <EntityPanel
                graphId={id}
                entityId={selectedId}
                onClose={() => setSelectedId(null)}
                onSelect={pick}
                onChanged={() => void reload()}
              />
            )}
            {/* Stays mounted behind an open entity, so the list keeps its place. */}
            <Tabs
              value={side}
              onValueChange={(next) =>
                next === 'names' ? openNames() : setSide(next)
              }
              className={
                selectedId != null ? 'hidden' : 'flex min-h-0 flex-1 flex-col'
              }
            >
              <div className='border-b border-border px-4 py-2'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='ask'>Trace a question</TabsTrigger>
                  <TabsTrigger value='names'>
                    All names ({view.stats.entities.toLocaleString()})
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value='ask'
                forceMount
                className='mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden'
              >
                <AskPanel graphId={id} onPath={setPathIds} />
              </TabsContent>
              <TabsContent
                value='names'
                forceMount
                className='mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden'
              >
                {namesOpened && (
                  <EntityList
                    graphId={id}
                    revision={revision}
                    drawnIds={drawnIds}
                    onSelect={pick}
                  />
                )}
              </TabsContent>
            </Tabs>
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
      <GraphFilesDialog
        open={editing}
        graph={graph}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          void refresh()
        }}
      />
    </div>
  )
}

export default KnowledgeGraphDetail
