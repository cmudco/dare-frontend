import React, { useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { closeSidecar, setActiveArtifact } from '@/redux/artifactSlice'
import { continueArtifact } from '@/redux/asyncThunks/websocket'
import { pauseArtifact } from '@/redux/asyncThunks/artifact'
import ArtifactProgress from './ArtifactProgress'
import ArtifactContent, { ArtifactContentRef } from './ArtifactContent'
import ArtifactActions from './ArtifactActions'
import ArtifactHistoryDropdown from './ArtifactHistoryDropdown'
import ArtifactEditor from './ArtifactEditor'
import { X, FileText, Code, GitBranch, Minimize2, Pencil } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

const ArtifactSidecar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const contentRef = useRef<ArtifactContentRef>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { artifacts, activeArtifactId, sidecarOpen, pausingArtifactId } =
    useSelector((state: RootState) => state.artifact)

  const activeArtifact = activeArtifactId ? artifacts[activeArtifactId] : null

  // Handle section navigation click from progress indicators
  const handleSectionClick = (sectionIndex: number) => {
    contentRef.current?.scrollToSection(sectionIndex)
  }

  const handleClose = () => {
    dispatch(closeSidecar())
  }

  const handlePause = () => {
    if (activeArtifactId) {
      dispatch(pauseArtifact({ artifactId: activeArtifactId }))
    }
  }

  const handleContinue = () => {
    if (activeArtifactId) {
      dispatch(continueArtifact({ artifactId: activeArtifactId }))
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEditorClose = () => {
    setIsEditing(false)
  }

  const handleEditorSaved = (newArtifactId: number) => {
    // Switch to the new version
    dispatch(setActiveArtifact(newArtifactId))
    setIsEditing(false)
  }

  const getArtifactIcon = () => {
    switch (activeArtifact?.artifactType) {
      case 'code':
        return <Code className='h-5 w-5' />
      case 'diagram':
        return <GitBranch className='h-5 w-5' />
      default:
        return <FileText className='h-5 w-5' />
    }
  }

  const getStatusBadge = () => {
    if (!activeArtifact) return null

    const statusConfig = {
      planning: {
        text: 'Planning',
        className:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      },
      generating: {
        text: 'Generating',
        className:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse',
      },
      paused: {
        text: 'Paused',
        className:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      completed: {
        text: 'Completed',
        className:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      },
      error: {
        text: 'Error',
        className:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
    }

    const config = statusConfig[activeArtifact.status]
    return (
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          config.className
        )}
      >
        {config.text}
      </span>
    )
  }

  // Can edit when artifact is completed or paused
  const canEdit =
    activeArtifact &&
    (activeArtifact.status === 'completed' ||
      activeArtifact.status === 'paused')

  if (!sidecarOpen || !activeArtifact) {
    return null
  }

  return (
    <>
      <div
        className={cn(
          'flex h-full w-[600px] shrink-0 flex-col',
          'border-l border-gray-200 bg-white',
          'dark:border-gray-700 dark:bg-dark-bg'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
              {getArtifactIcon()}
            </div>
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                <ArtifactHistoryDropdown currentArtifact={activeArtifact} />
                {getStatusBadge()}
              </div>
              {activeArtifact.language && (
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {activeArtifact.language}
                </span>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {/* Edit Button */}
            {canEdit && (
              <Button
                variant='ghost'
                size='icon'
                onClick={handleEdit}
                className='h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                title='Edit artifact'
              >
                <Pencil className='h-4 w-4' />
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={handleClose}
              className='h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              title='Minimize'
            >
              <Minimize2 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleClose}
              className='h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              title='Close'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <ArtifactProgress
          progress={activeArtifact.progress}
          currentSection={activeArtifact.currentSection}
          totalSections={activeArtifact.estimatedSections}
          status={activeArtifact.status}
          outline={activeArtifact.outline}
          onSectionClick={handleSectionClick}
        />

        {/* Content Area */}
        <div className='flex-1 overflow-y-auto'>
          <ArtifactContent
            ref={contentRef}
            content={activeArtifact.content}
            outline={activeArtifact.outline}
            artifactType={activeArtifact.artifactType}
            language={activeArtifact.language}
            status={activeArtifact.status}
          />
        </div>

        {/* Error Message */}
        {activeArtifact.status === 'error' && activeArtifact.error && (
          <div className='border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20'>
            <p className='text-sm text-red-700 dark:text-red-400'>
              {activeArtifact.error}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className='flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            {activeArtifact.status === 'generating' && (
              <Button
                variant='outline'
                size='sm'
                onClick={handlePause}
                disabled={pausingArtifactId === activeArtifactId}
                className='text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
              >
                {pausingArtifactId === activeArtifactId
                  ? 'Pausing...'
                  : 'Pause Generation'}
              </Button>
            )}
            {activeArtifact.status === 'paused' && (
              <Button
                variant='default'
                size='sm'
                onClick={handleContinue}
                className='bg-green-600 text-white hover:bg-green-700'
              >
                Continue Generation
              </Button>
            )}
          </div>
          <ArtifactActions
            content={activeArtifact.content}
            title={activeArtifact.title}
            artifactType={activeArtifact.artifactType}
            language={activeArtifact.language}
            wordCount={activeArtifact.wordCount}
            disabled={activeArtifact.status === 'generating'}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && activeArtifact && (
        <ArtifactEditor
          artifactId={activeArtifact.id}
          initialContent={activeArtifact.content}
          artifactType={activeArtifact.artifactType}
          language={activeArtifact.language}
          onClose={handleEditorClose}
          onSaved={handleEditorSaved}
        />
      )}
    </>
  )
}

export default ArtifactSidecar
