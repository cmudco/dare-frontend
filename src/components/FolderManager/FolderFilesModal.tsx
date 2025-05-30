import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { TABLE_HEAD, TAG_COLORS } from '../../utils/constants/file'
import { formatFileSize } from '@/utils/files'
import { SortDirection, sortFiles } from '@/utils/sortUtils'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { getFolders, removeFileFromFolder } from '../../redux/aynscThunks/file'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
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
import { EllipsisVerticalIcon, X } from 'lucide-react'
import { getStatusDisplay } from '@/utils/constants/files'
import { MyFolder } from '../../redux/types/files'
import { DeleteConfirmation } from '../DeleteConfirmation'

interface FolderFilesModalProps {
  isOpen: boolean
  onClose: () => void
  folder: MyFolder | null
}

const FolderFilesModal = ({
  isOpen,
  onClose,
  folder,
}: FolderFilesModalProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { tags: allTags } = useSelector((state: RootState) => state.tags)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )
  const [removeFileId, setRemoveFileId] = useState<number | null>(null)
  const [removeFileName, setRemoveFileName] = useState<string>('')

  const files = useMemo(() => folder?.files || [], [folder?.files])

  const sortedFiles = useMemo(() => {
    return sortFiles(files, sortColumn, sortDirection, allTags)
  }, [files, sortColumn, sortDirection, allTags])

  const totalPages = Math.ceil(sortedFiles.length / itemsPerPage)
  const paginatedFiles = sortedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  const handleRemove = (fileId: number, fileName: string) => {
    setRemoveFileId(fileId)
    setRemoveFileName(fileName)
  }

  const handleRemoveConfirm = async () => {
    if (removeFileId && folder) {
      await dispatch(
        removeFileFromFolder({ fileId: removeFileId, folderId: folder.id })
      )
      await dispatch(getFolders())
      setRemoveFileId(null)
      setRemoveFileName('')
    }
  }

  const handleClose = () => {
    setCurrentPage(1)
    setSortColumn(null)
    setSortDirection(SortDirectionEnum.ASC)
    setRemoveFileId(null)
    setRemoveFileName('')
    onClose()
  }

  if (!folder) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            📁 {folder.name}
            <span className='text-sm font-normal text-gray-500'>
              ({files.length} {files.length === 1 ? 'file' : 'files'})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className='max-h-[60vh] overflow-auto'>
          <Table className='w-full bg-white text-left'>
            <TableHeader>
              <TableRow className='bg-muted'>
                {TABLE_HEAD.map((head) => (
                  <TableHead
                    key={head}
                    className={`${head === 'Action' ? '' : 'cursor-pointer select-none'} p-3 text-sm font-semibold transition-colors duration-150 hover:bg-gray-100 hover:opacity-100`}
                    onClick={
                      head === 'Action' ? undefined : () => handleSort(head)
                    }
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
              {files.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={TABLE_HEAD.length}
                    className='p-4 text-center text-gray-500'
                  >
                    No files in this folder
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFiles.map(
                  ({ id, name, fileType, size, tags, status }) => (
                    <TableRow key={id}>
                      <TableCell className='p-3'>{name || 'Unnamed'}</TableCell>
                      <TableCell className='p-3'>
                        {fileType || 'Unknown'}
                      </TableCell>
                      <TableCell className='p-3'>
                        {formatFileSize(size)}
                      </TableCell>
                      <TableCell className='p-3'>
                        <div className='flex max-w-[120px] flex-wrap gap-1'>
                          {Array.isArray(tags) &&
                            tags.map((tagId, i) => {
                              const tag = allTags.find((t) => t.id === tagId)
                              if (!tag) return null
                              const colorVariant = TAG_COLORS[tag.label]
                              return (
                                <Badge
                                  key={`${id}-${i}`}
                                  variant={colorVariant}
                                  selected={true}
                                  className='text-xs'
                                >
                                  {tag.label}
                                </Badge>
                              )
                            })}
                        </div>
                      </TableCell>
                      <TableCell className='p-3'>
                        {getStatusDisplay(status)}
                      </TableCell>
                      <TableCell className='p-3'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <EllipsisVerticalIcon className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemove(id, name || 'Unnamed')
                              }
                              className='text-red-600 focus:text-red-600'
                            >
                              <X className='mr-2 h-4 w-4' />
                              Remove
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
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length} className='w-full p-3'>
                    <div className='flex w-full items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm'>Rows per page:</span>
                        <Select
                          value={String(itemsPerPage)}
                          onValueChange={(val) => setItemsPerPage(Number(val))}
                        >
                          <SelectTrigger className='h-8 w-[60px]'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='5'>5</SelectItem>
                            <SelectItem value='10'>10</SelectItem>
                            <SelectItem value='20'>20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex items-center gap-2'>
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
                          disabled={
                            currentPage === totalPages || totalPages === 0
                          }
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
        </div>
      </DialogContent>

      <DeleteConfirmation
        isOpen={removeFileId !== null}
        onDelete={handleRemoveConfirm}
        onClose={() => {
          setRemoveFileId(null)
          setRemoveFileName('')
        }}
        title='Remove File?'
        description='Are you sure you want to remove this file from the folder?'
        itemName={removeFileName}
        confirmText='Remove'
      />
    </Dialog>
  )
}

export default FolderFilesModal
