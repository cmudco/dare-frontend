import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import FileReprocessingDialog from '@/components/FileManager/FileReprocessingDialog'
import FileTagModal from '@/components/FileManager/FileTagModal'
import FileViewerModal from '@/components/FileManager/FileViewerModal'
import OcrApprovalDialog from '@/components/FileManager/OcrApprovalDialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  deleteFile,
  getFiles,
  getFolders,
  removeFileFromFolder,
} from '@/redux/asyncThunks/file'
import {
  addSelectedItem,
  openShareModal,
  removeSelectedItem,
  selectContentMatches,
  selectFoldersByFileId,
  selectLibraryFiles,
  setSelectedItems,
} from '@/redux/fileSlice'
import { MyFile } from '@/redux/types/files'
import { toast } from '@/utils/toast'
import SourceRow, { SourceRowAction } from './SourceRow'

const PAGE_SIZE = 50

type OpenDialog = {
  action: Exclude<SourceRowAction, 'share' | 'removeFromFolder'>
  fileId: number
}

interface SourceListProps {
  files: MyFile[]
  emptyState: ReactNode
  /** Set when listing a folder, so rows can be removed from it. */
  folderId?: number
}

const SourceList = ({ files, emptyState, folderId }: SourceListProps) => {
  const dispatch = useAppDispatch()
  const { loading, error, selectedItems } = useAppSelector(
    (state) => state.files
  )
  // The slice's loading and error flags are shared by every file request, so
  // they only describe this list while the library itself is still empty.
  const libraryEmpty = useAppSelector(selectLibraryFiles).length === 0
  const allTags = useAppSelector((state) => state.tags.tags)
  const foldersByFile = useAppSelector(selectFoldersByFileId)
  const contentMatches = useAppSelector(selectContentMatches)
  const isSyftboxUser = useAppSelector(
    (state) => state.user.user?.isSyftboxFileStorage ?? false
  )
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [dialog, setDialog] = useState<OpenDialog | null>(null)
  // Dialogs read the live file so status updates reach an open dialog.
  const dialogFile = dialog
    ? files.find((file) => file.id === dialog.fileId)
    : undefined

  if (files.length === 0) {
    if (libraryEmpty && loading) {
      return (
        <div className='flex flex-col gap-2' aria-busy='true'>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className='h-11 w-full' />
          ))}
        </div>
      )
    }
    if (libraryEmpty && error) {
      return (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-border p-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            Your sources could not be loaded.
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => dispatch(getFiles())}
          >
            Try again
          </Button>
        </div>
      )
    }
    return emptyState
  }

  const visibleFiles = files.slice(0, visibleCount)
  const allSelected = files.every((file) => selectedItems.includes(file.id))

  const removeFromFolder = async (file: MyFile) => {
    if (folderId === undefined) return
    try {
      await dispatch(
        removeFileFromFolder({ fileId: file.id, folderId })
      ).unwrap()
      dispatch(getFolders())
    } catch {
      toast.error(`Couldn't remove ${file.name} from the folder.`)
    }
  }

  const handleAction = (action: SourceRowAction, file: MyFile) => {
    switch (action) {
      case 'share':
        dispatch(openShareModal({ id: file.id, name: file.name }))
        break
      case 'removeFromFolder':
        removeFromFolder(file)
        break
      default:
        setDialog({ action, fileId: file.id })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!dialogFile) return
    try {
      await dispatch(deleteFile(dialogFile.id)).unwrap()
      dispatch(getFolders())
    } catch {
      toast.error(`Couldn't delete ${dialogFile.name}.`)
    }
  }

  const closeDialog = () => setDialog(null)

  return (
    <div className='flex flex-col'>
      <div className='flex items-center gap-3 px-3 pb-2 text-xs text-muted-foreground'>
        <Checkbox
          aria-label='Select all'
          checked={allSelected}
          onCheckedChange={(checked) =>
            dispatch(
              setSelectedItems(
                checked === true ? files.map((file) => file.id) : []
              )
            )
          }
        />
        <span>
          {files.length} {files.length === 1 ? 'source' : 'sources'}
        </span>
      </div>
      <ul className='divide-y divide-border rounded-lg border border-border bg-background'>
        {visibleFiles.map((file) => (
          <SourceRow
            key={file.id}
            file={file}
            folders={foldersByFile.get(file.id) ?? []}
            match={contentMatches.get(file.id)}
            allTags={allTags}
            selected={selectedItems.includes(file.id)}
            canShare={isSyftboxUser}
            canRemoveFromFolder={folderId !== undefined}
            onSelectedChange={(id, selected) =>
              dispatch(selected ? addSelectedItem(id) : removeSelectedItem(id))
            }
            onAction={handleAction}
          />
        ))}
      </ul>
      {files.length > visibleCount && (
        <Button
          variant='ghost'
          size='sm'
          className='mt-2 self-center'
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          Show {Math.min(PAGE_SIZE, files.length - visibleCount)} more
        </Button>
      )}

      <FileViewerModal
        isOpen={dialog?.action === 'view' && !!dialogFile}
        onClose={closeDialog}
        fileId={dialogFile?.id ?? null}
        fileName={dialogFile?.name ?? ''}
        fileType={dialogFile?.fileType ?? ''}
      />
      <FileTagModal
        isOpen={dialog?.action === 'tag' && !!dialogFile}
        onClose={closeDialog}
        fileId={dialogFile?.id ?? null}
        fileName={dialogFile?.name ?? ''}
        existingTags={dialogFile?.tags ?? []}
      />
      {dialog?.action === 'reprocess' && dialogFile && (
        <FileReprocessingDialog
          key={dialogFile.id}
          file={dialogFile}
          onClose={closeDialog}
        />
      )}
      <OcrApprovalDialog
        file={dialog?.action === 'reviewOcr' ? (dialogFile ?? null) : null}
        onClose={closeDialog}
      />
      <DeleteConfirmation
        isOpen={dialog?.action === 'delete' && !!dialogFile}
        onClose={closeDialog}
        onDelete={handleDeleteConfirm}
        title='Delete file'
        description='This permanently deletes the file and removes it from search.'
        itemName={dialogFile?.name}
        confirmText='Delete'
      />
    </div>
  )
}

export default SourceList
