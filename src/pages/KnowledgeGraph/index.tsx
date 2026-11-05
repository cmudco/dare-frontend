import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Network, Plus, Search, Trash2 } from 'lucide-react'

import { getFilesAPI } from '@/api/files'
import {
  createGraphAPI,
  deleteGraphAPI,
  listGraphsAPI,
} from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { MyFile } from '@/redux/types/files'
import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'
import { formatRelativeDate } from '@/utils/dateUtils'
import { toast } from '@/utils/toast'

const CreateGraphDialog = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (graph: KnowledgeGraphSummary) => void
}) => {
  const [files, setFiles] = useState<MyFile[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setName('')
    setQuery('')
    void getFilesAPI().then((response) => setFiles(response.results))
  }, [open])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return files.filter(
      (file) => !needle || file.name.toLowerCase().includes(needle)
    )
  }, [files, query])

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const submit = async () => {
    setSaving(true)
    try {
      onCreated(
        await createGraphAPI({
          name: name.trim(),
          description: '',
          fileIds: [...selected],
        })
      )
    } catch {
      toast.error("Couldn't create the graph. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>New knowledge graph</DialogTitle>
          <DialogDescription>
            Pick the documents to connect. Entities and aliases are free and
            ready right away.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder='Graph name'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className='relative'>
          <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            className='pl-8'
            placeholder='Search your sources'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className='max-h-64 space-y-0.5 overflow-y-auto rounded-md border border-border p-1'>
          {visible.map((file) => (
            <label
              key={file.id}
              className='flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent'
            >
              <Checkbox
                checked={selected.has(file.id)}
                onCheckedChange={() => toggle(file.id)}
              />
              <FileText className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
              <span className='truncate'>{file.name}</span>
            </label>
          ))}
          {visible.length === 0 && (
            <p className='p-3 text-center text-sm text-muted-foreground'>
              No matching sources.
            </p>
          )}
        </div>
        <DialogFooter>
          <span className='mr-auto self-center text-sm text-muted-foreground'>
            {selected.size} selected
          </span>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || selected.size === 0 || saving}
            onClick={() => void submit()}
          >
            Create graph
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const KnowledgeGraphsPage = () => {
  const navigate = useNavigate()
  const [graphs, setGraphs] = useState<KnowledgeGraphSummary[] | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(() => {
    void listGraphsAPI().then(setGraphs)
  }, [])

  useEffect(load, [load])

  const remove = async (graph: KnowledgeGraphSummary) => {
    await deleteGraphAPI(graph.id)
    toast.success(`Deleted “${graph.name}”`)
    load()
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='mx-auto max-w-4xl px-6 pt-10 pb-16'>
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
                aria-label={`Delete ${graph.name}`}
                className='shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
                onClick={(event) => {
                  event.stopPropagation()
                  void remove(graph)
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
      <CreateGraphDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(graph) => navigate(`/knowledge-graphs/${graph.id}`)}
      />
    </div>
  )
}

export default KnowledgeGraphsPage
