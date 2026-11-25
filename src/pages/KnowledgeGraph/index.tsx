import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network, Pencil, Plus, Trash2 } from 'lucide-react'

import { deleteGraphAPI, listGraphsAPI } from '@/api/knowledgeGraph'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import GraphFilesDialog from '@/components/KnowledgeGraph/GraphFilesDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'
import { formatRelativeDate } from '@/utils/dateUtils'
import { toast } from '@/utils/toast'

const KnowledgeGraphsPage = () => {
  const navigate = useNavigate()
  const [graphs, setGraphs] = useState<KnowledgeGraphSummary[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<KnowledgeGraphSummary | null>(null)
  const [deleting, setDeleting] = useState<KnowledgeGraphSummary | null>(null)

  const load = useCallback(() => {
    listGraphsAPI()
      .then(setGraphs)
      .catch(() => {
        setGraphs((current) => current ?? [])
        toast.error("Couldn't load your graphs. Try again.")
      })
  }, [])

  useEffect(load, [load])

  const remove = async (graph: KnowledgeGraphSummary) => {
    try {
      await deleteGraphAPI(graph.id)
      toast.success(`Deleted “${graph.name}”`)
      load()
    } catch {
      toast.error("Couldn't delete that graph. Try again.")
    }
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='px-6 pt-8 pb-16 md:px-10'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold'>Knowledge graphs</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              See how the people, places and ideas in your documents connect.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className='mr-1.5 h-4 w-4' />
            New graph
          </Button>
        </div>

        <div className='mt-8 space-y-2'>
          {graphs === null &&
            [0, 1, 2].map((key) => (
              <Skeleton key={key} className='h-20 w-full rounded-lg' />
            ))}
          {graphs?.map((graph) => (
            <div
              key={graph.id}
              role='button'
              tabIndex={0}
              onClick={() => navigate(`/knowledge-graphs/${graph.id}`)}
              onKeyDown={(event) =>
                event.key === 'Enter' &&
                navigate(`/knowledge-graphs/${graph.id}`)
              }
              className='group flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-foreground/25'
            >
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
                <Network className='h-4.5 w-4.5' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium'>{graph.name}</p>
                <p className='truncate text-sm text-muted-foreground'>
                  {graph.description || `${graph.fileIds.length} documents`}
                </p>
              </div>
              <div className='hidden shrink-0 text-right text-xs text-muted-foreground sm:block'>
                <p>
                  {graph.fileIds.length} documents ·{' '}
                  {graph.relationCount
                    ? `${graph.relationCount} relationships`
                    : 'entities only'}
                </p>
                <p className='mt-0.5'>
                  Created {formatRelativeDate(graph.createdAt)}
                </p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                aria-label={`Edit ${graph.name}`}
                className='shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
                onClick={(event) => {
                  event.stopPropagation()
                  setEditing(graph)
                }}
              >
                <Pencil className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                aria-label={`Delete ${graph.name}`}
                className='shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
                onClick={(event) => {
                  event.stopPropagation()
                  setDeleting(graph)
                }}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
          {graphs?.length === 0 && (
            <div className='rounded-lg border border-dashed border-border px-6 py-14 text-center'>
              <Network className='mx-auto h-8 w-8 text-muted-foreground' />
              <p className='mt-3 font-medium'>Start your first graph</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                Choose a few documents and see what connects them.
              </p>
            </div>
          )}
        </div>
      </div>
      <GraphFilesDialog
        open={creating || !!editing}
        graph={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={(graph) => navigate(`/knowledge-graphs/${graph.id}`)}
      />
      <DeleteConfirmation
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onDelete={() => (deleting ? remove(deleting) : undefined)}
        title='Delete this graph?'
        description='Its relationship types and stated relationships are deleted. Your documents stay.'
        itemName={deleting?.name}
      />
    </div>
  )
}

export default KnowledgeGraphsPage
