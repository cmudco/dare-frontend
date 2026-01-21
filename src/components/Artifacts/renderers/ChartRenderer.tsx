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
 * Chart configuration interface matching the backend create_chart tool output
 */
interface ChartConfig {
  chart_type?: 'bar' | 'line' | 'pie' | 'area'
  type?: 'bar' | 'line' | 'pie' | 'area' // Alternative key name
  title?: string
  data: Record<string, unknown>[]
  dataKeys: string[]
  xAxisKey: string
  colors?: string[]
  xAxisLabel?: string
  yAxisLabel?: string
}

interface ChartRendererProps {
  /** Parsed chart configuration object */
  config: ChartConfig
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
 * ChartRenderer - Renders Recharts visualizations for artifact panel
 * Adapted from RechartsBlock for use in unified artifact system
 */
export const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  const chartConfig = useMemo<ChartConfig | null>(() => {
    try {
      // Validate required fields
      if (!config.data || !config.dataKeys || !config.xAxisKey) {
        console.error('Invalid chart config: missing required fields', config)
        return null
      }
      return config
    } catch (error) {
      console.error('Failed to process chart config:', error)
      return null
    }
  }, [config])

  if (!chartConfig) {
    return (
      <div className='flex h-full items-center justify-center p-8'>
        <div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
          <p className='text-red-600 dark:text-red-400'>
            Failed to render chart: Invalid configuration
          </p>
        </div>
      </div>
    )
  }

  const {
    chart_type,
    type,
    title,
    data,
    dataKeys,
    xAxisKey,
    colors,
    xAxisLabel,
    yAxisLabel,
  } = chartConfig

  const chartType = chart_type || type || 'bar'
  const chartColors = colors || DEFAULT_COLORS

  const renderChart = () => {
    switch (chartType) {
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
              outerRadius={120}
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
          <div className='flex h-full items-center justify-center text-gray-500'>
            Unknown chart type: {chartType}
          </div>
        )
    }
  }

  return (
    <div className='flex h-full flex-col p-4'>
      {title && (
        <h3 className='mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white'>
          {title}
        </h3>
      )}
      <div className='flex-1'>
        <ResponsiveContainer width='100%' height='100%'>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ChartRenderer
