import { Check, Network } from 'lucide-react'

import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'

interface GraphSourceListProps {
  /** Null while the list is loading. */
  graphs: KnowledgeGraphSummary[] | null
  selectedIds: ReadonlySet<number>
  onToggle: (graph: KnowledgeGraphSummary) => void
}

/** The knowledge graphs tab of the chat source picker. */
const GraphSourceList = ({
  graphs,
  selectedIds,
  onToggle,
}: GraphSourceListProps) => (
  <div className='max-h-[300px] space-y-1 overflow-y-auto'>
    {graphs?.map((graph) => {
      const isSelected = selectedIds.has(graph.id)
      return (
        <button
          key={graph.id}
          type='button'
          aria-pressed={isSelected}
          onClick={() => onToggle(graph)}
          className={`flex w-full items-center rounded-md p-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
            isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground'
          }`}
        >
          <span
            className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
              isSelected ? 'border-primary bg-primary' : 'border-input'
            }`}
          >
            {isSelected && (
              <Check className='h-3 w-3 text-primary-foreground' />
            )}
          </span>
          <Network className='mr-2 h-4 w-4 shrink-0 text-muted-foreground' />
          <span
            className={`min-w-0 flex-1 truncate text-sm ${isSelected ? 'font-medium text-primary' : ''}`}
          >
            {graph.name}
          </span>
          <span className='ml-2 shrink-0 text-xs text-muted-foreground'>
            {graph.fileIds.length} documents ·{' '}
            {graph.relationCount
              ? `${graph.relationCount.toLocaleString()} relationships`
              : 'entities only'}
          </span>
        </button>
      )
    })}
    {graphs === null && (
      <p className='py-4 text-center text-muted-foreground'>Loading graphs…</p>
    )}
    {graphs?.length === 0 && (
      <p className='py-4 text-center text-muted-foreground'>
        No knowledge graphs found
      </p>
    )}
    {!!graphs?.length && (
      <p className='px-2 pt-2 text-xs text-muted-foreground'>
        Picking a graph selects all its documents and switches retrieval to
        Graph mode.
      </p>
    )}
  </div>
)

export default GraphSourceList
