import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Folder, Network, Plus, Search, Trash2 } from 'lucide-react'

import { getFilesAPI, getFoldersAPI } from '@/api/files'
import {
  createGraphAPI,
  deleteGraphAPI,
  listGraphsAPI,
} from '@/api/knowledgeGraph'
import SelectableList, {
  type SelectableRow,
} from '@/components/Projects/SelectableList'
import SourceSortSelect from '@/components/Projects/SourceSortSelect'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSourceSort } from '@/hooks/useSourceSort'
import { useAppSelector } from '@/redux/hooks'
import type { MyFile, MyFolder } from '@/redux/types/files'
import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'
import { FileStatus } from '@/utils/constants/file'
import { formatRelativeDate } from '@/utils/dateUtils'
import { toggleId } from '@/utils/selection'
import { sortSources, type SortableSource } from '@/utils/sourceSort'
import { toast } from '@/utils/toast'

type SourceRow = SelectableRow<number> & SortableSource

const CreateGraphDialog = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (graph: KnowledgeGraphSummary) => void
}) => {
  const vectorDb = useAppSelector((state) => state.user.user?.vectorDb)
  const [files, setFiles] = useState<MyFile[]>([])
  const [folders, setFolders] = useState<MyFolder[]>([])
  const [fileIds, setFileIds] = useState<number[]>([])
  const [folderIds, setFolderIds] = useState<number[]>([])
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useSourceSort()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setFileIds([])
    setFolderIds([])
    setName('')
    setQuery('')
    void getFilesAPI().then((response) => setFiles(response.results))
    void getFoldersAPI().then((response) => setFolders(response.results))
  }, [open])

  const visible = (rows: SourceRow[]) =>
    sortSources(
      rows.filter((row) =>
        row.label.toLowerCase().includes(query.trim().toLowerCase())
      ),
      sort
    )

  const fileRows = useMemo<SourceRow[]>(
    () =>
      files
        .filter(
          (file) =>
            !file.isMedia &&
            file.vectorDbSource === vectorDb &&
            file.status !== FileStatus.FAILED
        )
        .map((file) => ({
          id: file.id,
          label: file.name,
          date: file.createdAt,
          meta: file.status === FileStatus.PROCESSING ? 'Processing…' : '',
        })),
    [files, vectorDb]
  )
  const folderRows = useMemo<SourceRow[]>(
    () =>
      folders.map((folder) => ({
        id: folder.id,
        label: folder.name,
        date: folder.updatedAt,
        meta: `${folder.fileCount} ${folder.fileCount === 1 ? 'file' : 'files'}`,
      })),
    [folders]
  )

  const selectedCount = fileIds.length + folderIds.length
  const countLabel = (count: number) => (count > 0 ? ` (${count})` : '')

  const submit = async () => {
    setSaving(true)
    try {
      onCreated(
        await createGraphAPI({
          name: name.trim(),
          description: '',
          fileIds,
          folderIds,
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
            ready in about a minute. A folder adds the files it holds when you
            create the graph.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder='Graph name'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className='flex gap-2'>
          <div className='relative min-w-0 flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='pl-9'
              placeholder='Search sources'
              aria-label='Search sources'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <SourceSortSelect value={sort} onChange={setSort} />
        </div>
        <Tabs defaultValue='files' className='flex min-h-0 flex-col'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='files'>
              Files{countLabel(fileIds.length)}
            </TabsTrigger>
            <TabsTrigger value='folders'>
              Folders{countLabel(folderIds.length)}
            </TabsTrigger>
          </TabsList>
          <div className='mt-2 h-56 overflow-y-auto pr-1'>
            <TabsContent value='files' className='mt-0'>
              <SelectableList
                idPrefix='graph-files'
                rows={visible(fileRows)}
                selected={fileIds}
                onToggle={(id) => setFileIds(toggleId(fileIds, id))}
                icon={<FileText className='h-4 w-4' />}
                emptyLabel={
                  query
                    ? 'No files match.'
                    : 'Upload documents in Sources first.'
                }
              />
            </TabsContent>
            <TabsContent value='folders' className='mt-0'>
              <SelectableList
                idPrefix='graph-folders'
                rows={visible(folderRows)}
                selected={folderIds}
                onToggle={(id) => setFolderIds(toggleId(folderIds, id))}
                icon={<Folder className='h-4 w-4' />}
                emptyLabel={
                  query
                    ? 'No folders match.'
                    : 'Create folders in Sources first.'
                }
              />
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter>
          <span className='mr-auto self-center text-sm text-muted-foreground'>
            {selectedCount} selected
          </span>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || selectedCount === 0 || saving}
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
