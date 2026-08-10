/**
 * MemoryScreen
 *
 * The transparent view of everything DARE remembers about you, organized by
 * memory layer. Browse, filter, search (keyword or semantic), and prune.
 */
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Fingerprint, FlaskConical, Sprout } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  clearAllMemory,
  deleteMemoryItem,
  getMemoryItems,
  searchMemory,
} from '@/redux/asyncThunks/memory'
import {
  clearMemoryError,
  clearSearchResults,
  exitSampleMode,
  loadSampleMemories,
  removeMemoryItemLocal,
} from '@/redux/memorySlice'
import { MemoryType } from '@/redux/types/memory'
import { config } from '@/config/environment'
import { toast } from '@/utils/toast'
import { formatRelativeDate } from '@/utils/dateUtils'
import { SAMPLE_MEMORIES } from '@/utils/constants/memorySamples'
import { Button } from '@/components/ui/button'
import {
  ClearMemoryDialog,
  MemoryCommandBar,
  MemoryExplainer,
  MemoryFeed,
  MemoryLayerCards,
} from '@/components/Memory'
import { bucketForType, layerFor } from '@/components/Memory/layers'

const MemoryScreen = () => {
  const dispatch = useAppDispatch()
  const [selectedLayer, setSelectedLayer] = useState<MemoryType | null>(null)
  const [query, setQuery] = useState('')
  const [explainerOpen, setExplainerOpen] = useState(false)

  const items = useAppSelector((state) => state.memory.items)
  const itemsLoading = useAppSelector((state) => state.memory.itemsLoading)
  const searchResults = useAppSelector((state) => state.memory.searchResults)
  const searchLoading = useAppSelector((state) => state.memory.searchLoading)
  const clearing = useAppSelector((state) => state.memory.clearing)
  const previewMode = useAppSelector((state) => state.memory.previewMode)
  const error = useAppSelector((state) => state.memory.error)

  useEffect(() => {
    if (!previewMode) {
      dispatch(getMemoryItems())
    }
  }, [dispatch, previewMode])

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
    if (previewMode) {
      dispatch(removeMemoryItemLocal(id))
      toast.success('Memory forgotten')
      return
    }
    const result = await dispatch(deleteMemoryItem(id))
    if (deleteMemoryItem.fulfilled.match(result)) {
      toast.success('Memory forgotten')
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

  const handleLoadSamples = () => {
    dispatch(loadSampleMemories(SAMPLE_MEMORIES))
    setSelectedLayer(null)
    setQuery('')
    toast.success('Sample memories loaded — nothing is stored')
  }

  const handleExitSamples = () => {
    dispatch(exitSampleMode())
    setSelectedLayer(null)
    setQuery('')
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
          <div className='flex shrink-0 items-center gap-2'>
            <Button variant='outline' onClick={() => setExplainerOpen(true)}>
              <BookOpen className='h-4 w-4' />
              How it works
            </Button>
            {config.isLocal && !previewMode && (
              <Button variant='outline' onClick={handleLoadSamples}>
                <Sprout className='h-4 w-4' />
                Sample data
              </Button>
            )}
            {items.length > 0 && !previewMode && (
              <ClearMemoryDialog
                memoryCount={items.length}
                clearing={clearing}
                onConfirm={handleClearAll}
              />
            )}
          </div>
        </motion.div>

        {/* Sample mode banner */}
        {previewMode && (
          <div className='flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-4 py-2.5'>
            <div className='flex items-center gap-2.5 text-sm'>
              <FlaskConical className='h-4 w-4 shrink-0 text-muted-foreground' />
              <span>Exploring with sample memories — nothing is stored.</span>
            </div>
            <Button variant='ghost' size='sm' onClick={handleExitSamples}>
              Exit sample mode
            </Button>
          </div>
        )}

        {/* Layer overview + filter */}
        <MemoryLayerCards
          countsByType={countsByType}
          selectedLayer={selectedLayer}
          onSelectLayer={setSelectedLayer}
          onOpenExplainer={() => setExplainerOpen(true)}
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
        >
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
            semanticDisabled={previewMode}
          />
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

        {/* Feed */}
        <MemoryFeed
          items={visibleItems}
          isLoading={itemsLoading}
          selectedLayer={selectedLayer}
          isSearching={Boolean(searchResults) || trimmedQuery.length > 0}
          showScores={Boolean(searchResults)}
          onDelete={handleDelete}
          onCategoryClick={handleQueryChange}
          onOpenExplainer={() => setExplainerOpen(true)}
          onLoadSamples={
            config.isLocal && !previewMode ? handleLoadSamples : undefined
          }
        />
      </div>

      <MemoryExplainer open={explainerOpen} onOpenChange={setExplainerOpen} />
    </div>
  )
}

export default MemoryScreen
