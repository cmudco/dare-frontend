import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EnergyOverallStats } from '@/redux/types/billing'
import {
  formatEnergy,
  formatCarbon,
  formatWater,
} from '@/utils/energyFormatUtils'
import { motion } from 'framer-motion'

interface EnergyOverviewCardsProps {
  stats: EnergyOverallStats | null
}

const cards = [
  {
    key: 'energy',
    label: 'Total Energy',
    emoji: '⚡',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-200/50',
    gradient: 'from-amber-500/10 to-transparent',
    getValue: (s: EnergyOverallStats) => formatEnergy(s.totalEnergyWh),
  },
  {
    key: 'carbon',
    label: 'Carbon Footprint',
    emoji: '🌍',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-200/50',
    gradient: 'from-emerald-500/10 to-transparent',
    getValue: (s: EnergyOverallStats) => formatCarbon(s.totalCarbonG),
  },
  {
    key: 'water',
    label: 'Water Usage',
    emoji: '💧',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-200/50',
    gradient: 'from-blue-500/10 to-transparent',
    getValue: (s: EnergyOverallStats) => formatWater(s.totalWaterMl),
  },
  {
    key: 'messages',
    label: 'AI Messages',
    emoji: '💬',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-200/50',
    gradient: 'from-purple-500/10 to-transparent',
    getValue: (s: EnergyOverallStats) => s.messageCount.toLocaleString(),
  },
] as const

const EnergyOverviewCards: React.FC<EnergyOverviewCardsProps> = ({ stats }) => {
  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {cards.map(
        (
          { key, label, emoji, bgColor, borderColor, gradient, getValue },
          index
        ) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`relative overflow-hidden border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/80 ${borderColor}`}
            >
              <div
                className={`absolute -right-4 -top-4 select-none text-6xl opacity-[0.05] transition-transform duration-500 hover:scale-110`}
              >
                {emoji}
              </div>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`}
              />

              <CardContent className='relative flex items-center gap-4 p-5'>
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-2xl p-3 shadow-inner ${bgColor} text-2xl transition-transform duration-300 group-hover:scale-110`}
                >
                  {emoji}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80'>
                    {label}
                  </p>
                  {!stats ? (
                    <Skeleton className='mt-1.5 h-7 w-24 rounded-md' />
                  ) : (
                    <div className='flex items-baseline gap-1'>
                      <p className='text-xl font-black tracking-tight text-slate-900 dark:text-slate-100'>
                        {getValue(stats)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className='absolute bottom-0 left-0 h-0.5 w-0 bg-slate-400/20 transition-all duration-300 group-hover:w-full' />
            </Card>
          </motion.div>
        )
      )}
    </div>
  )
}

export default EnergyOverviewCards
