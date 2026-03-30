import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EnergyOverallStats } from '@/redux/types/billing'
import {
  formatEnergy,
  formatCarbon,
  formatWater,
} from '@/utils/energyFormatUtils'
import { Zap, Leaf, Droplets, MessageSquare } from 'lucide-react'

interface EnergyOverviewCardsProps {
  stats: EnergyOverallStats | null
  loading: boolean
}

const cards = [
  {
    key: 'energy',
    label: 'Total Energy',
    icon: Zap,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    getValue: (s: EnergyOverallStats) => formatEnergy(s.totalEnergyWh),
  },
  {
    key: 'carbon',
    label: 'Carbon Footprint',
    icon: Leaf,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    getValue: (s: EnergyOverallStats) => formatCarbon(s.totalCarbonG),
  },
  {
    key: 'water',
    label: 'Water Usage',
    icon: Droplets,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    getValue: (s: EnergyOverallStats) => formatWater(s.totalWaterMl),
  },
  {
    key: 'messages',
    label: 'AI Messages',
    icon: MessageSquare,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    getValue: (s: EnergyOverallStats) => s.messageCount.toLocaleString(),
  },
] as const

const EnergyOverviewCards: React.FC<EnergyOverviewCardsProps> = ({
  stats,
  loading,
}) => {
  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {cards.map(({ key, label, icon: Icon, iconColor, bgColor, getValue }) => (
        <Card key={key}>
          <CardContent className='flex items-center gap-3 p-4'>
            <div className={`rounded-lg p-2.5 ${bgColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs text-muted-foreground'>{label}</p>
              {loading || !stats ? (
                <Skeleton className='mt-1 h-5 w-20' />
              ) : (
                <p className='truncate text-lg font-semibold'>
                  {getValue(stats)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default EnergyOverviewCards
