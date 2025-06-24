import React, { useState, useEffect } from 'react'
import { Prompt } from '@/redux/types/prompt'
import { formatDate } from '../../utils/constants/prompts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Label } from '../ui/label'

interface PromptVersionHistoryModalProps {
  versions: Prompt[]
  isOpen: boolean
  onClose: () => void
}

const PromptVersionHistoryModal: React.FC<PromptVersionHistoryModalProps> = ({
  versions,
  isOpen,
  onClose,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<Prompt | null>(null)

  useEffect(() => {
    if (isOpen && versions.length > 0) {
      setSelectedVersion(versions[0])
    } else {
      setSelectedVersion(null)
    }
  }, [isOpen, versions])

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const versionId = e.target.value
    const version = versions.find((v) => v.id == versionId)
    if (version) {
      setSelectedVersion(version)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-dark-chat-history mx-auto w-[90vw] max-w-2xl rounded-lg bg-white p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-gray-900 dark:text-white'>
            Version History
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500 dark:text-dark-icon-unselected'>
            View the version history of this prompt.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='version-select'>Select Version</Label>
            <select
              id='version-select'
              value={selectedVersion?.id || ''}
              onChange={handleVersionChange}
              className='w-full rounded-md border p-2'
            >
              {versions.length === 0 ? (
                <option value='' disabled>
                  No versions available
                </option>
              ) : (
                versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.title || 'Untitled'} (v{version.version || 1}) -{' '}
                    {formatDate(version.createdAt)}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedVersion ? (
            <div className='space-y-2'>
              <div>
                <Label>Title</Label>
                <p className='rounded-md border bg-gray-100 p-2'>
                  {selectedVersion.title || 'Untitled'}
                </p>
              </div>
              <div>
                <Label>Content</Label>
                <div
                  className='max-h-[50vh] overflow-y-scroll rounded-md border bg-gray-100 p-2'
                  dangerouslySetInnerHTML={{
                    __html: selectedVersion.content || 'No content',
                  }}
                />
              </div>
              <div>
                <Label>Version</Label>
                <p className='rounded-md border bg-gray-100 p-2'>
                  v{selectedVersion.version || 1}
                </p>
              </div>
              <div>
                <Label>Created At</Label>
                <p className='rounded-md border bg-gray-100 p-2'>
                  {formatDate(selectedVersion.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <p className='text-gray-500'>Select a version to view details.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromptVersionHistoryModal
