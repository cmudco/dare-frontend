import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

/**
 * Chart configuration interface matching the backend chart_tool.py output
 */
interface ChartConfig {
  chart_type: 'bar' | 'line' | 'pie' | 'area'
  title: string
  data: Record<string, unknown>[]
  dataKeys: string[]
  xAxisKey: string
  colors?: string[]
  xAxisLabel?: string
  yAxisLabel?: string
}

interface RechartsBlockProps {
  /** JSON string of chart configuration */
  config: string
  /** Callback when chart is rendered */
  onRendered?: () => void
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c43',
  '#a4de6c',
  '#d0ed57',
  '#83a6ed',
  '#8dd1e1',
]

/**
 * RechartsBlock - Renders a recharts visualization from JSON config
 *
 * Used by ArtifactContent to render ```recharts code blocks
 */
export const RechartsBlock: React.FC<RechartsBlockProps> = ({
  config,
  onRendered,
}) => {
  const chartConfig = useMemo<ChartConfig | null>(() => {
    try {
      const parsed = JSON.parse(config)
      // Validate required fields
      if (
        !parsed.chart_type ||
        !parsed.data ||
        !parsed.dataKeys ||
        !parsed.xAxisKey
      ) {
        console.error('Invalid chart config: missing required fields')
        return null
      }
      return parsed as ChartConfig
    } catch (error) {
      console.error('Failed to parse chart config:', error)
      return null
    }
  }, [config])

  React.useEffect(() => {
    if (chartConfig) {
      onRendered?.()
    }
  }, [chartConfig, onRendered])

  if (!chartConfig) {
    return (
      <div className='my-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
        <p className='text-red-600 dark:text-red-400'>
          Failed to render chart: Invalid configuration
        </p>
        <pre className='mt-2 overflow-auto text-xs text-gray-600 dark:text-gray-400'>
          {config}
        </pre>
      </div>
    )
  }

  const {
    chart_type,
    title,
    data,
    dataKeys,
    xAxisKey,
    colors,
    xAxisLabel,
    yAxisLabel,
  } = chartConfig
  const chartColors = colors || DEFAULT_COLORS

  const renderChart = () => {
    switch (chart_type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey={xAxisKey}
              label={
                xAxisLabel
                  ? { value: xAxisLabel, position: 'insideBottom', offset: -5 }
                  : undefined
              }
            />
            <YAxis
              label={
                yAxisLabel
                  ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                  : undefined
              }
            />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                name={key}
              />
            ))}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey={xAxisKey}
              label={
                xAxisLabel
                  ? { value: xAxisLabel, position: 'insideBottom', offset: -5 }
                  : undefined
              }
            />
            <YAxis
              label={
                yAxisLabel
                  ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                  : undefined
              }
            />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type='monotone'
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                name={key}
              />
            ))}
          </LineChart>
        )

      case 'pie': {
        // For pie charts, use the first dataKey as the value
        const pieDataKey = dataKeys[0]
        return (
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              outerRadius={100}
              dataKey={pieDataKey}
              nameKey={xAxisKey}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      }

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey={xAxisKey}
              label={
                xAxisLabel
                  ? { value: xAxisLabel, position: 'insideBottom', offset: -5 }
                  : undefined
              }
            />
            <YAxis
              label={
                yAxisLabel
                  ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                  : undefined
              }
            />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type='monotone'
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                fillOpacity={0.6}
                name={key}
              />
            ))}
          </AreaChart>
        )

      default:
        return (
          <div className='text-gray-500'>Unknown chart type: {chart_type}</div>
        )
    }
  }

  return (
    <div className='my-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      {title && (
        <h3 className='mb-3 text-center text-lg font-semibold text-gray-900 dark:text-white'>
          {title}
        </h3>
      )}
      <ResponsiveContainer width='100%' height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

export default RechartsBlock
