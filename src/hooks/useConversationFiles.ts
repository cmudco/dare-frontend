import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/redux/store'
import { loadSelectedFilesFromIds } from '@/redux/conversationSlice'
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

  const effectiveOwnerId = getConversationFileOwnerId(conversation)
  const { allFiles, ownerFiles, isLoading } = useOwnerFiles(
    files,
    effectiveOwnerId
  )

  useEffect(() => {
    if (conversation && allFiles.length > 0 && !isLoading) {
      dispatch(
        loadSelectedFilesFromIds({
          files: allFiles,
          selectedFileIds: conversation.selectedFileIds || [],
          selectedEmbeddingIds: conversation.selectedEmbeddingIds || [],
          selectedMediaIds: conversation.selectedMediaIds || [],
        })
      )
    }
  }, [conversation?.conversationId, allFiles, isLoading, dispatch])

  return { allFiles, ownerFiles, isLoading }
}
