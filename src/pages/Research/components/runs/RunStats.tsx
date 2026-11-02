import { formatUsd } from '@/utils/wallets'
import type { AgentRun } from '../../types'

// The summary tiles above the runs list: totals across every delegated run.
const RunStats = ({ runs }: { runs: AgentRun[] }) => {
  const spent = runs.reduce((sum, r) => sum + Number(r.cost || 0), 0)
  const totalCalls = runs.reduce((sum, r) => sum + r.toolCallCount, 0)
  const priced = runs.filter((r) => Number(r.cost || 0) > 0)
  const stats = [
    { label: 'Runs', value: String(runs.length) },
    { label: 'Spent', value: formatUsd(String(spent)) },
    { label: 'Tool calls', value: String(totalCalls) },
    {
      label: 'Avg per run',
      value: formatUsd(String(priced.length ? spent / priced.length : 0)),
    },
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
