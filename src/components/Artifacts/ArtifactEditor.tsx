import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateArtifactContent } from '@/redux/asyncThunks/artifact'
import type { AppDispatch } from '@/redux/store'
import { cn } from '@/lib/utils'

interface ArtifactEditorProps {
  artifactId: number
  initialContent: string
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
  onClose,
  onSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  useEffect(() => {
    setHasChanges(content !== initialContent)
  }, [content, initialContent])

  // Handle Escape key
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
  }, [isSaving, hasChanges, content])

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
      <div className='flex h-[90vh] w-[90vw] max-w-4xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-900'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Edit Artifact
            {hasChanges && (
              <span className='ml-2 text-sm font-normal text-amber-500'>
                (unsaved changes)
              </span>
            )}
          </h2>
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

        {/* Editor */}
        <div className='flex-1 overflow-hidden p-4'>
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
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Saving will create a new version. Press{' '}
            <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700'>
              Cmd+S
            </kbd>{' '}
            to save.
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
