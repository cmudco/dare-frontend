import React, { useState } from 'react'
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { MemoryContextItem } from '@/redux/types/conversation'

interface MemoryContextSourcesProps {
  items: MemoryContextItem[]
}

const MemoryContextSources: React.FC<MemoryContextSourcesProps> = ({
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!items || items.length === 0) return null

  return (
    <div className='mt-2 w-full max-w-[95%] pl-10'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center text-sm text-muted-foreground hover:text-foreground'
      >
        {isOpen ? (
          <ChevronUp className='mr-1 h-4 w-4' />
        ) : (
          <ChevronDown className='mr-1 h-4 w-4' />
        )}
        <Brain className='mr-1.5 h-4 w-4' />
        {isOpen ? 'Hide Memories' : `Show Memories (${items.length})`}
      </button>

      {isOpen && (
        <div className='mt-2 space-y-2'>
          {items.map((item, index) => (
            <div
              key={index}
              className='rounded-lg border border-border bg-muted/50 p-3'
            >
              <div className='flex items-start justify-between gap-2'>
                <p className='line-clamp-3 flex-1 text-sm text-foreground'>
                  {item.content}
                </p>
                {item.memoryType && (
                  <span className='flex-shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'>
                    {item.memoryType}
                  </span>
                )}
              </div>
              {item.categories && item.categories.length > 0 && (
                <div className='mt-1.5 flex flex-wrap gap-1'>
                  {item.categories.map((cat) => (
                    <span
                      key={cat}
                      className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-slate-800'
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemoryContextSources
