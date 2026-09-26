import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SourcesNavItemProps {
  icon: LucideIcon
  label: string
  active: boolean
  count?: number
  onSelect: () => void
}

const SourcesNavItem = ({
  icon: Icon,
  label,
  active,
  count,
  onSelect,
}: SourcesNavItemProps) => (
  <button
    type='button'
    aria-current={active ? 'page' : undefined}
    onClick={onSelect}
    className={cn(
      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      active
        ? 'bg-primary/10 font-medium text-primary'
        : 'text-foreground hover:bg-accent'
    )}
  >
    <Icon className='h-4 w-4 shrink-0' />
    <span className='truncate'>{label}</span>
    {count !== undefined && (
      <span className='ml-auto text-xs text-muted-foreground tabular-nums'>
        {count}
      </span>
    )}
  </button>
)

export default SourcesNavItem
