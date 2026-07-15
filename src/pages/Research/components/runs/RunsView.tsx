import { useNavigate } from 'react-router-dom'
import type { AgentRun } from '../../types'
import RunStats from './RunStats'
import RunRow from './RunRow'

interface RunsViewProps {
  runs: AgentRun[]
  projectId?: number
}

// The Runs tab: a list of every delegated run. Clicking a run routes to its
// dedicated details page.
const RunsView = ({ runs, projectId }: RunsViewProps) => {
  const navigate = useNavigate()

  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Runs</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Every delegated task sent to the agent harness — what it ran, which
          tools it used, and what it staged. Nothing here changed your record.
        </p>
      </header>

      {runs.length > 0 && <RunStats runs={runs} />}

      {runs.length === 0 ? (
        <div className='rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground'>
          No runs yet. Delegated tasks you send to Scout will appear here.
        </div>
      ) : (
        <div className='space-y-3'>
          {runs.map((run) => (
            <RunRow
              key={run.id}
              run={run}
              onOpen={() => navigate(`/research/${projectId}/runs/${run.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RunsView
