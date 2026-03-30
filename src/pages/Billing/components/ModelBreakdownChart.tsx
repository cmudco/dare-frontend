import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EnergyModelBreakdown } from '@/redux/types/billing'
import { formatEnergy } from '@/utils/energyFormatUtils'
import { getProviderChartColor } from '@/utils/energyFormatUtils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { BarChart3 } from 'lucide-react'

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
    <div className='rounded-lg border bg-white px-3 py-2 shadow-md dark:bg-gray-900'>
      <p className='text-sm font-semibold'>{data.name}</p>
      <p className='text-xs text-muted-foreground'>
        {formatEnergy(data.energyWh)} &middot; {data.messageCount} messages
      </p>
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
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <BarChart3 className='h-4 w-4' />
            Energy by Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!models.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <BarChart3 className='h-4 w-4' />
          Energy by Model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer
          width='100%'
          height={Math.max(200, chartData.length * 48)}
        >
          <BarChart
            data={chartData}
            layout='vertical'
            margin={{ left: 8, right: 24 }}
          >
            <XAxis type='number' hide />
            <YAxis
              type='category'
              dataKey='name'
              width={160}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey='energyWh' radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ModelBreakdownChart
