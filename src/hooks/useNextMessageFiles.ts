import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import type { Message } from '@/redux/types/conversation'
import { filesReadInFull } from '@/utils/usageDetails'
import { type SourceSizeState, useSourceSize } from './useSourceSize'

const NO_FOLDERS: number[] = []

const isCounting = (ids: number[], size: SourceSizeState) =>
  ids.length > 0 &&
  (size.status === 'idle' ||
    size.status === 'loading' ||
    (size.status === 'ready' && size.refreshing))

const tokensOf = (ids: number[], size: SourceSizeState) =>
  ids.length > 0 && size.status === 'ready' ? size.size.estimatedTokens : 0

/**
 * Files read in full go out with every message, so the next prompt changes
 * only by the picked files the last reply did not read, minus those it did
 * read that are no longer picked.
 */
export const useNextMessageFiles = (lastReply: Message | undefined) => {
  const selectedFiles = useAppSelector(
    (state) => state.conversation.selectedFiles
  )
  const modelRef = useAppSelector((state) => state.conversation.selectedModel)
  const { addedIds, removedIds } = useMemo(() => {
    const read = filesReadInFull(lastReply)
    if (!read) return { addedIds: [], removedIds: [] }
    const picked = new Set(selectedFiles.map((file) => file.id))
    return {
      addedIds: [...picked].filter((id) => !read.has(id)),
      removedIds: [...read].filter((id) => !picked.has(id)),
    }
  }, [lastReply, selectedFiles])
  const addedSize = useSourceSize(addedIds, NO_FOLDERS, modelRef)
  const removedSize = useSourceSize(removedIds, NO_FOLDERS, modelRef)

  const counting =
    isCounting(addedIds, addedSize) || isCounting(removedIds, removedSize)
  return {
    counting,
    added: counting ? 0 : tokensOf(addedIds, addedSize),
    removed: counting ? 0 : tokensOf(removedIds, removedSize),
    estimated:
      !counting &&
      [addedSize, removedSize].some(
        (size) => size.status === 'ready' && size.size.estimated
      ),
  }
}
