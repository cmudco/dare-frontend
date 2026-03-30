import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EnergyModelBreakdown } from '@/redux/types/billing'
import { formatEnergy, getProviderChartColor } from '@/utils/energyFormatUtils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface ModelBreakdownChartProps {
  models: EnergyModelBreakdown[]
  loading: boolean
}

interface ChartDataItem {
  name: string
  energyWh: number
  messageCount: number
  provider: string
  fill: string
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: ChartDataItem }[]
}) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className='rounded-xl border border-slate-200/50 bg-white/95 p-3 shadow-xl backdrop-blur-md transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800/50 dark:bg-slate-900/95'>
      <div className='mb-1.5 flex items-center gap-2'>
        <div
          className='h-2 w-2 rounded-full'
          style={{ backgroundColor: data.fill }}
        />
        <p className='text-sm font-black tracking-tight text-slate-900 dark:text-slate-100'>
          {data.name}
        </p>
      </div>
      <div className='space-y-1'>
        <div className='flex items-center justify-between gap-4'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
            Energy
          </p>
          <p className='text-xs font-bold text-slate-800 dark:text-slate-200'>
            {formatEnergy(data.energyWh)}
          </p>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
            Messages
          </p>
          <p className='text-xs font-bold text-slate-800 dark:text-slate-200'>
            {data.messageCount}
          </p>
        </div>
      </div>
    </div>
  )
}

const ModelBreakdownChart: React.FC<ModelBreakdownChartProps> = ({
  models,
  loading,
}) => {
  const chartData = useMemo(() => {
    return [...models]
      .sort((a, b) => b.energyWh - a.energyWh)
      .map((m) => ({
        name: m.llmName,
        energyWh: m.energyWh,
        messageCount: m.messageCount,
        provider: m.llmProvider,
        fill: getProviderChartColor(m.llmProvider),
      }))
  }, [models])

  if (loading) {
    return (
      <Card className='border-slate-200/50 dark:border-slate-800/50'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg font-bold'>
              <div className='rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'>
                <BarChart3 className='h-5 w-5' />
              </div>
              Energy Breakdown by Model
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full rounded-xl' />
        </CardContent>
      </Card>
    )
  }

  if (!models.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className='group relative overflow-hidden border-slate-200/50 bg-white/40 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900/40'>
        <div className='pointer-events-none absolute right-0 top-0 p-8 opacity-[0.02] transition-opacity group-hover:opacity-[0.04]'>
          <TrendingUp className='h-24 w-24' />
        </div>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <CardTitle className='flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100'>
                <div className='rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'>
                  <BarChart3 className='h-5 w-5' />
                </div>
                Energy Consumption by Model
              </CardTitle>
              <CardDescription className='pl-11 text-xs font-medium'>
                Visualizing the energy footprint of each large language model
                integrated with DARE.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <ResponsiveContainer
            width='100%'
            height={Math.max(200, chartData.length * 52)}
          >
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{ left: -20, right: 40, top: 0, bottom: 0 }}
            >
              <XAxis type='number' hide />
              <YAxis
                type='category'
                dataKey='name'
                width={180}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-10}
                      y={4}
                      fill='currentColor'
                      className='text-xs font-bold text-slate-600 dark:text-slate-400'
                      textAnchor='end'
                    >
                      {payload.value}
                    </text>
                  </g>
                )}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey='energyWh' radius={[0, 10, 10, 0]} barSize={28}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.fill}
                    fillOpacity={0.85}
                    className='hover:fill-opacity-100 cursor-pointer transition-all duration-300'
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ModelBreakdownChart
