import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { deleteFile, getFolders } from '../../redux/asyncThunks/file'
import { addSelectedItem, removeSelectedItem } from '../../redux/fileSlice'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { TABLE_HEAD } from '../../utils/constants/file'
import { formatFileSize } from '@/utils/files'
import { SortDirection, sortFiles } from '@/utils/sortUtils'
import {
  filterFiles,
  paginateItems,
  getTotalPages,
  resetPaginationOnFilter,
  handleSelectAllItems,
  getSelectionState,
  createFilterConfig,
  createPaginationConfig,
} from '@/utils/tableUtils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { EllipsisVerticalIcon, Trash2, Tag, Eye } from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getStatusDisplay } from '@/utils/constants/files'
import { SortDirectionEnum } from '@/utils/constants/sort'
import FileTagModal from './FileTagModal'
import FileViewerModal from './FileViewerModal'
import TagsDisplay from './TagsDisplay'

const FileTable = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { files, loading, searchQuery, selectedTags, selectedItems } =
    useSelector((state: RootState) => state.files)
  const { tags: allTags } = useSelector((state: RootState) => state.tags)
  const user = useSelector((state: RootState) => state.user.user)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [deleteFileName, setDeleteFileName] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )
  const [tagFileId, setTagFileId] = useState<number | null>(null)
  const [tagFileName, setTagFileName] = useState<string>('')
  const [tagFileExistingTags, setTagFileExistingTags] = useState<number[]>([])
  const [viewFileId, setViewFileId] = useState<number | null>(null)
  const [viewFileName, setViewFileName] = useState<string>('')
  const [viewFileType, setViewFileType] = useState<string>('')

  const filteredFiles = useMemo(() => {
    if (!user || user.vectorDb === undefined) {
      return []
    }
    const filterOptions = createFilterConfig(
      searchQuery,
      selectedTags,
      user.vectorDb
    )
    return filterFiles(files, filterOptions)
  }, [files, searchQuery, selectedTags, user])

  const sortedFiles = useMemo(() => {
    return sortFiles(filteredFiles, sortColumn, sortDirection, allTags)
  }, [filteredFiles, sortColumn, sortDirection, allTags])

  const totalPages = getTotalPages(sortedFiles.length, itemsPerPage)
  const paginationConfig = createPaginationConfig(currentPage, itemsPerPage)
  const paginatedFiles = paginateItems(sortedFiles, paginationConfig)

  useEffect(() => {
    resetPaginationOnFilter(setCurrentPage)
  }, [searchQuery, selectedTags])

  const handleSelectAll = (isSelected: boolean) => {
    const shouldSelectAll = !isIndeterminate && isSelected
    handleSelectAllItems(
      shouldSelectAll,
      paginatedFiles,
      selectedItems,
      (id: number) => dispatch(addSelectedItem(id)),
      (id: number) => dispatch(removeSelectedItem(id))
    )
  }

  const { isAllSelected, isIndeterminate } = getSelectionState(
    paginatedFiles,
    selectedItems
  )

  const handleDeleteConfirm = async () => {
    if (deleteFileId !== null) {
      try {
        await dispatch(deleteFile(deleteFileId)).unwrap()
        dispatch(getFolders())
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    }
    setDeleteFileId(null)
  }

  const handleDelete = async (id: number, name: string) => {
    setDeleteFileId(id)
    setDeleteFileName(name || 'Unnamed')
  }

  const handleTag = (id: number, name: string, existingTags: number[]) => {
    setTagFileId(id)
    setTagFileName(name || 'Unnamed')
    setTagFileExistingTags(existingTags)
  }

  const handleView = (id: number, name: string, fileType: string) => {
    setViewFileId(id)
    setViewFileName(name || 'Unnamed')
    setViewFileType(fileType || '')
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) =>
        prev === SortDirectionEnum.ASC
          ? SortDirectionEnum.DESC
          : SortDirectionEnum.ASC
      )
    } else {
      setSortColumn(column)
      setSortDirection(SortDirectionEnum.ASC)
    }
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            <TableHead
              key='select-all'
              className='w-[50px] cursor-pointer select-none p-4 text-sm font-semibold transition-colors dark:text-white'
            >
              <div className='flex items-center justify-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate
                  }}
                />
              </div>
            </TableHead>
            {TABLE_HEAD.filter((head) => head !== 'Select').map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold transition-colors duration-150 dark:text-white ${head !== 'Action' ? 'hover:bg-gray-100 hover:opacity-100 dark:hover:bg-gray-700' : ''}`}
                onClick={() => head !== 'Action' && handleSort(head)}
              >
                <div className='flex items-center gap-2 opacity-70'>
                  {head}
                  {head !== 'Action' && (
                    <ChevronUpDownIcon
                      strokeWidth={2}
                      className={`h-4 w-4 ${sortColumn === head ? 'text-blue-500' : ''}`}
                      style={{
                        transform:
                          sortColumn === head &&
                          sortDirection === SortDirectionEnum.DESC
                            ? 'rotate(180deg)'
                            : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length + 1}
                className='p-4 text-center'
              >
                Loading files...
              </TableCell>
            </TableRow>
          ) : sortedFiles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length + 1}
                className='p-4 text-center'
              >
                No matching files found
              </TableCell>
            </TableRow>
          ) : (
            paginatedFiles.map(
              ({ id, name, fileType, size, tags, status, errorMessage }) => (
                <TableRow key={id}>
                  <TableCell className='w-[50px] p-4 text-center'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                      checked={selectedItems.includes(id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(addSelectedItem(id))
                        } else {
                          dispatch(removeSelectedItem(id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className='max-w-[250px] p-4'>
                    <div className='truncate' title={name || 'Unnamed'}>
                      {name || 'Unnamed'}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[150px] p-4'>
                    <div className='truncate' title={fileType || 'Unknown'}>
                      {fileType || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className='p-4'>{formatFileSize(size)}</TableCell>
                  <TableCell className='p-4'>
                    <TagsDisplay
                      tags={tags || []}
                      allTags={allTags}
                      fileId={id}
                      maxVisible={3}
                    />
                  </TableCell>
                  <TableCell className='p-4'>
                    {getStatusDisplay(status, errorMessage)}
                  </TableCell>
                  <TableCell className='p-4 text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='rounded-md p-2 hover:bg-gray-200'>
                        <EllipsisVerticalIcon className='h-4 w-4 text-gray-500' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleView(id, name, fileType)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleTag(id, name, tags || [])}
                        >
                          <Tag className='mr-2 h-4 w-4' />
                          <span>
                            {!Array.isArray(tags) || tags.length === 0
                              ? 'Add Tags'
                              : 'Edit Tags'}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer text-red-500'
                          onClick={() => handleDelete(id, name)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>

        {sortedFiles.length > 0 && (
          <TableFooter>
            <TableRow className='dark:bg-gray-800/50'>
              <TableCell
                colSpan={TABLE_HEAD.length + 1}
                className='w-full p-4 dark:text-white'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm dark:text-white'>
                      Rows per page:
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className='w-[80px] bg-background dark:border-gray-700 dark:text-white'>
                        <SelectValue placeholder='Rows' />
                      </SelectTrigger>
                      <SelectContent className='bg-background dark:border-gray-700'>
                        <SelectItem
                          value='5'
                          className='dark:text-white dark:hover:bg-white/10'
                        >
                          5
                        </SelectItem>
                        <SelectItem
                          value='10'
                          className='dark:text-white dark:hover:bg-white/10'
                        >
                          10
                        </SelectItem>
                        <SelectItem
                          value='20'
                          className='dark:text-white dark:hover:bg-white/10'
                        >
                          20
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Button
                      variant='secondary'
                      size='sm'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className='text-sm dark:text-white'>
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button
                      variant='secondary'
                      size='sm'
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <DeleteConfirmation
        isOpen={deleteFileId !== null}
        onClose={() => setDeleteFileId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete File'
        description='Are you sure you want to delete this file? This action cannot be undone.'
        itemName={deleteFileName}
        confirmText='Delete'
      />

      <FileTagModal
        isOpen={tagFileId !== null}
        onClose={() => setTagFileId(null)}
        fileId={tagFileId}
        fileName={tagFileName}
        existingTags={tagFileExistingTags}
      />

      <FileViewerModal
        isOpen={viewFileId !== null}
        onClose={() => setViewFileId(null)}
        fileId={viewFileId}
        fileName={viewFileName}
        fileType={viewFileType}
      />
    </div>
  )
}

export default FileTable
