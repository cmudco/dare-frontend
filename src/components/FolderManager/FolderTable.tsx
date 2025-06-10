import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { SortDirection, sortFolders } from '@/utils/sortUtils'
import {
  filterFolders,
  paginateItems,
  getTotalPages,
  resetPaginationOnFilter,
  createPaginationConfig,
} from '@/utils/tableUtils'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { deleteFolder } from '../../redux/asyncThunks/file'
import { MyFolder } from '../../redux/types/files'

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
import {
  EllipsisVerticalIcon,
  FolderIcon,
  Edit3,
  Eye,
  Trash2,
} from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import EditFolderModal from './EditFolderModal'
import FolderFilesModal from './FolderFilesModal'
import { FOLDER_TABLE_HEAD } from '@/utils/constants/file'

const FolderTable = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { folders, loading, searchQuery } = useSelector(
    (state: RootState) => state.files
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null)
  const [deleteFolderName, setDeleteFolderName] = useState<string>('')
  const [editFolder, setEditFolder] = useState<{
    id: number
    name: string
  } | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<MyFolder | null>(null)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )

  const filteredFolders = useMemo(() => {
    return filterFolders(folders, searchQuery)
  }, [folders, searchQuery])

  const sortedFolders = useMemo(() => {
    return sortFolders(filteredFolders, sortColumn, sortDirection)
  }, [filteredFolders, sortColumn, sortDirection])

  const totalPages = getTotalPages(sortedFolders.length, itemsPerPage)
  const paginationConfig = createPaginationConfig(currentPage, itemsPerPage)
  const paginatedFolders = paginateItems(sortedFolders, paginationConfig)

  useEffect(() => {
    resetPaginationOnFilter(setCurrentPage)
  }, [searchQuery])

  const currentSelectedFolder = useMemo(() => {
    if (!selectedFolder) return null
    return folders.find((f) => f.id === selectedFolder.id) || selectedFolder
  }, [folders, selectedFolder])

  const handleDeleteConfirm = async () => {
    if (deleteFolderId !== null) {
      try {
        await dispatch(deleteFolder(deleteFolderId)).unwrap()
      } catch (error) {
        console.error('Failed to delete folder:', error)
      }
    }
    setDeleteFolderId(null)
  }

  const handleDelete = (id: number, name: string) => {
    setDeleteFolderId(id)
    setDeleteFolderName(name || 'Unnamed')
  }

  const handleEdit = (id: number, name: string) => {
    setEditFolder({ id, name })
  }

  const handleFolderClick = (folderId: number) => {
    const folder = folders.find((f) => f.id === folderId)
    if (folder) {
      setSelectedFolder(folder)
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const openFolderFilesModal = (folderId: number) => {
    const folder = folders.find((f) => f.id === folderId)
    if (folder) {
      setSelectedFolder(folder)
    }
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-white text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            {FOLDER_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold transition-colors duration-150 ${head !== 'Action' && head !== 'Select' ? 'hover:bg-gray-100 hover:opacity-100' : ''}`}
                onClick={() =>
                  head !== 'Action' && head !== 'Select' && handleSort(head)
                }
              >
                <div className='flex items-center gap-2 opacity-70'>
                  {head}
                  {head !== 'Action' && head !== 'Select' && (
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
          {folders.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={FOLDER_TABLE_HEAD.length}
                className='p-4 text-center'
              >
                Loading folders...
              </TableCell>
            </TableRow>
          ) : sortedFolders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={FOLDER_TABLE_HEAD.length}
                className='p-4 text-center'
              >
                No folders found
              </TableCell>
            </TableRow>
          ) : (
            paginatedFolders.map(({ id, name, updatedAt, files }) => {
              const fileCount = files?.length || 0
              const hasFiles = fileCount > 0

              return (
                <TableRow key={id}>
                  <TableCell className='p-4'>
                    <div className='flex items-center'>
                      <FolderIcon className='mr-2 h-5 w-5 text-blue-500' />
                      <span
                        className={`${hasFiles ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                        onClick={() => hasFiles && handleFolderClick(id)}
                      >
                        {name || 'Unnamed'}
                      </span>
                      {hasFiles && (
                        <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                          {fileCount} {fileCount === 1 ? 'file' : 'files'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='p-4'>{formatDate(updatedAt)}</TableCell>
                  <TableCell className='p-4 text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='rounded-md p-2 hover:bg-gray-200'>
                        <EllipsisVerticalIcon className='h-4 w-4 text-gray-500' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleEdit(id, name)}
                        >
                          <Edit3 className='mr-2 h-4 w-4' />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => openFolderFilesModal(id)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          <span>View Files</span>
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
            })
          )}
        </TableBody>

        {sortedFolders.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={FOLDER_TABLE_HEAD.length}
                className='w-full p-4'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm'>Rows per page:</span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className='w-[80px]'>
                        <SelectValue placeholder='Rows' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='5'>5</SelectItem>
                        <SelectItem value='10'>10</SelectItem>
                        <SelectItem value='20'>20</SelectItem>
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
                    <span className='text-sm'>
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
        isOpen={deleteFolderId !== null}
        onClose={() => setDeleteFolderId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete Folder'
        description='Are you sure you want to delete this folder? This action cannot be undone.'
        itemName={deleteFolderName}
        confirmText='Delete'
      />

      <EditFolderModal
        isOpen={editFolder !== null}
        onClose={() => setEditFolder(null)}
        folder={editFolder}
      />

      <FolderFilesModal
        isOpen={selectedFolder !== null}
        onClose={() => setSelectedFolder(null)}
        folder={currentSelectedFolder}
      />
    </div>
  )
}

export default FolderTable
