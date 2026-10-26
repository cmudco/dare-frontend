import { useMemo, useState } from 'react'
import { FileText, Folder, Library, Loader2, Search } from 'lucide-react'
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
import { useSourceSize } from '@/hooks/useSourceSize'
import { useSourceSort } from '@/hooks/useSourceSort'
import { useAppSelector } from '@/redux/hooks'
import { selectAddedLibraries } from '@/redux/librarySlice'
import { FileStatus } from '@/utils/constants/file'
import { ProjectSourceMode } from '@/utils/constants/project'
import type { Project, ProjectUpdate } from '@/redux/types/project'
import { toggleId } from '@/utils/selection'
import { sortSources, type SortableSource } from '@/utils/sourceSort'
import SelectableList, { type SelectableRow } from './SelectableList'
import SourceModeChoice from './SourceModeChoice'
import SourceSortSelect from './SourceSortSelect'

type SourceSelection = Required<
  Pick<ProjectUpdate, 'fileIds' | 'folderIds' | 'libraryIds' | 'sourceMode'>
>

type SourceRow = SelectableRow<number> & SortableSource

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onSave: (selection: SourceSelection) => Promise<void>
}

const SourcesForm = ({
  project,
  onSave,
  onClose,
}: {
  project: Project
  onSave: Props['onSave']
  onClose: () => void
}) => {
  const files = useAppSelector((state) => state.files.files)
  const folders = useAppSelector((state) => state.files.folders)
  const libraries = useAppSelector(selectAddedLibraries)
  const vectorDb = useAppSelector((state) => state.user.user?.vectorDb)
  const [selection, setSelection] = useState<SourceSelection>({
    fileIds: project.fileIds,
    folderIds: project.folderIds,
    libraryIds: project.libraryIds,
    sourceMode: project.sourceMode,
  })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useSourceSort()
  const sizeState = useSourceSize(selection.fileIds, selection.folderIds)
  const hasFiles = selection.fileIds.length + selection.folderIds.length > 0
  const tooLargeForFull =
    selection.sourceMode === ProjectSourceMode.FULL &&
    sizeState.status === 'ready' &&
    !sizeState.size.fitsFullFiles
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = (rows: SourceRow[]) =>
    sortSources(
      rows.filter((row) =>
        row.label.toLowerCase().includes(query.trim().toLowerCase())
      ),
      sort
    )

  // Same eligibility as the chat source picker: documents in the user's vector store.
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
  const libraryRows = useMemo<SourceRow[]>(
    () =>
      libraries.map((library) => ({
        id: library.id,
        label: library.name,
        meta: library.curator,
      })),
    [libraries]
  )

  const total =
    selection.fileIds.length +
    selection.folderIds.length +
    selection.libraryIds.length

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(selection)
      onClose()
    } catch (rejection) {
      setError(
        typeof rejection === 'string' && rejection
          ? rejection
          : 'Could not save sources. Try again.'
      )
      setSaving(false)
    }
  }

  const countLabel = (count: number) => (count > 0 ? ` (${count})` : '')

  return (
    <>
      <DialogHeader>
        <DialogTitle>Project sources</DialogTitle>
        <DialogDescription>
          Selected sources are used in every new chat started in this project.
          Folders include whatever files they hold when the chat starts.
        </DialogDescription>
      </DialogHeader>

      <div className='flex gap-2'>
        <div className='relative min-w-0 flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search sources'
            aria-label='Search sources'
            className='pl-9'
          />
        </div>
        <SourceSortSelect value={sort} onChange={setSort} />
      </div>

      <Tabs defaultValue='files' className='flex min-h-0 flex-col'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='files'>
            Files{countLabel(selection.fileIds.length)}
          </TabsTrigger>
          <TabsTrigger value='folders'>
            Folders{countLabel(selection.folderIds.length)}
          </TabsTrigger>
          <TabsTrigger value='libraries'>
            Libraries{countLabel(selection.libraryIds.length)}
          </TabsTrigger>
        </TabsList>
        <div className='mt-2 h-56 overflow-y-auto pr-1'>
          <TabsContent value='files' className='mt-0'>
            <SelectableList
              idPrefix='project-files'
              rows={visible(fileRows)}
              selected={selection.fileIds}
              onToggle={(id) =>
                setSelection({
                  ...selection,
                  fileIds: toggleId(selection.fileIds, id),
                })
              }
              icon={<FileText className='h-4 w-4' />}
              emptyLabel={
                query ? 'No files match.' : 'Upload documents in Sources first.'
              }
            />
          </TabsContent>
          <TabsContent value='folders' className='mt-0'>
            <SelectableList
              idPrefix='project-folders'
              rows={visible(folderRows)}
              selected={selection.folderIds}
              onToggle={(id) =>
                setSelection({
                  ...selection,
                  folderIds: toggleId(selection.folderIds, id),
                })
              }
              icon={<Folder className='h-4 w-4' />}
              emptyLabel={
                query ? 'No folders match.' : 'Create folders in Sources first.'
              }
            />
          </TabsContent>
          <TabsContent value='libraries' className='mt-0'>
            <SelectableList
              idPrefix='project-libraries'
              rows={visible(libraryRows)}
              selected={selection.libraryIds}
              onToggle={(id) =>
                setSelection({
                  ...selection,
                  libraryIds: toggleId(selection.libraryIds, id),
                })
              }
              icon={<Library className='h-4 w-4' />}
              emptyLabel={
                query
                  ? 'No libraries match.'
                  : 'Add shared libraries from Sources first.'
              }
            />
          </TabsContent>
        </div>
      </Tabs>

      <SourceModeChoice
        value={selection.sourceMode}
        onChange={(sourceMode) => setSelection({ ...selection, sourceMode })}
        sizeState={sizeState}
        hasFiles={hasFiles}
      />

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <DialogFooter className='items-center sm:justify-between'>
        <span className='text-sm text-muted-foreground'>{total} selected</span>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || tooLargeForFull}>
            {saving && <Loader2 className='h-4 w-4 animate-spin' />}
            Save sources
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

const ProjectSourcesDialog = ({
  open,
  onOpenChange,
  project,
  onSave,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='flex max-h-[90vh] max-w-xl flex-col overflow-y-auto'>
      <SourcesForm
        project={project}
        onSave={onSave}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
)

export default ProjectSourcesDialog
