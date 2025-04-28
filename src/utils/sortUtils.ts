import { FILE_TABLE_HEADER_TO_KEY } from '@/utils/constants/file'
import { PROMPT_TABLE_HEADER_TO_KEY } from '@/utils/constants/prompts'
import { getStatusDisplay } from '@/utils/constants/files'
import type { MyFile } from '@/redux/types/files'
import type { Tag } from '@/redux/types/tags'
import type { Prompt } from '@/redux/types/prompt'

export function getFileProp(
  col: string
): keyof MyFile | 'tags' | 'status' | null {
  return (
    (
      FILE_TABLE_HEADER_TO_KEY as Record<
        string,
        keyof MyFile | 'tags' | 'status' | null
      >
    )[col] ?? null
  )
}

export function sortFiles(
  files: MyFile[],
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc',
  allTags: Tag[]
): MyFile[] {
  if (!sortColumn) return files
  const prop = getFileProp(sortColumn)
  if (!prop) return files
  return [...files].sort((a, b) => {
    if (prop === 'tags') {
      const aLabels = (Array.isArray(a.tags) ? a.tags : [])
        .map(
          (id) => allTags.find((t) => t.id === id)?.label?.toLowerCase() || ''
        )
        .sort()
        .join(',')
      const bLabels = (Array.isArray(b.tags) ? b.tags : [])
        .map(
          (id) => allTags.find((t) => t.id === id)?.label?.toLowerCase() || ''
        )
        .sort()
        .join(',')
      if (aLabels < bLabels) return sortDirection === 'asc' ? -1 : 1
      if (aLabels > bLabels) return sortDirection === 'asc' ? 1 : -1
      return 0
    }
    if (prop === 'status') {
      const aStatus = getStatusDisplay(a.status)
      const bStatus = getStatusDisplay(b.status)
      if (aStatus < bStatus) return sortDirection === 'asc' ? -1 : 1
      if (aStatus > bStatus) return sortDirection === 'asc' ? 1 : -1
      return 0
    }
    const aValue = a[prop]
    const bValue = b[prop]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (aValue.toLowerCase() < bValue.toLowerCase())
        return sortDirection === 'asc' ? -1 : 1
      if (aValue.toLowerCase() > bValue.toLowerCase())
        return sortDirection === 'asc' ? 1 : -1
      return 0
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    }
    return 0
  })
}

export function getPromptProp(col: string): keyof Prompt | null {
  return (
    (PROMPT_TABLE_HEADER_TO_KEY as Record<string, keyof Prompt | null>)[col] ??
    null
  )
}

export function sortPrompts(
  prompts: Prompt[],
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc'
): Prompt[] {
  if (!sortColumn) return prompts
  const prop = getPromptProp(sortColumn)
  if (!prop) return prompts
  return [...prompts].sort((a, b) => {
    if (prop === 'createdAt') {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1
      if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1
      return 0
    }
    const aValue = a[prop]
    const bValue = b[prop]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (aValue.toLowerCase() < bValue.toLowerCase())
        return sortDirection === 'asc' ? -1 : 1
      if (aValue.toLowerCase() > bValue.toLowerCase())
        return sortDirection === 'asc' ? 1 : -1
      return 0
    }
    return 0
  })
}
