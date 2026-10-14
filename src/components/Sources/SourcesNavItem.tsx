import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SourcesNavItemProps {
  icon: LucideIcon
  label: string
  active: boolean
  count?: number
  onSelect: () => void
  /** A menu shown in place of the count while the row is hovered or focused. */
  actions?: ReactNode
}

const SourcesNavItem = ({
  icon: Icon,
  label,
  active,
  count,
  onSelect,
  actions,
}: SourcesNavItemProps) => (
  <div className='group/nav relative'>
    <button
      type='button'
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        active
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-foreground hover:bg-accent',
        actions && 'pr-9'
      )}
    >
      <Icon className='h-4 w-4 shrink-0' />
      <span className='truncate'>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'ml-auto text-xs text-muted-foreground tabular-nums',
            actions &&
              'absolute right-2.5 group-focus-within/nav:invisible group-hover/nav:invisible'
          )}
        >
          {count}
        </span>
      )}
    </button>
    {actions && (
      <div className='absolute top-1/2 right-1 -translate-y-1/2'>{actions}</div>
    )}
  </div>
)

export default SourcesNavItem
