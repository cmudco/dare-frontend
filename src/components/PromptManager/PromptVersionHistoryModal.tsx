import React, { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
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
import { useColorMode } from '@/hooks/useColorMode'
import { isHtmlContent, isPlainTextContent } from '@/utils/contentUtils'

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
  const colorMode = useColorMode()

  useEffect(() => {
    if (isOpen && versions.length > 0) {
      setSelectedVersion(versions[0])
    } else {
      setSelectedVersion(null)
    }
  }, [isOpen, versions])

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const versionId = e.target.value
    const version = versions.find((v) => v.id.toString() === versionId)
    if (version) {
      setSelectedVersion(version)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='mx-auto w-[90vw] max-w-2xl rounded-lg bg-card p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-foreground'>
            Version History
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
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
                <p className='rounded-md border bg-muted p-2'>
                  {selectedVersion.title || 'Untitled'}
                </p>
              </div>
              <div>
                <Label>Content</Label>
                <div className='max-h-[50vh] overflow-y-auto rounded-md border bg-muted p-2'>
                  {selectedVersion.content ? (
                    isHtmlContent(selectedVersion.content) ? (
                      <div
                        className='prose prose-sm max-w-none'
                        dangerouslySetInnerHTML={{
                          __html: selectedVersion.content,
                        }}
                      />
                    ) : isPlainTextContent(selectedVersion.content) ? (
                      <pre className='font-mono text-sm break-all whitespace-pre-wrap text-foreground'>
                        {selectedVersion.content}
                      </pre>
                    ) : (
                      <div data-color-mode={colorMode}>
                        <MDEditor.Markdown source={selectedVersion.content} />
                      </div>
                    )
                  ) : (
                    <span className='text-sm text-muted-foreground'>
                      No content
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label>Version</Label>
                <p className='rounded-md border bg-muted p-2'>
                  v{selectedVersion.version || 1}
                </p>
              </div>
              <div>
                <Label>Created At</Label>
                <p className='rounded-md border bg-muted p-2'>
                  {formatDate(selectedVersion.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground'>
              Select a version to view details.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromptVersionHistoryModal
