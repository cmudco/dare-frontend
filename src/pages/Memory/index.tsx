/**
 * MemoryScreen
 *
 * The transparent view of everything DARE remembers about you, organized by
 * memory layer. Browse, filter, search (keyword or semantic), and prune.
 */
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Fingerprint } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  clearAllMemory,
  deleteMemoryItem,
  applyMemoryProposal,
  getMemoryItems,
  getMemorySweep,
  getMemoryBackfill,
  getRetiredMemoryItems,
  searchMemory,
  updateMemoryItem,
} from '@/redux/asyncThunks/memory'
import {
  clearMemoryError,
  clearSearchResults,
  setSessionMode,
} from '@/redux/memorySlice'
import { MemoryBackfillStatus, MemoryType } from '@/redux/types/memory'
import type { MemoryProposal } from '@/redux/types/memory'
import { toast } from '@/utils/toast'
import { formatRelativeDate } from '@/utils/dateUtils'
import { Button } from '@/components/ui/button'
import {
  ClearMemoryDialog,
  MemoryArchive,
  MemoryBackfillButton,
  MemoryCommandBar,
  MemoryExplainer,
  MemoryFeed,
  MemoryLayerCards,
  MemoryPortability,
  MemoryTidyUp,
  SessionSearch,
} from '@/components/Memory'
import { bucketForType, layerFor } from '@/components/Memory/layers'

