import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RelatableStats } from '@/redux/types/billing'
import {
  formatPhoneBattery,
  formatSearches,
  formatDuration,
} from '@/utils/energyFormatUtils'
import {
  Smartphone,
  Search,
  Lightbulb,
  Tv,
  Car,
  Thermometer,
  Brain,
} from 'lucide-react'

interface RelatableStatsGridProps {
  stats: RelatableStats | null
  loading: boolean
}

const relatableItems = [
  {
    key: 'phone',
    icon: Smartphone,
    iconColor: 'text-slate-600 dark:text-slate-300',
    label: 'iPhone charge',
    format: (s: RelatableStats) => formatPhoneBattery(s.phoneBatteryPct),
  },
  {
    key: 'search',
    icon: Search,
    iconColor: 'text-blue-500',
    label: 'Google searches',
    format: (s: RelatableStats) => formatSearches(s.googleSearchesEquiv),
  },
  {
    key: 'led',
    icon: Lightbulb,
    iconColor: 'text-yellow-500',
    label: 'LED bulb',
    format: (s: RelatableStats) => formatDuration(s.ledBulbSeconds),
  },
  {
    key: 'netflix',
    icon: Tv,
    iconColor: 'text-red-500',
    label: 'Netflix streaming',
    format: (s: RelatableStats) => formatDuration(s.netflixSeconds),
  },
  {
    key: 'ev',
    icon: Car,
    iconColor: 'text-green-500',
    label: 'EV driving',
    format: (s: RelatableStats) =>
      s.evMeters >= 1000
        ? `${(s.evMeters / 1000).toFixed(2)} km`
        : `${s.evMeters.toFixed(1)} meters`,
  },
  {
    key: 'fridge',
    icon: Thermometer,
    iconColor: 'text-cyan-500',
    label: 'Fridge running',
    format: (s: RelatableStats) => formatDuration(s.fridgeSeconds),
  },
  {
    key: 'thinking',
    icon: Brain,
    iconColor: 'text-purple-500',
    label: 'Human thinking',
    format: (s: RelatableStats) => formatDuration(s.humanThinkingSeconds),
  },
] as const

const RelatableStatsGrid: React.FC<RelatableStatsGridProps> = ({
  stats,
  loading,
}) => {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
      {relatableItems.map(({ key, icon: Icon, iconColor, label, format }) => (
        <Card key={key} className='transition-shadow hover:shadow-md'>
          <CardContent className='flex flex-col items-center p-4 text-center'>
            <Icon className={`mb-2 h-6 w-6 ${iconColor}`} />
            {loading || !stats ? (
              <Skeleton className='mb-1 h-5 w-16' />
            ) : (
              <p className='text-sm font-semibold'>{format(stats)}</p>
            )}
            <p className='text-xs text-muted-foreground'>{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default RelatableStatsGrid
