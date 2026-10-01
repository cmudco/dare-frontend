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
import { useAppSelector } from '@/redux/hooks'
import { selectAddedLibraries } from '@/redux/librarySlice'
import { FileStatus } from '@/utils/constants/file'
import type { Project, ProjectUpdate } from '@/redux/types/project'
import { toggleId } from '@/utils/selection'
import SelectableList, { type SelectableRow } from './SelectableList'

type SourceSelection = Required<
  Pick<ProjectUpdate, 'fileIds' | 'folderIds' | 'libraryIds'>
>

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
  })
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const matches = (name: string) =>
    name.toLowerCase().includes(query.trim().toLowerCase())

  // Same eligibility as the chat source picker: documents in the user's vector store.
  const fileRows = useMemo<SelectableRow<number>[]>(
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
          meta: file.status === FileStatus.PROCESSING ? 'Processing…' : '',
        })),
    [files, vectorDb]
  )
  const folderRows = useMemo<SelectableRow<number>[]>(
    () =>
      folders.map((folder) => ({
        id: folder.id,
        label: folder.name,
        meta: `${folder.fileCount} ${folder.fileCount === 1 ? 'file' : 'files'}`,
      })),
    [folders]
  )
  const libraryRows = useMemo<SelectableRow<number>[]>(
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
          Selected sources are searched in every new chat started in this
          project. Folders include whatever files they hold when the chat
          starts.
        </DialogDescription>
      </DialogHeader>

      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search sources'
          aria-label='Search sources'
          className='pl-9'
        />
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
        <div className='mt-2 h-72 overflow-y-auto pr-1'>
          <TabsContent value='files' className='mt-0'>
            <SelectableList
              idPrefix='project-files'
              rows={fileRows.filter((row) => matches(row.label))}
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
              rows={folderRows.filter((row) => matches(row.label))}
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
              rows={libraryRows.filter((row) => matches(row.label))}
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
          <Button onClick={handleSave} disabled={saving}>
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
    <DialogContent className='flex max-h-[90vh] max-w-xl flex-col'>
      <SourcesForm
        project={project}
        onSave={onSave}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
)

export default ProjectSourcesDialog
