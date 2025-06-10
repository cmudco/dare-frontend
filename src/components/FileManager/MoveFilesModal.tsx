import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { FolderIcon } from 'lucide-react'
import { closeMoveModal, clearSelectedItems } from '../../redux/fileSlice'
import {
  moveFilesToFolder,
  getFiles,
  getFolders,
} from '../../redux/asyncThunks/file'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { getFileIcon } from '@/utils/constants/files'

const MoveFilesModal = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { files, folders, selectedItems, isMoveModalOpen } = useSelector(
    (state: RootState) => state.files
  )
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')

  const selectedFiles = files.filter((file) => selectedItems.includes(file.id))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedFolderId) {
      try {
        await dispatch(
          moveFilesToFolder({
            fileIds: selectedItems,
            folderId: parseInt(selectedFolderId),
          })
        ).unwrap()
        await dispatch(getFiles())
        await dispatch(getFolders())
        dispatch(clearSelectedItems())
        dispatch(closeMoveModal())
        setSelectedFolderId('')
      } catch (error) {
        console.error('Failed to move files:', error)
      }
    }
  }

  const handleCancel = () => {
    dispatch(closeMoveModal())
    setSelectedFolderId('')
  }

  return (
    <Dialog
      open={isMoveModalOpen}
      onOpenChange={() => dispatch(closeMoveModal())}
    >
      <DialogContent className='flex max-h-[86vh] flex-col sm:max-w-[500px]'>
        <DialogHeader className='flex-shrink-0 pb-4'>
          <DialogTitle className='text-center text-xl font-semibold'>
            Move Files to Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex h-full min-h-0 flex-col'>
          <div className='flex-shrink-0 space-y-4'>
            <div className='text-sm font-medium text-gray-600'>
              Moving {selectedItems.length} file
              {selectedItems.length !== 1 ? 's' : ''}:
            </div>
            <div className='grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-gray-200 p-2'>
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className='flex items-center rounded-md border bg-white p-2 shadow-sm hover:bg-gray-50'
                >
                  <div className='mr-2 flex-shrink-0'>
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-gray-900'>
                      {file.name || 'Unnamed'}
                    </p>
                    <p className='truncate text-xs text-gray-500'>
                      {file.fileType || 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
              {selectedFiles.length === 0 && (
                <div className='col-span-2 py-3 text-center text-gray-500'>
                  No files selected
                </div>
              )}
            </div>
          </div>

          <div className='flex min-h-0 flex-1 flex-col py-4'>
            <Label className='mb-3 flex-shrink-0 text-base font-medium'>
              Select destination folder:
            </Label>
            <div className='overflow-y-auto pr-1'>
              <RadioGroup
                value={selectedFolderId}
                onValueChange={setSelectedFolderId}
              >
                {folders.map((folder) => {
                  const fileCount = folder.files?.length || 0
                  return (
                    <Label
                      key={folder.id}
                      htmlFor={`folder-${folder.id}`}
                      className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                        selectedFolderId === folder.id.toString()
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem
                        value={folder.id.toString()}
                        id={`folder-${folder.id}`}
                        className='flex-shrink-0'
                      />
                      <div className='flex min-w-0 flex-1 items-center space-x-3'>
                        <FolderIcon
                          className={`h-5 w-5 flex-shrink-0 ${
                            selectedFolderId === folder.id.toString()
                              ? 'text-blue-600'
                              : 'text-blue-500'
                          }`}
                        />
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center space-x-2'>
                            <span className='truncate font-medium'>
                              {folder.name}
                            </span>
                            {fileCount > 0 && (
                              <span className='flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800'>
                                {fileCount} {fileCount === 1 ? 'file' : 'files'}
                              </span>
                            )}
                          </div>
                          <div className='mt-1 text-xs text-gray-500'>
                            Last updated:{' '}
                            {new Date(folder.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>
              {folders.length === 0 && (
                <div className='py-8 text-center text-sm text-gray-500'>
                  No folders available. Create a folder first to move files.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className='flex-shrink-0 gap-2 border-t pt-4'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!selectedFolderId}
              className='bg-dark-blue text-white hover:bg-dark-blue-hovered'
            >
              Move Files
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default MoveFilesModal
