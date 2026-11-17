import { useState } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useGraphNameSearch } from '@/hooks/useGraphNameSearch'

const SEARCH_MATCHES = 6

interface GraphSearchBoxProps {
  graphId: number
  onPick: (entityId: number) => void
}

/** Finds any name in the graph, on the picture or not. */
const GraphSearchBox = ({ graphId, onPick }: GraphSearchBoxProps) => {
  const [search, setSearch] = useState('')
  const { names: matches } = useGraphNameSearch(graphId, search, SEARCH_MATCHES)

  return (
    <div className='absolute top-3 left-3 z-10 w-64'>
      <div className='relative'>
        <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          className='bg-card pl-8 shadow-sm'
          placeholder='Find an entity'
          aria-label='Find an entity'
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
                onPick(node.id)
                setSearch('')
              }}
            >
              {node.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GraphSearchBox
