import type { GraphStats as Stats } from '@/redux/types/knowledgeGraph'

import EntityBands from './EntityBands'

interface GraphStatsProps {
  stats: Stats
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className='min-w-0'>
    <p className='text-lg leading-tight font-semibold tabular-nums'>
      {value.toLocaleString()}
    </p>
    <p className='truncate text-xs text-muted-foreground'>{label}</p>
  </div>
)

/** The headline counts above a graph. */
const GraphStats = ({ stats }: GraphStatsProps) => (
  <div className='flex gap-7'>
    <Stat label='Documents' value={stats.documents} />
    <Stat label='Chunks' value={stats.passages} />
    <EntityBands total={stats.entities} bands={stats.entityBands} />
    <Stat label='Merged names' value={stats.mergedEntities} />
    <Stat label='Across documents' value={stats.crossDocumentEntities} />
    <Stat label='Relationships' value={stats.relations} />
  </div>
)

export default GraphStats
