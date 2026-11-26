import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { supportsCodeSandbox } from '@/utils/modelConfigUtils'
import { useSourceSize } from './useSourceSize'

const NO_FOLDERS: number[] = []

/** The ticked files' size when they don't fit the chosen model, else null. */
export const useFilesTooLong = () => {
  const selectedFiles = useAppSelector(
    (state) => state.conversation.selectedFiles
  )
  const selectedModel = useAppSelector(
    (state) => state.conversation.selectedModel
  )
  // With Code sandbox on, files go to the sandbox instead of the prompt.
  const sandboxTakesFiles = useAppSelector(
    (state) =>
      (state.conversation.activeConversation?.codeSandboxEnabled ??
        state.conversation.codeSandboxEnabled) &&
      supportsCodeSandbox(
        state.conversation.pickerEntries.find(
          (entry) => entry.id === state.conversation.selectedModel
        ),
        state.conversation.activeWalletMeta
      )
  )
  const fileIds = useMemo(
    () => selectedFiles.map((file) => file.id),
    [selectedFiles]
  )
  const size = useSourceSize(fileIds, NO_FOLDERS, selectedModel)
  return !sandboxTakesFiles &&
    size.status === 'ready' &&
    !size.refreshing &&
    !size.size.fitsFullFiles
    ? size.size
    : null
}
