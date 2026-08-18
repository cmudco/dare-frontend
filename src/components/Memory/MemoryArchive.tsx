/**
 * MemoryArchive
 *
 * What DARE used to believe. Retired memories are never deleted — a fact that
 * stopped being true is still the correct answer to a question about the past
 * — so this is where they go, each one paired with what replaced it.
 *
 * Kept behind a disclosure rather than mixed into the feed: side by side with
 * current memories these read as contradictions, with nothing on the card to
 * say which one is live.
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Archive, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemoryItem } from '@/redux/types/memory'
import RetiredMemoryRow from './RetiredMemoryRow'

interface MemoryArchiveProps {
  items: MemoryItem[]
  loading: boolean
  /** Refetched on expand, so a correction made in another tab shows up. */
  onOpen: () => void
}

const MemoryArchive: React.FC<MemoryArchiveProps> = ({
  items,
  loading,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    if (!isOpen) onOpen()
    setIsOpen((open) => !open)
  }

  return (
    <div className='rounded-xl border border-dashed border-border'>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={isOpen}
        className='flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50'
      >
        {isOpen ? (
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        ) : (
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
        )}
        <Archive className='h-4 w-4 text-muted-foreground' />
        <span className='font-medium'>What DARE used to think</span>
        <span className='text-muted-foreground'>
          {loading && !items.length
            ? 'loading…'
            : items.length
              ? `${items.length} replaced, never deleted`
              : 'nothing replaced yet'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className={cn('space-y-3 px-4 pb-4')}>
              {!loading && items.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  Nothing has been replaced yet. When you tell DARE something
                  that contradicts what it knows, the old version lands here
                  instead of disappearing.
                </p>
              )}
              {items.map((item) => (
                <RetiredMemoryRow key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MemoryArchive
