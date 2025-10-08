import { FILE_TABLE_HEADER_TO_KEY } from '@/utils/constants/file'
import { PROMPT_TABLE_HEADER_TO_KEY } from '@/utils/constants/prompts'
import { getStatusDisplay } from '@/utils/constants/files'
import type { MyFile, MyFolder } from '@/redux/types/files'
import type { Tag } from '@/redux/types/tags'
import type { Prompt } from '@/redux/types/prompt'
import { PromptGroup } from './constants/prompts'
import { Workflow, WorkflowMode } from '@/redux/types/workflow'
import { WORKFLOW_TABLE_HEADER_TO_KEY } from './constants/workflows'
import { getStepCount } from './workflowUtils'
import { SortDirectionEnum } from './constants/sort'

export type SortDirection = SortDirectionEnum

export const updateSortState = (
  clickedColumn: string,
  currentSortColumn: string | null,
  setSortColumn: React.Dispatch<React.SetStateAction<string | null>>,
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>
): void => {
  if (currentSortColumn === clickedColumn) {
    setSortDirection((prevDirection) =>
      prevDirection === SortDirectionEnum.ASC
        ? SortDirectionEnum.DESC
        : SortDirectionEnum.ASC
    )
  } else {
    setSortColumn(clickedColumn)
    setSortDirection(SortDirectionEnum.ASC)
  }
}

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

export function getFolderProp(col: string): keyof MyFolder | null {
  const FOLDER_TABLE_HEADER_TO_KEY = {
    'Folder Name': 'name',
    'Last Updated': 'updatedAt',
    Action: null,
  } as const

  return (
    (FOLDER_TABLE_HEADER_TO_KEY as Record<string, keyof MyFolder | null>)[
      col
    ] ?? null
  )
}

export function sortFiles(
  files: MyFile[],
  sortColumn: string | null,
  sortDirection: SortDirection,
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
      if (aLabels < bLabels)
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aLabels > bLabels)
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }
    if (prop === 'status') {
      const aStatus = getStatusDisplay(a.status)
      const bStatus = getStatusDisplay(b.status)
      if (aStatus < bStatus)
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aStatus > bStatus)
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }
    const aValue = a[prop]
    const bValue = b[prop]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (aValue.toLowerCase() < bValue.toLowerCase())
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aValue.toLowerCase() > bValue.toLowerCase())
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue)
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aValue > bValue)
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }
    return 0
  })
}

export function sortFolders(
  folders: MyFolder[],
  sortColumn: string | null,
  sortDirection: SortDirection
): MyFolder[] {
  if (!sortColumn) return folders
  const prop = getFolderProp(sortColumn)
  if (!prop) return folders

  return [...folders].sort((a, b) => {
    if (prop === 'name') {
      const aValue = a.name.toLowerCase()
      const bValue = b.name.toLowerCase()
      if (aValue < bValue)
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aValue > bValue)
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    if (prop === 'updatedAt') {
      const aDate = new Date(a.updatedAt).getTime()
      const bDate = new Date(b.updatedAt).getTime()
      if (aDate < bDate) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aDate > bDate) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
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
  sortDirection: SortDirection
): Prompt[] {
  const sortedPrompts = [...prompts]
  if (!sortColumn) {
    return sortedPrompts.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
  }
  const prop = getPromptProp(sortColumn)
  if (!prop) return sortedPrompts
  return sortedPrompts.sort((a, b) => {
    if (prop === 'createdAt') {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (aDate < bDate) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aDate > bDate) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }
    const aValue = a[prop]
    const bValue = b[prop]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (aValue.toLowerCase() < bValue.toLowerCase())
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aValue.toLowerCase() > bValue.toLowerCase())
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }
    return 0
  })
}

export function sortPromptGroups(
  groups: PromptGroup[],
  sortColumn: string | null,
  sortDirection: SortDirection
): PromptGroup[] {
  const sortedGroups = [...groups]
  if (!sortColumn) {
    return sortedGroups.sort((a, b) => {
      const aDate = a.rootPrompt.createdAt
        ? new Date(a.rootPrompt.createdAt).getTime()
        : 0
      const bDate = b.rootPrompt.createdAt
        ? new Date(b.rootPrompt.createdAt).getTime()
        : 0
      return bDate - aDate
    })
  }

  const prop = getPromptProp(sortColumn)
  if (!prop) return sortedGroups

  return sortedGroups.sort((a, b) => {
    const aVal = a.rootPrompt[prop]
    const bVal = b.rootPrompt[prop]

    if (prop === 'createdAt') {
      const aDate = aVal ? new Date(aVal as string).getTime() : 0
      const bDate = bVal ? new Date(bVal as string).getTime() : 0
      if (aDate < bDate) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aDate > bDate) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    const aValueString = String(
      aVal === null || aVal === undefined ? '' : aVal
    ).toLowerCase()
    const bValueString = String(
      bVal === null || bVal === undefined ? '' : bVal
    ).toLowerCase()

    const comparison = aValueString.localeCompare(bValueString)
    return sortDirection === SortDirectionEnum.ASC ? comparison : -comparison
  })
}

export function getWorkflowProp(col: string): keyof Workflow | 'steps' | null {
  return (
    (
      WORKFLOW_TABLE_HEADER_TO_KEY as Record<
        string,
        keyof Workflow | 'steps' | null
      >
    )[col] ?? null
  )
}

export function sortWorkflows(
  workflows: Workflow[],
  sortColumn: string | null,
  sortDirection: SortDirection
): Workflow[] {
  const sortedWorkflows = [...workflows]
  if (!sortColumn) {
    return sortedWorkflows.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
  }

  const prop = getWorkflowProp(sortColumn)
  if (!prop) return sortedWorkflows

  return sortedWorkflows.sort((a, b) => {
    let aValue: string | number | undefined | null | WorkflowMode
    let bValue: string | number | undefined | null | WorkflowMode

    if (prop === 'steps') {
      aValue = getStepCount(a)
      bValue = getStepCount(b)
    } else if (prop === 'mode') {
      aValue = a.mode
      bValue = b.mode
    } else {
      if (prop in a && prop in b) {
        aValue = a[prop as keyof Workflow] as
          | string
          | number
          | undefined
          | null
          | WorkflowMode
        bValue = b[prop as keyof Workflow] as
          | string
          | number
          | undefined
          | null
          | WorkflowMode
      } else {
        return 0
      }
    }

    if (prop === 'createdAt') {
      const aDate = aValue ? new Date(aValue as string).getTime() : 0
      const bDate = bValue ? new Date(bValue as string).getTime() : 0
      if (aDate < bDate) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aDate > bDate) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue)
        return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aValue > bValue)
        return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    const aValueString = String(
      aValue === null || aValue === undefined ? '' : aValue
    ).toLowerCase()
    const bValueString = String(
      bValue === null || bValue === undefined ? '' : bValue
    ).toLowerCase()

    const comparison = aValueString.localeCompare(bValueString)
    return sortDirection === SortDirectionEnum.ASC ? comparison : -comparison
  })
}
