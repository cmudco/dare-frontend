import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  resetSelectedTags,
  closeModal,
  updateTagChange,
  updateRemoveTag,
  setError,
} from '../../redux/fileSlice'
import { getFiles, uploadNewFile } from '../../redux/asyncThunks/file'
import { addTag, getTags } from '../../redux/asyncThunks/tag'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Settings, Info } from 'lucide-react'

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'
import { Badge } from '../ui/badge'
import { getTagColor, isAllowedFileType } from '@/utils/files'
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@/utils/constants/file'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { fetchChunkSettings } from '@/redux/asyncThunks/user'
import { ChunkSettingsForm } from '@/components/Auth/ChunkSettingsForm'

const FileUploadModal: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [newTag, setNewTag] = useState<string>('')
  const [isChunkPopoverOpen, setIsChunkPopoverOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const { selectedTags, isModalOpen, loading, error } = useSelector(
    (state: RootState) => state.files
  )

  useEffect(() => {
    dispatch(getTags())
  }, [dispatch])

  useEffect(() => {
    if (isModalOpen) {
      dispatch(fetchChunkSettings())
    }
  }, [dispatch, isModalOpen])
  const { tags } = useSelector((state: RootState) => state.tags)
  const { chunkSettings } = useSelector((state: RootState) => state.user)

  const handleUploadClick = async () => {
    if (selectedFiles.length > 0) {
      await dispatch(
        uploadNewFile({
          files: selectedFiles,
          tags: selectedTags,
        })
      ).unwrap()
      dispatch(resetSelectedTags())
      dispatch(closeModal())
      dispatch(getFiles())
      setSelectedFiles([])
      setFileErrors([])
      dispatch(setError(''))
    } else {
      dispatch(setError('No valid files selected'))
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
            `File "${file.name}" type not allowed and has been discarded. Allowed types are: docx, doc, pdf, txt, md, json, csv, xls, xlsx, images, videos, audio (mp3, wav, m4a, flac, aac, wma, opus)`
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
    handleFileSelection(event.target.files)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFileSelection(event.dataTransfer.files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleCreateTag = () => {
    if (newTag.trim() !== '') {
      dispatch(addTag(newTag))
      setNewTag('')
    }
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedFiles([])
          setFileErrors([])
          setIsChunkPopoverOpen(false)
          dispatch(closeModal())
        }
      }}
    >
      <DialogContent className='mx-auto w-[90vw] max-w-md rounded-lg bg-background bg-white p-6 shadow-lg'>
        {/* Header */}
        <DialogHeader>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <DialogTitle className='text-lg font-semibold text-gray-900 dark:text-white'>
                File Upload
              </DialogTitle>
              <DialogDescription className='text-sm text-gray-500 dark:text-dark-icon-unselected'>
                Upload multiple files and add tags to categorize them.
              </DialogDescription>
            </div>
            <Popover
              open={isChunkPopoverOpen}
              onOpenChange={(open) => {
                setIsChunkPopoverOpen(open)
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-gray-600 hover:text-gray-900 dark:text-dark-icon-unselected dark:hover:text-white'
                  aria-label='Adjust chunk settings'
                >
                  <Settings className='h-5 w-5' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align='end'
                className='w-80 space-y-4'
                sideOffset={8}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onCloseAutoFocus={(event) => event.preventDefault()}
              >
                <div>
                  <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                    Chunk settings
                  </h3>
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                    Control how your documents are split into chunks for
                    retrieval.
                  </p>
                </div>
                <ChunkSettingsForm
                  onSuccess={() => setIsChunkPopoverOpen(false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='x-2 flex flex-col gap-2'>
            <Select
              onValueChange={(value) =>
                dispatch(updateTagChange(parseInt(value)))
              }
            >
              <SelectTrigger className='w-full bg-background dark:border-gray-700 dark:text-white'>
                <SelectValue placeholder='Add Tags' />
              </SelectTrigger>
              <SelectContent className='bg-background dark:border-gray-700'>
                {Array.isArray(tags) && tags.length > 0 ? (
                  tags.map((tag) => (
                    <SelectItem
                      key={tag.id}
                      value={String(tag.id)}
                      className='dark:text-white dark:hover:bg-white/10'
                    >
                      {tag.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value='no-tags'
                    disabled
                    className='dark:text-gray-400'
                  >
                    No tags available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <div className='flex flex-wrap gap-3'>
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId)
                if (!tag) return null
                const colorVariant = getTagColor(tag.label)
                return (
                  <Badge
                    key={tagId}
                    variant={colorVariant}
                    selected={true}
                    className='flex items-center px-2 py-1 text-sm'
                  >
                    {tag.label}
                    <button
                      className='ml-1.5 flex items-center justify-center rounded-full p-0.5 hover:bg-white/20'
                      onClick={() => dispatch(updateRemoveTag(tagId))}
                      aria-label='Remove tag'
                    >
                      <XMarkIcon className='h-3 w-3' />
                    </button>
                  </Badge>
                )
              })}
            </div>

            <div className='flex gap-2'>
              <Input
                placeholder='New Tag'
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim() !== '') {
                    handleCreateTag()
                  }
                }}
              />
              <Button size='sm' onClick={handleCreateTag}>
                Create Tag
              </Button>
            </div>
          </div>

          <div
            className={`border-2 border-dashed ${
              error
                ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-dark-icon-unselected dark:bg-black/20 dark:hover:bg-white/10'
            } cursor-pointer rounded-lg p-4 text-center transition`}
            onClick={() => document.getElementById('fileInput')?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFiles.length > 0 && !error ? (
              <div className='flex flex-col items-center justify-center space-y-2'>
                <CheckCircleIcon className='h-6 w-6 text-green-600 dark:text-green-400' />
                <span className='text-sm font-medium text-green-700 dark:text-green-300'>
                  {selectedFiles.length} file(s) ready to upload
                </span>
                <ul className='max-h-24 w-full overflow-auto text-xs text-gray-600 dark:text-gray-300'>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center space-x-2'>
                <XMarkIcon className='h-6 w-6 text-red-600 dark:text-red-400' />
                <span className='text-sm font-medium text-red-700 dark:text-red-300'>
                  File(s) not uploaded
                </span>
              </div>
            ) : (
              <div className='font-medium text-gray-600 dark:text-gray-300'>
                Drop your files here or{' '}
                <span className='text-blue-600 dark:text-blue-400'>browse</span>
              </div>
            )}
            <input
              id='fileInput'
              type='file'
              multiple
              accept='.pdf,.doc,.docx,.txt,.md,.json,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.svg,.mp4,.webm,.mov,.avi,.mpeg,.ogg,.mp3,.wav,.m4a,.flac,.aac,.wma,.opus'
              onChange={handleFileChange}
              className='hidden'
            />
            <span className='mt-2 block text-xs text-gray-500 dark:text-gray-400'>
              Maximum size per file: {MAX_FILE_SIZE_MB} MB
            </span>
          </div>
          {fileErrors.length > 0 && (
            <div className='text-center text-sm text-red-500 dark:text-red-400'>
              <p>Some files were discarded due to errors:</p>
              <ul className='max-h-24 w-full list-inside list-disc overflow-auto'>
                {fileErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
            <span>
              Chunk size: {chunkSettings?.chunkSize ?? 1000}, overlap:{' '}
              {chunkSettings?.overlapSize ?? 20}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  className='rounded-md p-1 hover:bg-gray-200 dark:hover:bg-white/10'
                  aria-label='Learn about chunking'
                >
                  <Info className='h-4 w-4' />
                </button>
              </PopoverTrigger>
              <PopoverContent className='w-64 space-y-2 text-xs' align='end'>
                <p>
                  Files are split into overlapping chunks to improve recall
                  during search.
                </p>
                <ul className='list-disc space-y-1 pl-4'>
                  <li>
                    <span className='font-medium'>Chunk size:</span> number of
                    characters in each piece.
                  </li>
                  <li>
                    <span className='font-medium'>Overlap:</span> characters
                    carried into the next chunk to keep context.
                  </li>
                </ul>
                <p>Adjust the values with the gear icon before uploading.</p>
              </PopoverContent>
            </Popover>
          </div>
          {error && (
            <div className='text-center text-sm text-red-500 dark:text-red-400'>
              {error}
            </div>
          )}
        </div>

        <DialogFooter className='flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              setSelectedFiles([])
              setFileErrors([])
              dispatch(closeModal())
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadClick}
            disabled={selectedFiles.length === 0 || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FileUploadModal
