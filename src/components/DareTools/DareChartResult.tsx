/**
 * DareChartResult Component
 *
 * Renders charts from DARE tool call results using Recharts.
 * Designed for inline rendering inside message bubbles.
 * Supports bar, line, area, pie, and doughnut chart types.
 */

import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartConfig } from '@/redux/types/dareToolResults'

interface DareChartResultProps {
  chartConfig: ChartConfig
  className?: string
}

// Default color palette for charts
const defaultColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
  '#6366f1', // indigo
]

// Custom tooltip styling
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm shadow-lg'>
        <p className='text-gray-300'>{label}</p>
        <p className='font-medium text-white'>{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export const DareChartResult: React.FC<DareChartResultProps> = ({
  chartConfig,
  className = '',
}) => {
  const { type, title, data, options = {} } = chartConfig

  // Transform data for Recharts format with colors
  const chartData = data.map((d, i) => ({
    name: d.label,
    value: d.value,
    fill: d.color || defaultColors[i % defaultColors.length],
  }))

  const renderChart = () => {
    const commonAxisProps = {
      tick: { fill: '#9ca3af', fontSize: 12 },
      axisLine: { stroke: '#4b5563' },
      tickLine: { stroke: '#4b5563' },
    }

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width='100%' height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='name' {...commonAxisProps} />
              <YAxis {...commonAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              {options.showLegend && (
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
              )}
              <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width='100%' height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='name' {...commonAxisProps} />
              <YAxis {...commonAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              {options.showLegend && (
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
              )}
              <Line
                type='monotone'
                dataKey='value'
                stroke={defaultColors[0]}
                strokeWidth={2}
                dot={{ fill: defaultColors[0], strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width='100%' height={250}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='name' {...commonAxisProps} />
              <YAxis {...commonAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              {options.showLegend && (
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
              )}
              <Area
                type='monotone'
                dataKey='value'
                stroke={defaultColors[0]}
                fill={`${defaultColors[0]}40`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width='100%' height={250}>
            <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={type === 'doughnut' ? 50 : 0}
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#9ca3af' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {options.showLegend && (
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
              )}
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        // Default to bar chart
        return (
          <ResponsiveContainer width='100%' height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='name' {...commonAxisProps} />
              <YAxis {...commonAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div
      className={`not-prose my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
    >
      {/* Chart title */}
      <h4 className='mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200'>
        {title}
      </h4>
      {/* Chart container */}
      {renderChart()}
    </div>
  )
}

export default DareChartResult
