import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RelatableStats } from '@/redux/types/billing'
import {
  formatPhoneBattery,
  formatSearches,
  formatDuration,
  formatEvDistance,
} from '@/utils/energyFormatUtils'
import { motion } from 'framer-motion'

interface RelatableStatsGridProps {
  stats: RelatableStats | null
}

const relatableItems = [
  {
    key: 'phone',
    emoji: '📱',
    bgColor: 'bg-slate-500/10',
    label: 'iPhone charge',
    format: (s: RelatableStats) => formatPhoneBattery(s.phoneBatteryPct),
  },
  {
    key: 'search',
    emoji: '🔍',
    bgColor: 'bg-blue-500/10',
    label: 'Google searches',
    format: (s: RelatableStats) => formatSearches(s.googleSearchesEquiv),
  },
  {
    key: 'led',
    emoji: '💡',
    bgColor: 'bg-yellow-500/10',
    label: 'LED bulb',
    format: (s: RelatableStats) => formatDuration(s.ledBulbSeconds),
  },
  {
    key: 'netflix',
    emoji: '🎬',
    bgColor: 'bg-red-500/10',
    label: 'Netflix streaming',
    format: (s: RelatableStats) => formatDuration(s.netflixSeconds),
  },
  {
    key: 'ev',
    emoji: '🚗',
    bgColor: 'bg-green-500/10',
    label: 'EV driving',
    format: (s: RelatableStats) => formatEvDistance(s.evMeters),
  },
  {
    key: 'fridge',
    emoji: '🧊',
    bgColor: 'bg-cyan-500/10',
    label: 'Fridge running',
    format: (s: RelatableStats) => formatDuration(s.fridgeSeconds),
  },
  {
    key: 'thinking',
    emoji: '🧠',
    bgColor: 'bg-purple-500/10',
    label: 'Human thinking',
    format: (s: RelatableStats) => formatDuration(s.humanThinkingSeconds),
  },
] as const

const RelatableStatsGrid: React.FC<RelatableStatsGridProps> = ({ stats }) => {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7'>
      {relatableItems.map(({ key, emoji, bgColor, label, format }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className='group h-full border-slate-200/50 bg-white/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-lg dark:border-slate-800/50 dark:bg-slate-900/40 dark:hover:bg-slate-900/90'>
            <CardContent className='flex flex-col items-center justify-center p-4 text-center'>
              <div
                className={`mb-3 flex items-center justify-center rounded-xl p-2.5 text-2xl transition-transform duration-300 group-hover:scale-125 ${bgColor}`}
              >
                {emoji}
              </div>
              <div className='space-y-1'>
                {!stats ? (
                  <Skeleton className='mx-auto mb-1 h-5 w-16' />
                ) : (
                  <p className='text-sm font-black tracking-tight text-slate-900 dark:text-slate-100'>
                    {format(stats)}
                  </p>
                )}
                <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-muted-foreground'>
                  {label}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default RelatableStatsGrid
