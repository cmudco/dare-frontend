import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { importSharedFile } from '../../redux/asyncThunks/file'
import { openShareModal } from '../../redux/fileSlice'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { formatFileSize } from '@/utils/files'
import { SortDirection, sortFiles } from '@/utils/sortUtils'
import {
  paginateItems,
  getTotalPages,
  resetPaginationOnFilter,
  createPaginationConfig,
} from '@/utils/tableUtils'
import { toast } from '@/utils/toast'

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
import { EllipsisVerticalIcon, Trash2, Share2, FolderInput } from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getStatusDisplay } from '@/utils/constants/files'
import { SortDirectionEnum } from '@/utils/constants/sort'
import TagsDisplay from './TagsDisplay'

const SHARED_TABLE_HEAD = [
  'File Name',
  'File Type',
  'Size',
  'Tags',
  'Shared by',
  'Status',
  'Action',
]

const SharedFilesTable = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { sharedFiles, sharedFilesLoading, searchQuery } = useSelector(
    (state: RootState) => state.files
  )
  const { tags: allTags } = useSelector((state: RootState) => state.tags)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [deleteFileName, setDeleteFileName] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return sharedFiles
    const q = searchQuery.toLowerCase()
    return sharedFiles.filter((f) => f.name?.toLowerCase().includes(q))
  }, [sharedFiles, searchQuery])

  const sortedFiles = useMemo(() => {
    return sortFiles(filteredFiles, sortColumn, sortDirection, allTags)
  }, [filteredFiles, sortColumn, sortDirection, allTags])

  const totalPages = getTotalPages(sortedFiles.length, itemsPerPage)
  const paginationConfig = createPaginationConfig(currentPage, itemsPerPage)
  const paginatedFiles = paginateItems(sortedFiles, paginationConfig)

  useEffect(() => {
    resetPaginationOnFilter(setCurrentPage)
  }, [searchQuery])

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

  const handleImport = async (id: number, name: string) => {
    try {
      await dispatch(importSharedFile(id)).unwrap()
      toast.success(`"${name}" has been imported to My Files`)
    } catch {
      toast.error(`Failed to import "${name}"`)
    }
  }

  const handleDelete = (id: number, name: string) => {
    setDeleteFileId(id)
    setDeleteFileName(name || 'Unnamed')
  }

  const handleDeleteConfirm = () => {
    // Deleting a shared file removes it from the shared list (backend handles this)
    setDeleteFileId(null)
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            <TableHead
              key='select-all'
              className='w-[50px] cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors select-none'
            >
              <div className='flex items-center justify-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded-sm border-border text-primary focus:ring-primary'
                  disabled
                />
              </div>
            </TableHead>
            {SHARED_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors duration-150 select-none ${head !== 'Action' ? 'hover:bg-accent hover:opacity-100' : ''}`}
                onClick={() => head !== 'Action' && handleSort(head)}
              >
                <div className='flex items-center gap-2 opacity-70'>
                  {head}
                  {head !== 'Action' && head !== 'Shared by' && (
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
          {sharedFiles.length === 0 && sharedFilesLoading ? (
            <TableRow>
              <TableCell
                colSpan={SHARED_TABLE_HEAD.length + 1}
                className='p-4 text-center'
              >
                Loading shared files...
              </TableCell>
            </TableRow>
          ) : sortedFiles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={SHARED_TABLE_HEAD.length + 1}
                className='p-4 text-center'
              >
                No files have been shared with you yet
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
                sharedBy,
              }) => (
                <TableRow key={id}>
                  <TableCell className='w-[50px] p-4 text-center'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded-sm border-border text-primary focus:ring-primary'
                      disabled
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
                    {sharedBy ? (
                      <div className='flex items-center gap-2'>
                        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted-foreground text-xs font-semibold text-background'>
                          {sharedBy.initials}
                        </div>
                        <span className='text-sm'>{sharedBy.name}</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white'>
                          EV
                        </div>
                        <span className='text-sm'>Everyone</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='p-4'>
                    {getStatusDisplay(status, errorMessage)}
                  </TableCell>
                  <TableCell className='p-4 text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='rounded-md p-2 hover:bg-accent'>
                        <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleImport(id, name)}
                        >
                          <FolderInput className='mr-2 h-4 w-4' />
                          <span>Import to My Files</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => dispatch(openShareModal({ id, name }))}
                        >
                          <Share2 className='mr-2 h-4 w-4' />
                          <span>Share</span>
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
            <TableRow className='bg-muted/50'>
              <TableCell
                colSpan={SHARED_TABLE_HEAD.length + 1}
                className='w-full p-4 text-foreground'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-foreground'>
                      Rows per page:
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className='w-[80px] bg-background'>
                        <SelectValue placeholder='Rows' />
                      </SelectTrigger>
                      <SelectContent className='bg-background'>
                        <SelectItem value='5' className='hover:bg-accent'>
                          5
                        </SelectItem>
                        <SelectItem value='10' className='hover:bg-accent'>
                          10
                        </SelectItem>
                        <SelectItem value='20' className='hover:bg-accent'>
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
                    <span className='text-sm text-foreground'>
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
        title='Remove Shared File'
        description='Are you sure you want to remove this file from your shared list?'
        itemName={deleteFileName}
        confirmText='Remove'
      />
    </div>
  )
}

export default SharedFilesTable
