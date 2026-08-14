/**
 * MemoryLayerCards
 *
 * Overview strip of the memory layers. The three memory buckets show live
 * counts and act as feed filters; the fourth slot is the Sessions layer —
 * the conversation transcript itself, which is searched, not extracted.
 */
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MemoryType } from '@/redux/types/memory'
import { MEMORY_LAYERS, SESSIONS_LAYER } from './layers'

interface Props {
  countsByType: Record<string, number>
  selectedLayer: MemoryType | null
  onSelectLayer: (layer: MemoryType | null) => void
  /** Sessions is a layer like the others now: selecting it switches the
   *  search surface below into transcript mode. */
  sessionsSelected: boolean
  onSelectSessions: (selected: boolean) => void
}

const cardMotion = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, delay: index * 0.05 },
})

const MemoryLayerCards = ({
  countsByType,
  selectedLayer,
  onSelectLayer,
  sessionsSelected,
  onSelectSessions,
}: Props) => {
  const SessionsIcon = SESSIONS_LAYER.icon

  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {MEMORY_LAYERS.map((layer, index) => {
        const Icon = layer.icon
        const isSelected = selectedLayer === layer.type
        const count = countsByType[layer.type] ?? 0

        return (
          <motion.button
            key={layer.type}
            type='button'
            {...cardMotion(index)}
            onClick={() => onSelectLayer(isSelected ? null : layer.type)}
            aria-pressed={isSelected}
            className={cn(
              'group flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-all',
              'hover:border-foreground/20 hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'border-foreground/30 ring-1 ring-foreground/20'
                : 'border-border'
            )}
          >
            <div className='flex items-start justify-between'>
              <div className={cn('rounded-lg p-2', layer.tile)}>
                <Icon className={cn('h-5 w-5', layer.iconColor)} />
              </div>
              <span className='text-2xl font-semibold tracking-tight tabular-nums'>
                {count}
              </span>
            </div>

            <div className='mt-3 flex items-baseline justify-between gap-2'>
              <span className='text-sm font-semibold'>{layer.label}</span>
              <span className='text-[11px] tracking-wide text-muted-foreground uppercase'>
                {layer.kind}
              </span>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>{layer.blurb}</p>
            <p className='mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground/80 italic'>
              {layer.fetchedBy}
            </p>
          </motion.button>
        )
      })}

      {/* Sessions — the transcript layer, searched rather than extracted */}
      <motion.button
        type='button'
        {...cardMotion(MEMORY_LAYERS.length)}
        onClick={() => onSelectSessions(!sessionsSelected)}
        aria-pressed={sessionsSelected}
        title='Search your conversations word for word'
        className={cn(
          'group flex flex-col rounded-xl border border-dashed bg-card/60 p-4 text-left shadow-xs transition-all',
          'hover:border-foreground/20 hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
          sessionsSelected
            ? 'border-foreground/30 ring-1 ring-foreground/20'
            : 'border-border'
        )}
      >
        <div className='flex items-start justify-between'>
          <div className={cn('rounded-lg p-2', SESSIONS_LAYER.tile)}>
            <SessionsIcon className={cn('h-5 w-5', SESSIONS_LAYER.iconColor)} />
          </div>
          <span className='font-mono text-sm font-medium text-muted-foreground'>
            FTS
          </span>
        </div>

        <div className='mt-3 flex items-baseline justify-between gap-2'>
          <span className='text-sm font-semibold'>{SESSIONS_LAYER.label}</span>
          <span className='text-[11px] tracking-wide text-muted-foreground uppercase'>
            {SESSIONS_LAYER.kind}
          </span>
        </div>
        <p className='mt-1 text-xs text-muted-foreground'>
          {SESSIONS_LAYER.blurb}
        </p>
        <p className='mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground/80 italic'>
          {SESSIONS_LAYER.fetchedBy}
        </p>
      </motion.button>
    </div>
  )
}

export default MemoryLayerCards
