import { useEffect, useMemo, useState } from 'react'
import { FileText, Folder, Search } from 'lucide-react'

import { getFilesAPI, getFoldersAPI } from '@/api/files'
import { createGraphAPI, updateGraphAPI } from '@/api/knowledgeGraph'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSourceSort } from '@/hooks/useSourceSort'
import { useAppSelector } from '@/redux/hooks'
import type { MyFile, MyFolder } from '@/redux/types/files'
import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'
import { FileStatus } from '@/utils/constants/file'
import { getErrorMessage } from '@/utils/errorHandler'
import { toggleId } from '@/utils/selection'
import { sortSources, type SortableSource } from '@/utils/sourceSort'
import { toast } from '@/utils/toast'

type SourceRow = SelectableRow<number> & SortableSource

interface GraphFilesDialogProps {
  open: boolean
  /** The graph being edited; absent when creating one. */
  graph?: KnowledgeGraphSummary | null
  onClose: () => void
  onSaved: (graph: KnowledgeGraphSummary) => void
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

/** Names a graph and picks its documents, for a new graph or an existing one. */
const GraphFilesDialog = ({
  open,
  graph,
  onClose,
  onSaved,
}: GraphFilesDialogProps) => {
  const vectorDb = useAppSelector((state) => state.user.user?.vectorDb)
  const [files, setFiles] = useState<MyFile[]>([])
  const [folders, setFolders] = useState<MyFolder[]>([])
  const [fileIds, setFileIds] = useState<number[]>([])
  const [folderIds, setFolderIds] = useState<number[]>([])
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useSourceSort()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setFileIds(graph?.fileIds ?? [])
    setFolderIds([])
    setName(graph?.name ?? '')
    setQuery('')
    setLoading(true)
    Promise.all([getFilesAPI(), getFoldersAPI()])
      .then(([fileRows, folderRows]) => {
        setFiles(fileRows.results)
        setFolders(folderRows.results)
      })
      .catch(() => toast.error("Couldn't load your documents. Try again."))
      .finally(() => setLoading(false))
  }, [open, graph])

  const visible = (rows: SourceRow[]) =>
    sortSources(
      rows.filter((row) =>
        row.label.toLowerCase().includes(query.trim().toLowerCase())
      ),
      sort
    )
  // The graph's own documents lead the list, so they are easy to find and untick.
  const current = new Set(graph?.fileIds)
  const currentFirst = (rows: SourceRow[]) => [
    ...rows.filter((row) => current.has(row.id)),
    ...rows.filter((row) => !current.has(row.id)),
  ]
  const emptyLabel = (kind: string, hint: string) =>
    loading ? 'Loading…' : query ? `No ${kind} match.` : hint

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
        meta: plural(folder.fileCount, 'file'),
      })),
    [folders]
  )

  const selectedCount = fileIds.length + folderIds.length
  const countLabel = (count: number) => (count > 0 ? ` (${count})` : '')
  const before = graph?.fileIds ?? []
  const added = fileIds.filter((id) => !before.includes(id)).length
  const removed = before.filter((id) => !fileIds.includes(id)).length
  const changes = [
    added ? `${added} added` : '',
    removed ? `${removed} removed` : '',
    folderIds.length ? `${plural(folderIds.length, 'folder')} added` : '',
  ].filter(Boolean)

  const submit = async () => {
    setSaving(true)
    const draft = { name: name.trim(), fileIds, folderIds }
    try {
      onSaved(
        graph
          ? await updateGraphAPI(graph.id, draft)
          : await createGraphAPI({ ...draft, description: '' })
      )
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          `Couldn't ${graph ? 'save' : 'create'} the graph. Try again.`
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {graph ? 'Edit knowledge graph' : 'New knowledge graph'}
          </DialogTitle>
          <DialogDescription>
            {graph
              ? 'Rename the graph or change its documents. A document you remove takes its relationships with it. Documents you add are read for relationships only after you approve the cost.'
              : 'Pick the documents to connect. Entities and aliases are free and ready in about a minute. A folder adds the files it holds when you create the graph.'}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder='Graph name'
          aria-label='Graph name'
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
                rows={currentFirst(visible(fileRows))}
                selected={fileIds}
                onToggle={(id) => setFileIds(toggleId(fileIds, id))}
                icon={<FileText className='h-4 w-4' />}
                emptyLabel={emptyLabel(
                  'files',
                  'Upload documents in Sources first.'
                )}
              />
            </TabsContent>
            <TabsContent value='folders' className='mt-0'>
              <SelectableList
                idPrefix='graph-folders'
                rows={visible(folderRows)}
                selected={folderIds}
                onToggle={(id) => setFolderIds(toggleId(folderIds, id))}
                icon={<Folder className='h-4 w-4' />}
                emptyLabel={emptyLabel(
                  'folders',
                  'Create folders in Sources first.'
                )}
              />
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter>
          <span className='mr-auto self-center text-sm text-muted-foreground'>
            {graph && changes.length
              ? changes.join(' · ')
              : `${selectedCount} selected`}
          </span>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || selectedCount === 0 || saving}
            onClick={() => void submit()}
          >
            {graph ? 'Save changes' : 'Create graph'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GraphFilesDialog
