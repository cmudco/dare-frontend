import { Library, Check, Plus, Clock, Cpu, Globe, Lock } from 'lucide-react'
import { Button } from '../ui/button'
import { SharedLibrary } from '@/redux/types/library'

interface SharedLibraryCardProps {
  library: SharedLibrary
  onToggleAdd: (id: number) => void
}

const SharedLibraryCard: React.FC<SharedLibraryCardProps> = ({
  library,
  onToggleAdd,
}) => {
  const { isAvailable, isAdded } = library

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-border bg-card p-4 ${
        isAvailable ? '' : 'opacity-60'
      }`}
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
          {isAvailable ? (
            <Library className='h-5 w-5' />
          ) : (
            <Clock className='h-5 w-5' />
          )}
        </div>
        <div className='min-w-0'>
          <h3 className='truncate text-sm font-medium text-foreground'>
            {library.name}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {isAvailable
              ? `Curated by ${library.curator} · read-only`
              : 'Coming soon'}
          </p>
        </div>
      </div>

      {isAvailable && (
        <p className='line-clamp-2 text-sm text-muted-foreground'>
          {library.description}
        </p>
      )}

      <div className='mt-auto flex flex-wrap gap-1.5'>
        {isAvailable ? (
          <>
            <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              <Cpu className='h-3 w-3' />
              {library.embeddingModel} · {library.dims}d
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              <Globe className='h-3 w-3' />
              shared
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              <Lock className='h-3 w-3' />
              read-only
            </span>
          </>
        ) : (
          <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
            <Clock className='h-3 w-3' />
            Not yet available
          </span>
        )}
      </div>

      {isAvailable && (
        <Button
          variant={isAdded ? 'outline' : 'default'}
          size='sm'
          className='w-full'
          onClick={() => onToggleAdd(library.id)}
        >
          {isAdded ? (
            <>
              <Check className='mr-1 h-4 w-4' />
              In your library
            </>
          ) : (
            <>
              <Plus className='mr-1 h-4 w-4' />
              Add to library
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default SharedLibraryCard
