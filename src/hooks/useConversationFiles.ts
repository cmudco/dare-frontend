import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import {
  loadSelectedFilesFromIds,
  loadSelectedLibrariesFromIds,
} from '@/redux/conversationSlice'
import { selectLibraries, selectLibrariesLoaded } from '@/redux/librarySlice'
import { getSharedLibraries } from '@/redux/asyncThunks/library'
import { useOwnerFiles } from './useOwnerFiles'
import type { Conversation } from '@/redux/types/conversation'

/**
 * Resolves the effective file owner for a conversation.
 *
 * For forked conversations: fileOwnerId (original owner whose files are shared)
 * For shared/library conversations: ownerUserId (the publisher)
 */
export function getConversationFileOwnerId(
  conversation: Conversation | null
): number | null | undefined {
  return conversation?.fileOwnerId || conversation?.ownerUserId
}

interface UseConversationFilesResult {
  /** All files available for selection (user's + owner's, deduplicated) */
  allFiles: ReturnType<typeof useOwnerFiles>['allFiles']
  /** Owner-only files */
  ownerFiles: ReturnType<typeof useOwnerFiles>['ownerFiles']
  /** Whether owner files are still loading */
  isLoading: boolean
}

/**
 * Hook that handles the full file resolution flow for a conversation:
 * 1. Derives the effective file owner ID
 * 2. Fetches and merges owner files via useOwnerFiles
 * 3. Dispatches loadSelectedFilesFromIds once files are ready
 */
export function useConversationFiles(
  conversation: Conversation | null
): UseConversationFilesResult {
  const dispatch = useDispatch<AppDispatch>()
  const files = useSelector((state: RootState) => state.files.files)
  const libraries = useSelector(selectLibraries)
  const librariesLoaded = useSelector(selectLibrariesLoaded)

  const effectiveOwnerId = getConversationFileOwnerId(conversation)
  const { allFiles, ownerFiles, isLoading } = useOwnerFiles(
    files,
    effectiveOwnerId
  )

  const conversationId = conversation?.conversationId
  const selectedFileIds = conversation?.selectedFileIds
  const selectedEmbeddingIds = conversation?.selectedEmbeddingIds
  const selectedMediaIds = conversation?.selectedMediaIds
  const selectedLibraryIds = conversation?.selectedLibraryIds

  useEffect(() => {
    if (conversationId && allFiles.length > 0 && !isLoading) {
      dispatch(
        loadSelectedFilesFromIds({
          files: allFiles,
          selectedFileIds: selectedFileIds || [],
          selectedEmbeddingIds: selectedEmbeddingIds || [],
          selectedMediaIds: selectedMediaIds || [],
        })
      )
    }
  }, [
    conversationId,
    selectedFileIds,
    selectedEmbeddingIds,
    selectedMediaIds,
    allFiles,
    isLoading,
    dispatch,
  ])

  // Re-hydrate selected shared libraries once the catalog is available.
  useEffect(() => {
    if (!librariesLoaded) {
      dispatch(getSharedLibraries())
      return
    }
    if (conversationId) {
      dispatch(
        loadSelectedLibrariesFromIds({
          libraries,
          selectedLibraryIds: selectedLibraryIds || [],
        })
      )
    }
  }, [conversationId, selectedLibraryIds, librariesLoaded, libraries, dispatch])

  return { allFiles, ownerFiles, isLoading }
}
