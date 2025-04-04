import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  resetSelectedTags,
  closeModal,
  updateTagChange,
  updateRemoveTag,
  updateFilename,
  setError,
} from '../../redux/fileSlice'
import { getFiles, uploadNewFile } from '../../redux/aynscThunks/file'
import { addTag, getTags } from '../../redux/aynscThunks/tag'
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

const FileUploadModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newTag, setNewTag] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(getTags())
  }, [dispatch])

  const { selectedTags, isModalOpen, filename, loading, error } = useSelector(
    (state: RootState) => state.files
  )
  const { tags } = useSelector((state: RootState) => state.tags)

  const handleUploadClick = async () => {
    if (selectedFile) {
      await dispatch(uploadNewFile({ files: [selectedFile], name: filename, tags: selectedTags })).unwrap();
      dispatch(resetSelectedTags());
      dispatch(closeModal());
      dispatch(getFiles());
      dispatch(updateFilename(""));
      setSelectedFile(null);
      dispatch(setError(""));
    } else {
      console.error('No file selected')
    }
  }

  const handleFileSelection = (file: File | undefined) => {
    if (file) {
      if (error) {
        dispatch(setError(''))
      }

      if (file.size > MAX_FILE_SIZE) {
        dispatch(
          setError(
            `File size exceeds ${MAX_FILE_SIZE_MB} MB. Please select a smaller file.`
          )
        )
        setSelectedFile(null)
        return
      }
      if (!isAllowedFileType(file)) {
        dispatch(
          setError(
            'File type not allowed. Allowed types are: docx, doc, pdf, txt, md, json'
          )
        )
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      dispatch(updateFilename(file.name))
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files?.[0])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFileSelection(event.dataTransfer.files?.[0])
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
          setSelectedFile(null);
          dispatch(closeModal());
        }
      }}
    >
      <DialogContent className="p-6 mx-auto w-[90vw] max-w-md bg-white rounded-lg shadow-lg">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            File Upload
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500'>
            Upload a file and add tags to categorize it.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Input
            value={filename}
            placeholder='File Name'
            onChange={(e) => dispatch(updateFilename(e.target.value))}
          />

          <div className='x-2 flex flex-col gap-2'>
            <Select
              onValueChange={(value) =>
                dispatch(updateTagChange(parseInt(value)))
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Add Tags' />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(tags) && tags.length > 0 ? (
                  tags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      {tag.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value='no-tags' disabled>
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
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } cursor-pointer rounded-lg p-4 text-center transition`}
            onClick={() => document.getElementById('fileInput')?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile && !error ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">{selectedFile.name} ready to upload</span>
              </div>
            ) : error && selectedFile ? (
              <div className="flex items-center justify-center space-x-2">
                <XMarkIcon className="w-6 h-6 text-red-600" />
                <span className="text-sm font-medium text-red-700">{selectedFile.name} not uploaded</span>
              </div>
            ) : (
              <div className='font-medium text-gray-600'>
                Drop your files here or{' '}
                <span className='text-blue-600'>browse</span>
              </div>
            )}
            <input
              id='fileInput'
              type='file'
              onChange={handleFileChange}
              className='hidden'
            />
            <span className='mt-2 block text-xs text-gray-500'>
              Maximum size: {MAX_FILE_SIZE_MB} MB
            </span>
          </div>
        </div>
        {error && (
          <div className='text-center text-sm text-red-500'>{error}</div>
        )}

        <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
            setSelectedFile(null);
            dispatch(closeModal());
            }}>
            Cancel
            </Button>
          <Button
            onClick={handleUploadClick}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FileUploadModal
