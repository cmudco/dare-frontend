/**
 * MemorySearch Component
 *
 * Search input with results display for vector similarity search.
 */
import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MemoryItem from './MemoryItem'
import { MemorySearchResult } from '@/redux/types/memory'

interface MemorySearchProps {
  onSearch: (query: string) => void
  searchResults: MemorySearchResult | null
  isLoading: boolean
  onDeleteItem: (id: string) => void
}

const MemorySearch = ({
  onSearch,
  searchResults,
  isLoading,
  onDeleteItem,
}: MemorySearchProps) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className='space-y-4'>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ask something about your memories...'
            className='border-border bg-background pl-10 focus:border-dare'
          />
        </div>
        <Button
          type='submit'
          disabled={!query.trim() || isLoading}
          className='bg-dare-gradient hover:opacity-90'
        >
          {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Search'}
        </Button>
      </form>

      {searchResults && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-muted-foreground'>
              Results for "{searchResults.query}"
            </h3>
            <span className='text-xs text-muted-foreground'>
              {searchResults.items.length} matches
            </span>
          </div>

          {searchResults.items.length > 0 ? (
            <div className='space-y-2'>
              {searchResults.items.map((item) => (
                <MemoryItem key={item.id} item={item} onDelete={onDeleteItem} />
              ))}
            </div>
          ) : (
            <p className='py-4 text-center text-sm text-muted-foreground'>
              No memories found matching your query.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MemorySearch
