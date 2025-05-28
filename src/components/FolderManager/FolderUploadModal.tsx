import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { setError } from '../../redux/fileSlice'
import {
  getFiles,
  getFolders,
  uploadFolder,
} from '../../redux/aynscThunks/file'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { isAllowedFileType } from '@/utils/files'
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@/utils/constants/file'

interface FolderUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const FolderUploadModal: React.FC<FolderUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [folderName, setFolderName] = useState<string>('')
  const folderInputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const setupFolderInput = () => {
      if (folderInputRef.current) {
        const input = folderInputRef.current

        input.setAttribute('webkitdirectory', '')
        input.setAttribute('directory', '')
        input.setAttribute('mozdirectory', '')
        ;(
          input as HTMLInputElement & {
            webkitdirectory: boolean
            directory: boolean
          }
        ).webkitdirectory = true
        ;(input as HTMLInputElement & { directory: boolean }).directory = true

        return true
      }
      return false
    }

    if (isOpen) {
      if (!setupFolderInput()) {
        const timer = setTimeout(() => {
          setupFolderInput()
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen])

  const setFolderInputRef = (element: HTMLInputElement | null) => {
    if (folderInputRef.current !== element) {
      ;(
        folderInputRef as React.MutableRefObject<HTMLInputElement | null>
      ).current = element
    }
    if (element && isOpen) {
      element.setAttribute('webkitdirectory', '')
      element.setAttribute('directory', '')
      element.setAttribute('mozdirectory', '')
      ;(
        element as HTMLInputElement & {
          webkitdirectory: boolean
          directory: boolean
        }
      ).webkitdirectory = true
      ;(element as HTMLInputElement & { directory: boolean }).directory = true
    }
  }

  const { loading, error } = useSelector((state: RootState) => state.files)

  const handleUploadClick = async () => {
    if (selectedFiles.length > 0 && folderName.trim()) {
      await dispatch(
        uploadFolder({
          files: selectedFiles,
          folderName: folderName.trim(),
        })
      ).unwrap()
      await dispatch(getFiles())
      await dispatch(getFolders())
      setSelectedFiles([])
      setFileErrors([])
      setFolderName('')
      dispatch(setError(''))
      onClose()
    } else {
      if (!folderName.trim()) {
        dispatch(setError('Folder name is required'))
      } else {
        dispatch(setError('No valid files selected'))
      }
    }
  }

  const handleFileSelection = (files: FileList | null) => {
    if (files && files.length > 0) {
      if (error) {
        dispatch(setError(''))
      }

      const validFiles: File[] = []
      const errors: string[] = []

      for (const file of Array.from(files)) {
        if (file.size === 0) {
          errors.push(`File "${file.name}" is empty and has been discarded.`)
          continue
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(
            `File "${file.name}" exceeds ${MAX_FILE_SIZE_MB} MB and has been discarded.`
          )
          continue
        }
        if (!isAllowedFileType(file)) {
          errors.push(
            `File "${file.name}" type not allowed and has been discarded. Allowed types are: docx, doc, pdf, txt, md, json`
          )
          continue
        }
        validFiles.push(file)
      }

      setSelectedFiles(validFiles)
      setFileErrors(errors)
    } else {
      setSelectedFiles([])
      setFileErrors([])
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files && files.length > 0) {
      const firstFile = files[0]

      if (firstFile.webkitRelativePath) {
        const folderPath = firstFile.webkitRelativePath.split('/')[0]
        setFolderName(folderPath)
      } else {
        const fileName = firstFile.name
        const folderFromName = fileName.includes('/')
          ? fileName.split('/')[0]
          : ''
        if (folderFromName) {
          setFolderName(folderFromName)
        }
      }
    }
    handleFileSelection(files)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files

    if (files && files.length > 0) {
      const firstFile = files[0]

      if (firstFile.webkitRelativePath) {
        const folderPath = firstFile.webkitRelativePath.split('/')[0]
        setFolderName(folderPath)
      } else {
        const fileName = firstFile.name
        if (fileName.includes('/')) {
          const folderFromName = fileName.split('/')[0]
          setFolderName(folderFromName)
        }
      }
    }
    handleFileSelection(files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleClose = () => {
    setSelectedFiles([])
    setFileErrors([])
    setFolderName('')
    dispatch(setError(''))
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent className='mx-auto w-[90vw] max-w-md rounded-lg bg-white p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            Folder Upload
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500'>
            Upload a folder with multiple files.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='folderName'>Folder Name</Label>
            <Input
              id='folderName'
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder='Enter folder name'
              required
            />
          </div>

          <div
            className={`border-2 border-dashed ${
              error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } cursor-pointer rounded-lg p-4 text-center transition`}
            onClick={() => folderInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFiles.length > 0 && !error ? (
              <div className='flex flex-col items-center justify-center space-y-2'>
                <CheckCircleIcon className='h-6 w-6 text-green-600' />
                <span className='text-sm font-medium text-green-700'>
                  {selectedFiles.length} file(s) ready to upload
                </span>
                <ul className='max-h-24 w-full overflow-auto text-xs text-gray-600'>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center space-x-2'>
                <XMarkIcon className='h-6 w-6 text-red-600' />
                <span className='text-sm font-medium text-red-700'>
                  Folder not uploaded
                </span>
              </div>
            ) : (
              <div className='font-medium text-gray-600'>
                <div>
                  Drop your folder here or{' '}
                  <span className='text-blue-600'>browse</span>
                </div>
                <div className='mt-1 text-xs text-gray-500'>
                  Select a folder to upload all its files at once
                </div>
              </div>
            )}
            <input
              ref={setFolderInputRef}
              type='file'
              multiple
              onChange={handleFileChange}
              className='hidden'
            />
            <span className='mt-2 block text-xs text-gray-500'>
              Maximum size per file: {MAX_FILE_SIZE_MB} MB
            </span>
          </div>
          {fileErrors.length > 0 && (
            <div className='text-center text-sm text-red-500'>
              <p>Some files were discarded due to errors:</p>
              <ul className='max-h-24 w-full list-inside list-disc overflow-auto'>
                {fileErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {error && (
            <div className='text-center text-sm text-red-500'>{error}</div>
          )}
        </div>

        <DialogFooter className='flex justify-end gap-2'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadClick}
            disabled={
              selectedFiles.length === 0 || !folderName.trim() || loading
            }
          >
            {loading ? 'Uploading...' : 'Upload Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FolderUploadModal
