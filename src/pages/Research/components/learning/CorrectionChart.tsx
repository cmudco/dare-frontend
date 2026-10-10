import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CorrectionPoint } from '@/redux/types/research'

interface Props {
  points: CorrectionPoint[]
}

const SERIES = [
  { key: 'rejected', label: 'Findings you rejected', color: 'var(--chart-1)' },
  { key: 'notes', label: 'Notes you had to write', color: 'var(--chart-2)' },
] as const

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CorrectionPoint & { label: string } }[]
}) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className='max-w-64 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-sm'>
      <p className='font-medium text-foreground'>{point.label}</p>
      <p className='mt-0.5 line-clamp-2 text-muted-foreground'>{point.task}</p>
      <p className='mt-1.5 text-foreground'>
        {point.rejected} of {point.decided} reviewed rejected · {point.notes}{' '}
        note{point.notes === 1 ? '' : 's'}
      </p>
      {(point.applied > 0 || point.setAside > 0) && (
        <p className='text-muted-foreground'>
          {point.applied} remembered preference
          {point.applied === 1 ? '' : 's'} applied · {point.setAside} set aside
        </p>
      )}
    </div>
  )
}

/** Every Scout run, including ones that staged nothing — the chart's table view. */
const RunTable = ({
  points,
  labelOf,
}: {
  points: CorrectionPoint[]
  labelOf: Map<number, string>
}) =>
  points.length === 0 ? null : (
    <table className='mt-4 w-full text-left text-xs'>
      <thead className='text-muted-foreground'>
        <tr className='border-b border-border'>
          <th className='py-1.5 font-medium'>Run</th>
          <th className='py-1.5 font-medium'>Task</th>
          <th className='py-1.5 text-right font-medium'>Staged</th>
          <th className='py-1.5 text-right font-medium'>Reviewed</th>
          <th className='py-1.5 text-right font-medium'>Rejected</th>
          <th className='py-1.5 text-right font-medium'>Notes</th>
        </tr>
      </thead>
      <tbody>
        {points.map((p) => (
          <tr key={p.runId} className='border-b border-border/60'>
            <td className='py-1.5 whitespace-nowrap'>{labelOf.get(p.runId)}</td>
            <td className='max-w-0 truncate py-1.5 pr-3 text-muted-foreground'>
              {p.task}
            </td>
            <td className='py-1.5 text-right tabular-nums'>{p.staged}</td>
            <td className='py-1.5 text-right tabular-nums'>{p.decided}</td>
            <td className='py-1.5 text-right tabular-nums'>{p.rejected}</td>
            <td className='py-1.5 text-right tabular-nums'>{p.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

/**
 * Corrections per Scout run, oldest first — the "is it getting better" line.
 * Both series count things the scholar had to do, so they share one axis.
 */
const CorrectionChart = ({ points }: Props) => {
  const reviewed = points.filter((p) => p.decided > 0)
  const labelOf = new Map(points.map((p, i) => [p.runId, `Run ${i + 1}`]))
  if (reviewed.length === 0) {
    return (
      <div className='space-y-3'>
        <p className='rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
          {points.length === 0
            ? 'No Scout runs yet. Each one you review becomes a point here.'
            : 'Nothing reviewed yet. Approve or reject findings from a Scout run and it becomes the first point.'}
        </p>
        <RunTable points={points} labelOf={labelOf} />
      </div>
    )
  }
  const data = reviewed.map((p) => ({
    ...p,
    label: labelOf.get(p.runId) ?? '',
  }))
  return (
    <div>
      <div className='mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground'>
        {SERIES.map((series) => (
          <span key={series.key} className='inline-flex items-center gap-1.5'>
            <span
              className='h-0.5 w-4 rounded-full'
              style={{ background: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>
      <div className='h-56'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data} margin={{ top: 8, right: 12, left: -16 }}>
            <CartesianGrid stroke='var(--border)' vertical={false} />
            <XAxis
              dataKey='label'
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'var(--border)' }}
            />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type='monotone'
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: series.color,
                  strokeWidth: 2,
                  stroke: 'var(--card)',
                }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {reviewed.length === 1 && (
        <p className='mt-1 text-xs text-muted-foreground'>
          One reviewed run so far — review findings from another Scout and the
          trend line appears.
        </p>
      )}
      <RunTable points={points} labelOf={labelOf} />
    </div>
  )
}

export default CorrectionChart
