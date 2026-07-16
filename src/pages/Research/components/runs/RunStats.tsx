import { formatTokens } from '../../runFormat'
import type { AgentRun } from '../../types'

// The summary tiles above the runs list: totals across every delegated run.
const RunStats = ({ runs }: { runs: AgentRun[] }) => {
  const totalTokens = runs.reduce(
    (sum, r) => sum + (r.usage?.totalTokens ?? 0),
    0
  )
  const totalCalls = runs.reduce((sum, r) => sum + r.toolCalls.length, 0)
  const measured = runs.filter((r) => (r.usage?.totalTokens ?? 0) > 0)
  const avgTokens = measured.length
    ? Math.round(totalTokens / measured.length)
    : 0
  const stats = [
    { label: 'Runs', value: String(runs.length) },
    { label: 'Total tokens', value: formatTokens(totalTokens) },
    { label: 'Tool calls', value: String(totalCalls) },
    { label: 'Avg tokens / run', value: formatTokens(avgTokens) },
  ]
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {stats.map((s) => (
        <div
          key={s.label}
          className='rounded-xl border border-border bg-card px-4 py-3'
        >
          <p className='text-lg font-semibold tracking-tight tabular-nums'>
            {s.value}
          </p>
          <p className='text-xs text-muted-foreground'>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export default RunStats
