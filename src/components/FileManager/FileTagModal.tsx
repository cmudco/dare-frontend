import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { updateFileTags } from '../../redux/asyncThunks/file'
import { addTag, getTags } from '../../redux/asyncThunks/tag'
import { XMarkIcon } from '@heroicons/react/24/solid'

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
import { getTagColor } from '@/utils/files'

interface FileTagModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: number | null
  fileName: string
  existingTags: number[]
}

const FileTagModal: React.FC<FileTagModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
  existingTags,
}) => {
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [newTag, setNewTag] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()

  const { loading, error } = useSelector((state: RootState) => state.files)
  const { tags } = useSelector((state: RootState) => state.tags)

  useEffect(() => {
    dispatch(getTags())
  }, [dispatch])

  useEffect(() => {
    if (isOpen && existingTags) {
      setSelectedTags([...existingTags])
    }
  }, [isOpen, existingTags])

  const handleAddTag = (tagId: number) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId))
  }

  const handleCreateTag = () => {
    if (newTag.trim() !== '') {
      dispatch(addTag(newTag))
      setNewTag('')
    }
  }

  const handleSave = async () => {
    if (fileId !== null) {
      try {
        await dispatch(
          updateFileTags({ fileId, tagIds: selectedTags })
        ).unwrap()
        onClose()
      } catch (error) {
        console.error('Failed to update file tags:', error)
      }
    }
  }

  const handleClose = () => {
    setSelectedTags([])
    setNewTag('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='mx-auto w-[90vw] max-w-md rounded-lg bg-background bg-white p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-gray-900 dark:text-white'>
            {existingTags.length > 0 ? 'Edit Tags' : 'Add Tags'}
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500 dark:text-dark-icon-unselected'>
            {existingTags.length > 0 ? 'Edit tags for' : 'Add tags to'} "
            {fileName}"
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex flex-col gap-2'>
            <Select onValueChange={(value) => handleAddTag(parseInt(value))}>
              <SelectTrigger className='w-full bg-background dark:border-gray-700 dark:text-white'>
                <SelectValue placeholder='Add Tags' />
              </SelectTrigger>
              <SelectContent className='bg-background dark:border-gray-700'>
                {Array.isArray(tags) && tags.length > 0 ? (
                  tags
                    .filter((tag) => !selectedTags.includes(tag.id))
                    .map((tag) => (
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
                      onClick={() => handleRemoveTag(tagId)}
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

          {error && (
            <div className='text-center text-sm text-red-500 dark:text-red-400'>
              {error}
            </div>
          )}
        </div>

        <DialogFooter className='flex justify-end gap-2'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FileTagModal
