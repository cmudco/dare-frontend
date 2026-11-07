import { Search, Share2 } from 'lucide-react'

import type { RetrievalTrace } from '@/redux/types/conversation'

import RouteGraph from './RouteGraph'
import { graphUsageOf } from './graphUsage'

const Score = ({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail?: string
}) => (
  <div className='min-w-0 rounded-md bg-background p-2'>
    <p className='text-base leading-tight font-semibold tabular-nums'>
      {value}
    </p>
    <p className='truncate text-[11px] text-muted-foreground'>{label}</p>
    {detail && (
      <p className='truncate text-[11px] text-muted-foreground'>{detail}</p>
    )}
  </div>
)

/** Says whether the graph changed this answer's evidence and draws the route it took. */
const GraphUsagePanel = ({
  trace,
  citedIds,
}: {
  trace: RetrievalTrace
  citedIds: ReadonlySet<string>
}) => {
  const usage = graphUsageOf(trace)
  if (!usage) return null
  const Icon = usage.helped ? Share2 : Search
  const final = trace.finalEvidence ?? []
  const cited = final.filter(
    (entry) => entry.citationId && citedIds.has(entry.citationId)
  )
  const citedFromGraph = cited.filter(
    (entry) => entry.origin && entry.origin !== 'search'
  ).length
  return (
    <div className='my-1.5 min-w-0 rounded-md border border-border bg-muted/30 p-2'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
        <Icon className='h-3.5 w-3.5 shrink-0' />
        {usage.title}
      </div>
      <p className='mt-1 text-xs text-muted-foreground'>{usage.summary}</p>
      {usage.connections.map((line) => (
        <p key={line} className='mt-1 text-xs text-foreground'>
          {line}
        </p>
      ))}
      {usage.score && usage.helped && (
        <div className='mt-2 grid grid-cols-3 gap-1.5'>
          <Score label='Search found' value={usage.score.search} />
          <Score
            label='Graph added'
            value={usage.score.graph}
            detail={
              usage.score.onlyGraph
                ? `${usage.score.onlyGraph} graph only`
                : undefined
            }
          />
          <Score
            label='Answer cited'
            value={cited.length}
            detail={`${citedFromGraph} from the graph`}
          />
        </div>
      )}
      {usage.showRoute && (
        <>
          <RouteGraph trace={trace} citedIds={citedIds} />
          <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <span className='h-px w-4 bg-primary' />
              Stated in your documents
            </span>
            <span className='flex items-center gap-1'>
              <span className='w-4 border-t border-dashed border-muted-foreground' />
              Names in the same chunk
            </span>
            <span className='flex items-center gap-1'>
              <span className='h-2 w-3 rounded-sm border border-primary bg-primary/15' />
              Cited in the answer
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default GraphUsagePanel
