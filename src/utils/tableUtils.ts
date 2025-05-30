import { MyFile, MyFolder } from '@/redux/types/files'
import { VectorDbSource } from '@/utils/constants/user'

export interface FilterOptions {
  searchQuery: string
  selectedTags: number[]
  vectorDb?: VectorDbSource
}

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
}

export interface SortState {
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
}

export const filterFiles = (
  files: MyFile[],
  options: FilterOptions
): MyFile[] => {
  const { searchQuery, selectedTags, vectorDb } = options

  return files.filter((file) => {
    const fileName = file.name?.toLowerCase() || ''
    const matchesSearch =
      searchQuery === '' || fileName.includes(searchQuery.toLowerCase())

    const matchesTags =
      selectedTags.length === 0 ||
      (file.tags && file.tags.some((tagId) => selectedTags.includes(tagId)))

    const matchesVectorDb =
      vectorDb === undefined || file.vectorDbSource === vectorDb

    return matchesSearch && matchesTags && matchesVectorDb
  })
}

export const filterFolders = (
  folders: MyFolder[],
  searchQuery: string
): MyFolder[] => {
  if (!searchQuery) return folders

  return folders.filter((folder) => {
    const folderName = folder.name?.toLowerCase() || ''
    return folderName.includes(searchQuery.toLowerCase())
  })
}

export const paginateItems = <T>(
  items: T[],
  pagination: PaginationState
): T[] => {
  const { currentPage, itemsPerPage } = pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return items.slice(startIndex, endIndex)
}

export const getTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  return Math.ceil(totalItems / itemsPerPage)
}

export const resetPaginationOnFilter = (
  setCurrentPage: (page: number) => void
) => {
  setCurrentPage(1)
}

export const generatePageItems = () => [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
]

export const handleSelectAllItems = (
  isSelected: boolean,
  currentPageItems: { id: number }[],
  selectedItems: number[],
  onAdd: (id: number) => void,
  onRemove: (id: number) => void
) => {
  const currentPageIds = currentPageItems.map((item) => item.id)

  if (isSelected) {
    currentPageIds.forEach((id) => {
      if (!selectedItems.includes(id)) {
        onAdd(id)
      }
    })
  } else {
    currentPageIds.forEach((id) => {
      if (selectedItems.includes(id)) {
        onRemove(id)
      }
    })
  }
}

export const getSelectionState = (
  currentPageItems: { id: number }[],
  selectedItems: number[]
) => {
  const currentPageIds = currentPageItems.map((item) => item.id)
  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedItems.includes(id))
  const isIndeterminate =
    currentPageIds.some((id) => selectedItems.includes(id)) && !isAllSelected

  return { isAllSelected, isIndeterminate }
}

export const createFilterConfig = (
  searchQuery: string,
  selectedTags: number[] = [],
  vectorDb?: VectorDbSource
): FilterOptions => ({
  searchQuery,
  selectedTags,
  vectorDb,
})

export const createPaginationConfig = (
  currentPage: number,
  itemsPerPage: number
): PaginationState => ({
  currentPage,
  itemsPerPage,
})

export const createSortConfig = (
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc'
): SortState => ({
  sortColumn,
  sortDirection,
})

export const getFileIcon = (fileType: string) => {
  const icons: Record<string, string> = {
    'application/pdf': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '📝',
    'application/msword': '📝',
    'text/plain': '📝',
    'text/markdown': '📝',
    'application/json': '🗂️',
  }
  return icons[fileType] || '📄'
}

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const createTablePaginationProps = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => ({
  currentPage,
  totalPages: totalPages || 1,
  onPrevious: () => onPageChange(currentPage - 1),
  onNext: () => onPageChange(currentPage + 1),
  isPreviousDisabled: currentPage === 1,
  isNextDisabled: currentPage === totalPages || totalPages === 0,
})

export const getStandardTableItemsPerPageOptions = () => [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
]

export interface TableUtilsConfig<T> {
  items: T[]
  searchQuery?: string
  sortColumn?: string | null
  sortDirection?: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  filterFn?: (items: T[], query: string) => T[]
  sortFn?: (items: T[], column: string | null, direction: 'asc' | 'desc') => T[]
}

export const processTableData = <T>(config: TableUtilsConfig<T>) => {
  const {
    items,
    searchQuery = '',
    sortColumn = null,
    sortDirection = 'asc',
    currentPage,
    itemsPerPage,
    filterFn,
    sortFn,
  } = config

  let processedItems = items

  if (filterFn && searchQuery) {
    processedItems = filterFn(processedItems, searchQuery)
  }

  if (sortFn) {
    processedItems = sortFn(processedItems, sortColumn, sortDirection)
  }

  const totalPages = getTotalPages(processedItems.length, itemsPerPage)
  const paginationConfig = createPaginationConfig(currentPage, itemsPerPage)
  const paginatedItems = paginateItems(processedItems, paginationConfig)

  return {
    filteredItems: processedItems,
    paginatedItems,
    totalPages,
    totalCount: processedItems.length,
  }
}
