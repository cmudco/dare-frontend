import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { setActiveArtifact, openSidecar } from '@/redux/artifactSlice'
import {
  fetchConversationArtifacts,
  fetchArtifactById,
} from '@/redux/asyncThunks/artifact'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  FileText,
  Code,
  GitBranch,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Artifact, ArtifactType } from '@/redux/types/artifact'

interface ArtifactGroup {
  groupId: string | undefined
  baseTitle: string
  versions: Artifact[]
}

interface ArtifactHistoryDropdownProps {
  currentArtifact: Artifact
}

const ArtifactHistoryDropdown: React.FC<ArtifactHistoryDropdownProps> = ({
  currentArtifact,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const conversationId = useSelector(
    (state: RootState) => state.conversation.activeConversation?.conversationId
  )
  const { artifacts, activeArtifactId } = useSelector(
    (state: RootState) => state.artifact
  )

  // Fetch artifacts when dropdown opens
  useEffect(() => {
    if (isOpen && conversationId) {
      setIsLoading(true)
      dispatch(fetchConversationArtifacts({ conversationId })).finally(() => {
        setIsLoading(false)
      })
    }
  }, [isOpen, conversationId, dispatch])

  // Group artifacts by artifactGroupId
  const groupedArtifacts = useMemo(() => {
    const artifactList = Object.values(artifacts)
    const groups: Map<string, ArtifactGroup> = new Map()
    const standaloneArtifacts: Artifact[] = []

    artifactList.forEach((artifact) => {
      if (artifact.artifactGroupId != null) {
        const groupKey = String(artifact.artifactGroupId)
        const existingGroup = groups.get(groupKey)
        if (existingGroup) {
          existingGroup.versions.push(artifact)
        } else {
          groups.set(groupKey, {
            groupId: groupKey,
            baseTitle: artifact.title,
            versions: [artifact],
          })
        }
      } else {
        standaloneArtifacts.push(artifact)
      }
    })

    // Sort versions within each group
    groups.forEach((group) => {
      group.versions.sort((a, b) => (a.version || 1) - (b.version || 1))
      // Use the first version's title as base title
      if (group.versions.length > 0) {
        group.baseTitle = group.versions[0].title
      }
    })

    return {
      groups: Array.from(groups.values()),
      standalone: standaloneArtifacts,
    }
  }, [artifacts])

  const handleSelectArtifact = async (artifact: Artifact) => {
    // If artifact content is not loaded (empty), fetch it
    if (!artifact.content && conversationId) {
      try {
        await dispatch(
          fetchArtifactById({
            conversationId,
            artifactId: artifact.id,
          })
        ).unwrap()
      } catch (error) {
        console.error('Failed to fetch artifact:', error)
      }
    }

    dispatch(setActiveArtifact(artifact.id))
    dispatch(openSidecar())
    setIsOpen(false)
  }

  const getArtifactIcon = (artifactType: ArtifactType) => {
    switch (artifactType) {
      case 'code':
        return <Code className='h-4 w-4' />
      case 'diagram':
        return <GitBranch className='h-4 w-4' />
      default:
        return <FileText className='h-4 w-4' />
    }
  }

  const getStatusDot = (status: Artifact['status']) => {
    const statusColors: Record<Artifact['status'], string> = {
      planning: 'bg-blue-500',
      generating: 'bg-green-500 animate-pulse',
      paused: 'bg-yellow-500',
      completed: 'bg-emerald-500',
      error: 'bg-red-500',
    }
    return <span className={cn('h-2 w-2 rounded-full', statusColors[status])} />
  }

  const totalArtifacts =
    groupedArtifacts.groups.reduce((acc, g) => acc + g.versions.length, 0) +
    groupedArtifacts.standalone.length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500'
          )}
        >
          <h2 className='max-w-[300px] truncate text-base font-semibold text-gray-900 dark:text-white'>
            {currentArtifact.title || 'Untitled Artifact'}
          </h2>
          {currentArtifact.version > 1 && (
            <span className='rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
              v{currentArtifact.version}
            </span>
          )}
          <ChevronDown className='h-4 w-4 text-gray-500 dark:text-gray-400' />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='w-80'>
        <DropdownMenuLabel className='text-xs text-gray-500 dark:text-gray-400'>
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-3 w-3 animate-spin' />
              Loading artifacts...
            </span>
          ) : (
            `${totalArtifacts} artifact${totalArtifacts !== 1 ? 's' : ''} in this conversation`
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Grouped artifacts with versions */}
        {groupedArtifacts.groups.map((group) => (
          <React.Fragment key={group.groupId}>
            {group.versions.length === 1 ? (
              // Single version - show directly
              <DropdownMenuItem
                className='cursor-pointer gap-2'
                onClick={() => handleSelectArtifact(group.versions[0])}
              >
                {getArtifactIcon(group.versions[0].artifactType)}
                <span className='flex-1 truncate'>{group.baseTitle}</span>
                {getStatusDot(group.versions[0].status)}
                {group.versions[0].id === activeArtifactId && (
                  <Check className='h-4 w-4 text-purple-500' />
                )}
              </DropdownMenuItem>
            ) : (
              // Multiple versions - show nested menu
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className='cursor-pointer gap-2'>
                  {getArtifactIcon(group.versions[0].artifactType)}
                  <span className='flex-1 truncate'>{group.baseTitle}</span>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {group.versions.length} versions
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className='w-56'>
                  {group.versions.map((version) => (
                    <DropdownMenuItem
                      key={version.id}
                      className='cursor-pointer gap-2'
                      onClick={() => handleSelectArtifact(version)}
                    >
                      <span className='w-8 text-xs font-medium text-gray-500'>
                        v{version.version}
                      </span>
                      <span className='flex-1 truncate text-sm'>
                        {version.title}
                      </span>
                      {getStatusDot(version.status)}
                      {version.id === activeArtifactId && (
                        <Check className='h-4 w-4 text-purple-500' />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </React.Fragment>
        ))}

        {/* Standalone artifacts (no group) */}
        {groupedArtifacts.standalone.map((artifact) => (
          <DropdownMenuItem
            key={artifact.id}
            className='cursor-pointer gap-2'
            onClick={() => handleSelectArtifact(artifact)}
          >
            {getArtifactIcon(artifact.artifactType)}
            <span className='flex-1 truncate'>{artifact.title}</span>
            {getStatusDot(artifact.status)}
            {artifact.id === activeArtifactId && (
              <Check className='h-4 w-4 text-purple-500' />
            )}
          </DropdownMenuItem>
        ))}

        {/* Empty state */}
        {!isLoading && totalArtifacts === 0 && (
          <div className='px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
            No artifacts in this conversation
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ArtifactHistoryDropdown
