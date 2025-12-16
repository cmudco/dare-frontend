import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { X, Save, Loader2, FileEdit, FileSearch, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateArtifactContent } from '@/redux/asyncThunks/artifact'
import type { AppDispatch } from '@/redux/store'
import type { ArtifactType } from '@/redux/types/artifact'
import { cn } from '@/lib/utils'
import ArtifactDiffView from './ArtifactDiffView'
import ArtifactContent from './ArtifactContent'

interface ArtifactEditorProps {
  artifactId: number
  initialContent: string
  artifactType?: ArtifactType
  language?: string
  onClose: () => void
  onSaved?: (newArtifactId: number) => void
}

/**
 * Modal for manually editing artifact content.
 *
 * Creates a new version when saved to preserve history.
 */
const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
  artifactId,
  initialContent,
  artifactType = 'document',
  language,
  onClose,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'diff'>('edit')

  // Track changes
  useEffect(() => {
    setHasChanges(content !== initialContent)
  }, [content, initialContent])

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return

    setIsSaving(true)
    try {
      const result = await dispatch(
        updateArtifactContent({ artifactId, content })
      ).unwrap()
      onSaved?.(result.id)
      onClose()
    } catch (error) {
      console.error('Failed to save artifact:', error)
      // Could show a toast here
    } finally {
      setIsSaving(false)
    }
  }, [dispatch, artifactId, content, hasChanges, isSaving, onSaved, onClose])

  // Handle Escape key and Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose()
      }
      // Cmd/Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges && !isSaving) {
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, hasChanges, handleSave, onClose])

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Discard them?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }, [hasChanges, onClose])

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='flex h-[95vh] w-[95vw] max-w-7xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-900'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Edit Artifact
              {hasChanges && (
                <span className='ml-2 text-sm font-normal text-amber-500'>
                  (unsaved changes)
                </span>
              )}
            </h2>
            {/* View Mode Toggle */}
            <div className='flex items-center rounded-lg border border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setViewMode('edit')}
                className={cn(
                  'rounded-r-none border-r',
                  viewMode === 'edit'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                disabled={isSaving}
              >
                <FileEdit className='mr-1.5 h-4 w-4' />
                Edit
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setViewMode('preview')}
                className={cn(
                  'rounded-none border-r',
                  viewMode === 'preview'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                disabled={isSaving}
              >
                <Eye className='mr-1.5 h-4 w-4' />
                Preview
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setViewMode('diff')}
                className={cn(
                  'rounded-l-none',
                  viewMode === 'diff'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                disabled={isSaving || !hasChanges}
              >
                <FileSearch className='mr-1.5 h-4 w-4' />
                Diff
              </Button>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClose}
              disabled={isSaving}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Editor / Preview / Diff Viewer */}
        <div className='flex-1 overflow-hidden p-4'>
          {viewMode === 'edit' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(
                'h-full w-full resize-none rounded-lg border p-4',
                'bg-gray-50 font-mono text-sm dark:bg-gray-800',
                'border-gray-200 dark:border-gray-700',
                'text-gray-900 dark:text-gray-100',
                'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              )}
              placeholder='Enter markdown content...'
              disabled={isSaving}
            />
          ) : viewMode === 'preview' ? (
            <div className='h-full overflow-auto rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900'>
              <ArtifactContent
                content={content}
                outline=''
                artifactType={artifactType || 'document'}
                language={language}
                status='completed'
              />
            </div>
          ) : (
            <div className='h-full overflow-auto'>
              <ArtifactDiffView
                oldContent={initialContent}
                newContent={content}
                oldTitle='Original Version'
                newTitle='Your Changes'
                splitView={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {viewMode === 'edit' ? (
              <>
                Saving will create a new version. Press{' '}
                <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700'>
                  Cmd+S
                </kbd>{' '}
                to save.
              </>
            ) : viewMode === 'preview' ? (
              <>
                Preview how your markdown will be rendered. Switch to Edit mode
                to continue editing.
              </>
            ) : (
              <>
                Review your changes before saving. Switch to Edit mode to
                continue editing.
              </>
            )}
          </p>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Save as New Version
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtifactEditor
