/**
 * MemoryFeed
 *
 * The memory list: loading skeletons, layer-aware empty states, the profile
 * hot-layer budget preview, and the cards themselves.
 */
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BookOpen, FileText, Fingerprint, Rows3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MemoryType, type MemoryItem } from '@/redux/types/memory'
import MemoryCard from './MemoryCard'
import ProfileDocument from './ProfileDocument'
import { layerFor } from './layers'
import { cn } from '@/lib/utils'

interface Props {
  items: MemoryItem[]
  isLoading: boolean
  selectedLayer: MemoryType | null
  isSearching: boolean
  showScores: boolean
  onDelete: (id: string) => void
  /** Rewrite a memory. Resolves false when the server refused. */
  onEdit: (id: string, content: string) => Promise<boolean>
  /** Id of the memory currently being saved, if any */
  savingId?: string | null
  /** Filter the feed by a category tag */
  onCategoryClick?: (category: string) => void
  /** Open the "How memory works" drawer from the empty state */
  onOpenExplainer?: () => void
}

const ProfileViewToggle = ({
  view,
  onViewChange,
}: {
  view: 'document' | 'cards'
  onViewChange: (view: 'document' | 'cards') => void
}) => (
  <div className='flex items-center gap-1 rounded-lg border border-border bg-card p-0.5'>
    {(
      [
        { key: 'document', label: 'Document', icon: FileText },
        { key: 'cards', label: 'Cards', icon: Rows3 },
      ] as const
    ).map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        type='button'
        onClick={() => onViewChange(key)}
        aria-pressed={view === key}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          view === key
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Icon className='h-3.5 w-3.5' />
        {label}
      </button>
    ))}
  </div>
)

const MemoryFeed = ({
  items,
  isLoading,
  selectedLayer,
  isSearching,
  showScores,
  onDelete,
  onEdit,
  savingId,
  onCategoryClick,
  onOpenExplainer,
}: Props) => {
  const [profileView, setProfileView] = useState<'document' | 'cards'>(
    'document'
  )

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className='h-28 w-full rounded-xl' />
        ))}
      </div>
    )
  }

  const layer = selectedLayer ? layerFor(selectedLayer) : null

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
        <div className='mb-4 rounded-full bg-muted p-3'>
          <Fingerprint className='h-6 w-6 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>
          {isSearching
            ? 'Nothing matched'
            : layer
              ? `Nothing in the ${layer.label.toLowerCase()} layer yet`
              : 'No memories yet'}
        </p>
        <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
          {isSearching
            ? 'Try different words, or press Enter to search by meaning instead of keywords.'
            : layer
              ? layer.blurb
              : 'As you talk to DARE, the things worth keeping land here — visible, searchable, and yours to prune.'}
        </p>
        {!isSearching && onOpenExplainer && (
          <div className='mt-4'>
            <Button variant='outline' size='sm' onClick={onOpenExplainer}>
              <BookOpen className='h-4 w-4' />
              How memory works
            </Button>
          </div>
        )}
      </div>
    )
  }

  const showProfileDocument =
    selectedLayer === MemoryType.PROFILE && !isSearching

  return (
    <div className='space-y-3'>
      {showProfileDocument && (
        <div className='flex items-center justify-between'>
          <p className='text-xs text-muted-foreground'>
            The profile layer is a markdown file — small enough to read in one
            glance.
          </p>
          <ProfileViewToggle view={profileView} onViewChange={setProfileView} />
        </div>
      )}
      {showProfileDocument && profileView === 'document' ? (
        <ProfileDocument
          items={items}
          onDelete={onDelete}
          onEdit={onEdit}
          savingId={savingId}
        />
      ) : (
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <MemoryCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              onEdit={onEdit}
              saving={savingId === item.id}
              showScore={showScores}
              onCategoryClick={onCategoryClick}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}

export default MemoryFeed
