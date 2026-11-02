import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { selectProjectById } from '@/redux/projectSlice'
import { ProjectSourceMode } from '@/utils/constants/project'

export type ChatSourceMode = ProjectSourceMode | 'mixed'

/**
 * The active project chat's selected project files and how it uses them:
 * searched, read in full, or a mix the user picked file by file.
 */
export const useChatProjectSources = () => {
  const projectId = useAppSelector(
    (state) => state.conversation.activeConversation?.project ?? null
  )
  const project = useAppSelector((state) => selectProjectById(state, projectId))
  const folders = useAppSelector((state) => state.files.folders)
  const selectedFiles = useAppSelector(
    (state) => state.conversation.selectedFiles
  )
  const selectedEmbeddings = useAppSelector(
    (state) => state.conversation.selectedEmbeddings
  )

  return useMemo(() => {
    if (!project) return { fileIds: [], mode: null }
    const scope = new Set(project.fileIds)
    folders
      .filter((folder) => project.folderIds.includes(folder.id))
      .forEach((folder) => folder.files.forEach((file) => scope.add(file.id)))
    const full = selectedFiles.filter((file) => scope.has(file.id))
    const searched = selectedEmbeddings.filter((file) => scope.has(file.id))
    const fileIds = [...full, ...searched].map((file) => file.id)
    const mode: ChatSourceMode | null =
      fileIds.length === 0
        ? null
        : searched.length === 0
          ? ProjectSourceMode.FULL
          : full.length === 0
            ? ProjectSourceMode.SEARCH
            : 'mixed'
    return { fileIds, mode }
  }, [project, folders, selectedFiles, selectedEmbeddings])
}
