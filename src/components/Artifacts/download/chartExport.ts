import { escapeSvg } from './svgExport'

type ChartExportType = 'bar' | 'line' | 'pie' | 'area'
type ChartCellValue = string | number | undefined

interface ChartExportDataPoint {
  label?: string
  value?: number
  color?: string
  [key: string]: ChartCellValue
}

interface ChartExportConfig {
  chart_type?: ChartExportType
  type?: ChartExportType
  title?: string
  data?: ChartExportDataPoint[]
  dataKeys?: string[]
  xAxisKey?: string
  colors?: string[]
  xAxisLabel?: string
  yAxisLabel?: string
}

interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

const EXPORT_CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c43',
  '#a4de6c',
  '#d0ed57',
  '#83a6ed',
  '#8dd1e1',
]

export function generateChartSvg(content: string) {
  const config = JSON.parse(content) as ChartExportConfig
  const chartType = config.chart_type || config.type || 'bar'
  const data = Array.isArray(config.data) ? config.data : []
  const dataKeys = Array.isArray(config.dataKeys) ? config.dataKeys : []
  const xAxisKey = config.xAxisKey

  if (!data.length || !dataKeys.length || !xAxisKey) {
    throw new Error('Chart config is missing required data')
  }

  if (chartType === 'pie') {
    return generatePieChartSvg(config, data, dataKeys[0], xAxisKey)
  }

  return generateCartesianChartSvg(config, data, dataKeys, xAxisKey, chartType)
}

