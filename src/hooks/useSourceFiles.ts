import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { selectFoldersByFileId, selectLibraryFiles } from '@/redux/fileSlice'
import { MyFile, MyFolder, SourceLocation } from '@/redux/types/files'
import { needsAttention } from '@/utils/files'
import { createFilterConfig, filterFiles } from '@/utils/tableUtils'

const isInLocation = (
  file: MyFile,
  location: SourceLocation,
  foldersByFile: Map<number, MyFolder[]>
): boolean => {
  switch (location.kind) {
    case 'unfiled':
      return !foldersByFile.has(file.id)
    case 'attention':
      return needsAttention(file)
    case 'folder':
      return !!foldersByFile
        .get(file.id)
        ?.some((folder) => folder.id === location.folderId)
    default:
      return true
  }
}

/** Library files at a location, narrowed by the toolbar filters, newest first.
 *  Search matches file names and tag labels. */
export const useSourceFiles = (location: SourceLocation): MyFile[] => {
  const files = useAppSelector(selectLibraryFiles)
  const foldersByFile = useAppSelector(selectFoldersByFileId)
  const tags = useAppSelector((state) => state.tags.tags)
  const { searchQuery, selectedTags, mediaTypeFilter } = useAppSelector(
    (state) => state.files
  )

  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const tagLabels = new Map(tags.map((tag) => [tag.id, tag.label]))
    const matchesQuery = (file: MyFile) =>
      !query ||
      file.name.toLowerCase().includes(query) ||
      file.tags.some((id) => tagLabels.get(id)?.toLowerCase().includes(query))

    return filterFiles(
      files,
      createFilterConfig('', selectedTags, undefined, mediaTypeFilter)
    )
      .filter(
        (file) =>
          isInLocation(file, location, foldersByFile) && matchesQuery(file)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [
    files,
    foldersByFile,
    tags,
    searchQuery,
    selectedTags,
    mediaTypeFilter,
    location,
  ])
}
