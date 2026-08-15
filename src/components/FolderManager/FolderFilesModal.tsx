import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  deleteFile,
  getFolders,
  removeFileFromFolder,
} from '../../redux/asyncThunks/file'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { TABLE_HEAD } from '../../utils/constants/file'
import { formatFileSize } from '@/utils/files'
import { SortDirection, sortFiles } from '@/utils/sortUtils'
import {
  filterFiles,
  paginateItems,
  resetPaginationOnFilter,
  createFilterConfig,
  createPaginationConfig,
} from '@/utils/tableUtils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
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
import { EllipsisVerticalIcon, Trash2, FolderMinus } from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getStatusDisplay } from '@/utils/constants/files'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { MyFolder } from '@/redux/types/files'
import TagsDisplay from '../FileManager/TagsDisplay'

interface FolderFilesModalProps {
  isOpen: boolean
  onClose: () => void
  folder: MyFolder | null
}

const FolderFilesModal: React.FC<FolderFilesModalProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, searchQuery, selectedTags } = useSelector(
    (state: RootState) => state.files
  )
  const { tags: allTags } = useSelector((state: RootState) => state.tags)
  const user = useSelector((state: RootState) => state.user.user)

  const [currentPage, setCurrentPage] = useState(1)
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [deleteFileName, setDeleteFileName] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )

  const files = useMemo(() => folder?.files || [], [folder?.files])

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

  const itemsPerPage = 10
  const paginationConfig = createPaginationConfig(currentPage, itemsPerPage)
  const paginatedFiles = paginateItems(sortedFiles, paginationConfig)

  useEffect(() => {
    resetPaginationOnFilter(setCurrentPage)
  }, [searchQuery, selectedTags])

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

  const handleRemoveFromFolder = async (fileId: number) => {
    if (folder) {
      try {
        await dispatch(
          removeFileFromFolder({ fileId, folderId: folder.id })
        ).unwrap()
        dispatch(getFolders())
      } catch (error) {
        console.error('Failed to remove file from folder:', error)
      }
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

  if (!folder) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-6xl'>
          <DialogHeader>
            <DialogTitle>Files in "{folder.name}"</DialogTitle>
          </DialogHeader>

          <div className='max-h-[60vh] overflow-auto'>
            <Table className='w-full bg-background text-left'>
              <TableHeader>
                <TableRow className='bg-muted'>
                  {TABLE_HEAD.filter((head) => head !== 'Select').map(
                    (head) => (
                      <TableHead
                        key={head}
                        className={`cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors duration-150 select-none ${
                          head !== 'Action'
                            ? 'hover:bg-accent hover:opacity-100'
                            : ''
                        }`}
                        onClick={() => head !== 'Action' && handleSort(head)}
                      >
                        <div className='flex items-center gap-2 opacity-70'>
                          {head}
                          {head !== 'Action' && (
                            <ChevronUpDownIcon
                              strokeWidth={2}
                              className={`h-4 w-4 ${
                                sortColumn === head ? 'text-blue-500' : ''
                              }`}
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
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length === 0 && loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_HEAD.length}
                      className='p-4 text-center'
                    >
                      Loading files...
                    </TableCell>
                  </TableRow>
                ) : sortedFiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_HEAD.length}
                      className='p-4 text-center'
                    >
                      No files in this folder
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFiles.map(
                    ({
                      id,
                      name,
                      fileType,
                      size,
                      tags,
                      status,
                      errorMessage,
                      processingStage,
                    }) => (
                      <TableRow key={id}>
                        <TableCell className='p-4'>
                          {name || 'Unnamed'}
                        </TableCell>
                        <TableCell className='p-4'>
                          {fileType || 'Unknown'}
                        </TableCell>
                        <TableCell className='p-4'>
                          {formatFileSize(size)}
                        </TableCell>
                        <TableCell className='p-4'>
                          <TagsDisplay
                            tags={tags || []}
                            allTags={allTags}
                            fileId={id}
                          />
                        </TableCell>
                        <TableCell className='p-4'>
                          {getStatusDisplay(
                            status,
                            errorMessage,
                            processingStage
                          )}
                        </TableCell>
                        <TableCell className='p-4 text-center'>
                          <DropdownMenu>
                            <DropdownMenuTrigger className='rounded-md p-2 hover:bg-accent'>
                              <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                className='cursor-pointer'
                                onClick={() => handleRemoveFromFolder(id)}
                              >
                                <FolderMinus className='mr-2 h-4 w-4' />
                                <span>Remove from Folder</span>
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
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={deleteFileId !== null}
        onClose={() => setDeleteFileId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete File'
        description='Are you sure you want to delete this file? This action cannot be undone.'
        itemName={deleteFileName}
        confirmText='Delete'
      />
    </>
  )
}

export default FolderFilesModal
