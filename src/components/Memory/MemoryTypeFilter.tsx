/**
 * MemoryTypeFilter Component
 *
 * Filter chips for filtering memories by type (Profile, Event, Knowledge, Behavior).
 */
import { Badge } from '@/components/ui/badge'
import { MemoryType } from '@/redux/types/memory'

interface MemoryTypeFilterProps {
  selectedType: string | null // null = all
  onTypeSelect: (type: string | null) => void
}

const TYPE_CONFIG = [
  {
    type: null,
    label: 'All',
    activeClass: 'bg-dare text-white border-dare',
  },
  {
    type: MemoryType.PROFILE,
    label: 'Profile',
    activeClass: 'bg-blue-500 text-white border-blue-500',
    inactiveClass: 'text-blue-500 border-blue-500/50 hover:bg-blue-500/10',
  },
  {
    type: MemoryType.EVENT,
    label: 'Event',
    activeClass: 'bg-orange-500 text-white border-orange-500',
    inactiveClass:
      'text-orange-500 border-orange-500/50 hover:bg-orange-500/10',
  },
  {
    type: MemoryType.KNOWLEDGE,
    label: 'Knowledge',
    activeClass: 'bg-green-500 text-white border-green-500',
    inactiveClass: 'text-green-500 border-green-500/50 hover:bg-green-500/10',
  },
  {
    type: MemoryType.BEHAVIOR,
    label: 'Behavior',
    activeClass: 'bg-purple-500 text-white border-purple-500',
    inactiveClass:
      'text-purple-500 border-purple-500/50 hover:bg-purple-500/10',
  },
]

const MemoryTypeFilter = ({
  selectedType,
  onTypeSelect,
}: MemoryTypeFilterProps) => {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className='mr-1 text-sm text-muted-foreground'>Filter:</span>
      {TYPE_CONFIG.map((config) => {
        const isActive = selectedType === config.type
        return (
          <Badge
            key={config.label}
            variant='outline'
            className={`cursor-pointer transition-all ${
              isActive
                ? config.activeClass
                : config.inactiveClass ||
                  'text-muted-foreground hover:bg-accent'
            }`}
            onClick={() => onTypeSelect(config.type)}
          >
            {config.label}
          </Badge>
        )
      })}
    </div>
  )
}

export default MemoryTypeFilter
