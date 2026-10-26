import type { Project } from '@/redux/types/project'
import { ProjectSourceMode } from '@/utils/constants/project'
import { useSourceSize } from './useSourceSize'

/**
 * The mode new project chats actually start in: full files fall back to
 * search once the project's files outgrow the full-file limit.
 */
export const useProjectSourceMode = (project: Project) => {
  const readsFull = project.sourceMode === ProjectSourceMode.FULL
  const sizeState = useSourceSize(
    readsFull ? project.fileIds : [],
    readsFull ? project.folderIds : []
  )
  const tooLargeTokens =
    sizeState.status === 'ready' && !sizeState.size.fitsFullFiles
      ? sizeState.size.estimatedTokens
      : null
  const effectiveMode =
    readsFull && tooLargeTokens === null
      ? ProjectSourceMode.FULL
      : ProjectSourceMode.SEARCH
  return { effectiveMode, tooLargeTokens }
}