const MemoryScreen = () => {
  const dispatch = useAppDispatch()
  const [selectedLayer, setSelectedLayer] = useState<MemoryType | null>(null)
  const [query, setQuery] = useState('')
  const [sessionQuery, setSessionQuery] = useState('')
  const [sessionSince, setSessionSince] = useState('')
  const [sessionUntil, setSessionUntil] = useState('')
  const [explainerOpen, setExplainerOpen] = useState(false)

  const items = useAppSelector((state) => state.memory.items)
  const itemsLoading = useAppSelector((state) => state.memory.itemsLoading)
  const retired = useAppSelector((state) => state.memory.retired)
  const retiredLoading = useAppSelector((state) => state.memory.retiredLoading)
  const sweep = useAppSelector((state) => state.memory.sweep)
  const sweepLoading = useAppSelector((state) => state.memory.sweepLoading)
  const applyingProposal = useAppSelector(
    (state) => state.memory.applyingProposal
  )
  const searchResults = useAppSelector((state) => state.memory.searchResults)
  const sessionMode = useAppSelector((state) => state.memory.sessionMode)
  const searchLoading = useAppSelector((state) => state.memory.searchLoading)
  const clearing = useAppSelector((state) => state.memory.clearing)
  const savingId = useAppSelector((state) => state.memory.savingId)
  const error = useAppSelector((state) => state.memory.error)
  const backfillRun = useAppSelector((state) => state.memory.backfillRun)
  const backfillInProgress =
    backfillRun?.status === MemoryBackfillStatus.QUEUED ||
    backfillRun?.status === MemoryBackfillStatus.RUNNING

  useEffect(() => {
    dispatch(getMemoryItems())
    // Fetched up front rather than on expand: the count is the headline, and
    // "2 retired" says something about the store that "expand to find out"
    // does not.
    dispatch(getRetiredMemoryItems())
    dispatch(getMemoryBackfill())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearMemoryError())
    }
  }, [error, dispatch])

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach((item) => {
      const bucket = bucketForType(item.memoryType)
      counts[bucket] = (counts[bucket] ?? 0) + 1
    })
    return counts
  }, [items])

  const lastUpdated = useMemo(() => {
    const dates = items
      .map((item) => item.updatedAt ?? item.createdAt)
      .filter((date): date is string => Boolean(date))
      .map((date) => new Date(date).getTime())
    if (dates.length === 0) return null
    return new Date(Math.max(...dates)).toISOString()
  }, [items])

  const trimmedQuery = query.trim().toLowerCase()

  const visibleItems = useMemo(() => {
    let result = searchResults ? searchResults.items : items
    if (selectedLayer) {
      result = result.filter(
        (item) => bucketForType(item.memoryType) === selectedLayer
      )
    }
    if (!searchResults && trimmedQuery) {
      result = result.filter(
        (item) =>
          item.content.toLowerCase().includes(trimmedQuery) ||
          item.categories?.some((category) =>
            category.toLowerCase().includes(trimmedQuery)
          )
      )
    }
    return result
  }, [items, searchResults, selectedLayer, trimmedQuery])

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery)
    if (searchResults) {
      dispatch(clearSearchResults())
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    dispatch(clearSearchResults())
  }

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteMemoryItem(id))
    if (deleteMemoryItem.fulfilled.match(result)) {
      toast.success('Memory forgotten')
    }
  }

  /** Resolves false when the server refused, so the editor stays open. */
  const handleEdit = async (id: string, content: string): Promise<boolean> => {
    const result = await dispatch(updateMemoryItem({ id, content }))
    if (updateMemoryItem.fulfilled.match(result)) {
      toast.success('Memory updated')
      return true
    }
    return false
  }

  /** Applying a suggestion changes the store, so the page has to catch up. */
  const handleApproveProposal = async (proposal: MemoryProposal) => {
    const result = await dispatch(applyMemoryProposal(proposal))
    if (applyMemoryProposal.fulfilled.match(result)) {
      toast.success(result.payload.detail)
      dispatch(getMemoryItems())
      dispatch(getRetiredMemoryItems())
    }
  }

  const handleClearAll = async () => {
    const result = await dispatch(clearAllMemory())
    if (clearAllMemory.fulfilled.match(result)) {
      toast.success('All memories cleared')
      handleClearSearch()
      setSelectedLayer(null)
    }
  }

  const activeLayer = selectedLayer ? layerFor(selectedLayer) : null

  return (
    <div className='flex h-full flex-col'>
      <div className='mx-auto w-full max-w-5xl space-y-6 px-6 pt-6 pb-10'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
        >
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-dare-gradient'>
              <Fingerprint className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Memory</h1>
              <p className='text-sm text-muted-foreground'>
                Everything DARE remembers about you — layered, transparent, and
                yours to prune.
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
            <Button variant='outline' onClick={() => setExplainerOpen(true)}>
              <BookOpen className='h-4 w-4' />
              How it works
            </Button>
            <MemoryBackfillButton />
            <MemoryPortability memoryCount={items.length} />
            {items.length > 0 && (
              <ClearMemoryDialog
                memoryCount={items.length}
                clearing={clearing}
                disabled={backfillInProgress}
                onConfirm={handleClearAll}
              />
            )}
          </div>
        </motion.div>

        {/* Layer overview + filter */}
        <MemoryLayerCards
          countsByType={countsByType}
          selectedLayer={sessionMode ? null : selectedLayer}
          onSelectLayer={(layer) => {
            setSelectedLayer(layer)
            if (sessionMode) dispatch(setSessionMode(false))
          }}
          sessionsSelected={sessionMode}
          onSelectSessions={(selected) => {
            dispatch(setSessionMode(selected))
            if (selected) setSelectedLayer(null)
          }}
        />

        {/* What was replaced — up here with the layers, because a store that
            corrects itself is the point, not a footnote */}
        <MemoryArchive
          items={retired}
          loading={retiredLoading}
          onOpen={() => dispatch(getRetiredMemoryItems())}
        />

        {/* What the store would like to fix about itself */}
        <MemoryTidyUp
          sweep={sweep}
          loading={sweepLoading}
          applyingProposal={applyingProposal}
          onRun={() => dispatch(getMemorySweep())}
          onApprove={handleApproveProposal}
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
        >
          {sessionMode ? (
            <SessionSearch
              query={sessionQuery}
              onQueryChange={setSessionQuery}
              since={sessionSince}
              onSinceChange={setSessionSince}
              until={sessionUntil}
              onUntilChange={setSessionUntil}
            />
          ) : (
            <MemoryCommandBar
              query={query}
              onQueryChange={handleQueryChange}
              onSemanticSearch={(searchQuery) =>
                dispatch(searchMemory(searchQuery))
              }
              onClearSearch={handleClearSearch}
              semanticResult={searchResults}
              searchLoading={searchLoading}
              visibleCount={visibleItems.length}
            />
          )}
        </motion.div>

        {/* Matched clusters from semantic search */}
        {searchResults && searchResults.categories.length > 0 && (
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='text-xs text-muted-foreground'>
              Matched clusters:
            </span>
            {searchResults.categories.map((category) => (
              <span
                key={category.name}
                title={category.summary}
                className='rounded-full border border-border bg-card px-2.5 py-1 text-xs'
              >
                {category.name}
                {typeof category.score === 'number' && (
                  <span className='ml-1.5 text-muted-foreground tabular-nums'>
                    {Math.round(category.score * 100)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Feed header */}
        {!sessionMode && (
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {visibleItems.length}{' '}
              {visibleItems.length === 1 ? 'memory' : 'memories'}
              {activeLayer && (
                <>
                  {' '}
                  in{' '}
                  <span className='font-medium text-foreground'>
                    {activeLayer.label}
                  </span>{' '}
                  <button
                    type='button'
                    onClick={() => setSelectedLayer(null)}
                    className='ml-1 underline underline-offset-2 hover:text-foreground'
                  >
                    show all
                  </button>
                </>
              )}
            </p>
            {lastUpdated && (
              <p className='text-xs text-muted-foreground'>
                Updated {formatRelativeDate(lastUpdated)}
              </p>
            )}
          </div>
        )}

        {/* Feed */}
        {!sessionMode && (
          <MemoryFeed
            items={visibleItems}
            isLoading={itemsLoading}
            selectedLayer={selectedLayer}
            isSearching={Boolean(searchResults) || trimmedQuery.length > 0}
            showScores={Boolean(searchResults)}
            onDelete={handleDelete}
            onEdit={handleEdit}
            savingId={savingId}
            onCategoryClick={handleQueryChange}
            onOpenExplainer={() => setExplainerOpen(true)}
          />
        )}
      </div>

      <MemoryExplainer open={explainerOpen} onOpenChange={setExplainerOpen} />
    </div>
  )
}

export default MemoryScreen
