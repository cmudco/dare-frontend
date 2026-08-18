/**
 * MemoryCommandBar
 *
 * The single search surface for the memory page. Typing filters the feed
 * instantly (keyword match); pressing Enter runs a semantic search against
 * the backend. A status line underneath says exactly which mode is active.
 */
import { FormEvent } from 'react'
import { Loader2, Search, Waypoints, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { MemorySearchResult } from '@/redux/types/memory'

interface Props {
  query: string
  onQueryChange: (query: string) => void
  onSemanticSearch: (query: string) => void
  onClearSearch: () => void
  semanticResult: MemorySearchResult | null
  searchLoading: boolean
  /** Number of items currently visible in the feed */
  visibleCount: number
}

const MemoryCommandBar = ({
  query,
  onQueryChange,
  onSemanticSearch,
  onClearSearch,
  semanticResult,
  searchLoading,
  visibleCount,
}: Props) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim().length > 0) {
      onSemanticSearch(query.trim())
    }
  }

  const hasQuery = query.trim().length > 0
  const showStatus = hasQuery || semanticResult

  return (
    <div className='space-y-2'>
      <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClearSearch()
            }}
            placeholder='Filter as you type — press Enter to search by meaning'
            aria-label='Search memories'
            className='h-11 rounded-xl bg-card pr-10 pl-10'
          />
          {(hasQuery || semanticResult) && (
            <button
              type='button'
              onClick={onClearSearch}
              aria-label='Clear search'
              className='absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        <Button
          type='submit'
          variant='outline'
          disabled={!hasQuery || searchLoading}
          className='h-11 shrink-0 rounded-xl'
        >
          {searchLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Waypoints className='h-4 w-4' />
          )}
          Semantic search
        </Button>
      </form>

      {showStatus && (
        <p className='px-1 text-xs text-muted-foreground'>
          {semanticResult ? (
            <>
              Semantic matches for{' '}
              <span className='font-medium text-foreground'>
                &ldquo;{semanticResult.query}&rdquo;
              </span>{' '}
              — {visibleCount} {visibleCount === 1 ? 'memory' : 'memories'},
              ranked by meaning, not wording.
            </>
          ) : (
            <>
              Keyword filter — {visibleCount}{' '}
              {visibleCount === 1 ? 'memory' : 'memories'} matching as you type.
              Press Enter to search by meaning instead.
            </>
          )}
        </p>
      )}
    </div>
  )
}

export default MemoryCommandBar