function generateCartesianChartSvg(
  config: ChartExportConfig,
  data: ChartExportDataPoint[],
  dataKeys: string[],
  xAxisKey: string,
  chartType: Exclude<ChartExportType, 'pie'>
) {
  const width = 1200
  const height = 780
  const margin = { top: 96, right: 56, bottom: 118, left: 112 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const colors = config.colors?.length ? config.colors : EXPORT_CHART_COLORS
  const values = data.flatMap((row) =>
    dataKeys.map((key) => getNumericValue(row[key]))
  )
  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(...values)
  const yMax = maxValue === minValue ? maxValue + 1 : maxValue
  const yMin = maxValue === minValue ? 0 : minValue
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth
  const barGroupWidth = Math.min(64, (plotWidth / data.length) * 0.68)
  const barWidth = barGroupWidth / Math.max(dataKeys.length, 1)
  const yTicks = createTicks(yMin, yMax, 5)
  const xForIndex = (index: number) =>
    margin.left + (data.length > 1 ? index * xStep : plotWidth / 2)
  const yForValue = (value: number) =>
    margin.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight

  let body = ''
  body += yTicks
    .map((tick) => {
      const y = yForValue(tick)
      return `
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#d1d5db" stroke-dasharray="4 5" />
        <text x="${margin.left - 14}" y="${y + 5}" text-anchor="end" class="axis-text">${formatChartValue(tick)}</text>
      `
    })
    .join('')

  body += data
    .map((row, index) => {
      const x = xForIndex(index)
      const label = escapeSvg(String(row[xAxisKey] ?? ''))
      const rotation =
        data.length > 8 ? ` transform="rotate(-35 ${x} ${height - 78})"` : ''
      return `
        <line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotHeight}" stroke="#d1d5db" stroke-dasharray="4 5" />
        <text x="${x}" y="${height - 78}" text-anchor="${data.length > 8 ? 'end' : 'middle'}" class="axis-text"${rotation}>${label}</text>
      `
    })
    .join('')

  body += `
    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" stroke="#4b5563" />
    <line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" stroke="#4b5563" />
  `

  if (chartType === 'bar') {
    body += data
      .flatMap((row, index) =>
        dataKeys.map((key, keyIndex) => {
          const value = getNumericValue(row[key])
          const x =
            xForIndex(index) -
            barGroupWidth / 2 +
            keyIndex * barWidth +
            barWidth * 0.08
          const y = yForValue(Math.max(value, 0))
          const zeroY = yForValue(0)
          const barHeight = Math.abs(zeroY - y)
          const color = getSeriesColor(row, colors, keyIndex)
          return `<rect x="${x}" y="${Math.min(y, zeroY)}" width="${barWidth * 0.84}" height="${barHeight}" fill="${color}" rx="3" />`
        })
      )
      .join('')
  } else {
    dataKeys.forEach((key, keyIndex) => {
      const color = getSeriesColor(data[0], colors, keyIndex)
      const points = data
        .map(
          (row, index) =>
            `${xForIndex(index)},${yForValue(getNumericValue(row[key]))}`
        )
        .join(' ')

      if (chartType === 'area') {
        const baseline = yForValue(0)
        const areaPoints = `${margin.left},${baseline} ${points} ${xForIndex(data.length - 1)},${baseline}`
        body += `<polygon points="${areaPoints}" fill="${color}" opacity="0.25" />`
      }

      body += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />`
      body += data
        .map((row, index) => {
          const x = xForIndex(index)
          const y = yForValue(getNumericValue(row[key]))
          return `<circle cx="${x}" cy="${y}" r="5" fill="#ffffff" stroke="${color}" stroke-width="4" />`
        })
        .join('')
    })
  }

  body += createLegend(dataKeys, colors, width, height)
  body += createAxisLabels(config, width, height, margin)

  return wrapChartSvg(config.title, width, height, body)
}

function generatePieChartSvg(
  config: ChartExportConfig,
  data: ChartExportDataPoint[],
  dataKey: string,
  xAxisKey: string
) {
  const width = 900
  const height = 720
  const colors = config.colors?.length ? config.colors : EXPORT_CHART_COLORS
  const centerX = width / 2
  const centerY = 370
  const radius = 210
  const total = data.reduce(
    (sum, row) => sum + getNumericValue(row[dataKey]),
    0
  )
  let startAngle = -90
  let body = ''

  data.forEach((row, index) => {
    const value = getNumericValue(row[dataKey])
    const angle = total > 0 ? (value / total) * 360 : 0
    const endAngle = startAngle + angle
    const color = getSeriesColor(row, colors, index)
    body += describePieSlice(
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      color
    )
    startAngle = endAngle
  })

  body += data
    .map((row, index) => {
      const x = 80 + (index % 2) * 380
      const y = 620 + Math.floor(index / 2) * 28
      return `
        <rect x="${x}" y="${y - 12}" width="18" height="18" fill="${getSeriesColor(row, colors, index)}" rx="3" />
        <text x="${x + 28}" y="${y + 3}" class="legend-text">${escapeSvg(String(row[xAxisKey] ?? `Item ${index + 1}`))}</text>
      `
    })
    .join('')

  return wrapChartSvg(config.title, width, height, body)
}

function wrapChartSvg(
  title: string | undefined,
  width: number,
  height: number,
  body: string
) {
  const titleMarkup = title
    ? `<text x="${width / 2}" y="42" text-anchor="middle" class="title">${escapeSvg(title)}</text>`
    : ''

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        .title { fill: #111827; font: 700 28px Arial, sans-serif; }
        .axis-text { fill: #4b5563; font: 18px Arial, sans-serif; }
        .legend-text { fill: #4b5563; font: 18px Arial, sans-serif; }
        .axis-label { fill: #8884d8; font: 700 20px Arial, sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="#ffffff" />
      ${titleMarkup}
      ${body}
    </svg>
  `.trim()
}

function createLegend(
  dataKeys: string[],
  colors: string[],
  width: number,
  height: number
) {
  const totalWidth = dataKeys.reduce(
    (sum, key) => sum + key.length * 10 + 48,
    0
  )
  let cursorX = Math.max(32, (width - totalWidth) / 2)

  return dataKeys
    .map((key, index) => {
      const x = cursorX
      cursorX += key.length * 10 + 48
      return `
        <line x1="${x}" y1="${height - 28}" x2="${x + 26}" y2="${height - 28}" stroke="${colors[index % colors.length]}" stroke-width="4" />
        <circle cx="${x + 13}" cy="${height - 28}" r="4" fill="#ffffff" stroke="${colors[index % colors.length]}" stroke-width="4" />
        <text x="${x + 34}" y="${height - 23}" class="legend-text">${escapeSvg(key)}</text>
      `
    })
    .join('')
}

function createAxisLabels(
  config: ChartExportConfig,
  width: number,
  height: number,
  margin: ChartMargin
) {
  let labels = ''
  if (config.xAxisLabel) {
    labels += `<text x="${width / 2}" y="${height - 48}" text-anchor="middle" class="axis-label">${escapeSvg(config.xAxisLabel)}</text>`
  }
  if (config.yAxisLabel) {
    const y = margin.top + (height - margin.top - margin.bottom) / 2
    labels += `<text x="30" y="${y}" text-anchor="middle" class="axis-label" transform="rotate(-90 30 ${y})">${escapeSvg(config.yAxisLabel)}</text>`
  }
  return labels
}

function describePieSlice(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return `
    <path d="M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z" fill="${color}" stroke="#ffffff" stroke-width="2" />
  `
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function getSeriesColor(
  row: ChartExportDataPoint,
  colors: string[],
  index: number
) {
  return typeof row.color === 'string'
    ? row.color
    : colors[index % colors.length]
}

function getNumericValue(value: ChartCellValue) {
  const numberValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function createTicks(minValue: number, maxValue: number, count: number) {
  const step = (maxValue - minValue) / Math.max(count - 1, 1)
  return Array.from({ length: count }, (_, index) => minValue + step * index)
}

function formatChartValue(value: number) {
  return Math.abs(value) >= 1000
    ? Math.round(value).toLocaleString()
    : `${value}`
}
