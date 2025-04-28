import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { deleteFile } from '../../redux/aynscThunks/file'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { TABLE_HEAD, TAG_COLORS } from '../../utils/constants/file'
import { formatFileSize } from '@/utils/files'
import { sortFiles } from '@/utils/sortUtils'

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
import { EllipsisVerticalIcon } from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getStatusDisplay } from '@/utils/constants/files'

interface FileTableProps {
  searchQuery: string
  selectedTags: number[]
}

const FileTable = ({ searchQuery, selectedTags }: FileTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { files, loading } = useSelector((state: RootState) => state.files)
  const { tags: allTags } = useSelector((state: RootState) => state.tags)
  const user = useSelector((state: RootState) => state.user.user)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [deleteFileName, setDeleteFileName] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredFiles = useMemo(() => {
    if (!user || user.vectorDb === undefined) {
      return []
    }
    return files.filter((file) => {
      const fileName = file.name?.toLowerCase() || ''
      const matchesSearch =
        searchQuery === '' || fileName.includes(searchQuery.toLowerCase())
      const matchesTags =
        selectedTags.length === 0 ||
        (file.tags && file.tags.some((tagId) => selectedTags.includes(tagId)))
      const matchesVectorDb = file.vectorDbSource === user.vectorDb
      return matchesSearch && matchesTags && matchesVectorDb
    })
  }, [files, searchQuery, selectedTags, user])

  const sortedFiles = useMemo(() => {
    return sortFiles(filteredFiles, sortColumn, sortDirection, allTags)
  }, [filteredFiles, sortColumn, sortDirection, allTags])

  const totalPages = Math.ceil(sortedFiles.length / itemsPerPage)
  const paginatedFiles = sortedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedTags])

  const handleDeleteConfirm = async () => {
    if (deleteFileId !== null) {
      try {
        await dispatch(deleteFile(deleteFileId)).unwrap()
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-white text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            {TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold transition-colors duration-150 ${head !== 'Action' ? 'hover:bg-gray-100 hover:opacity-100' : ''}`}
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
                          sortColumn === head && sortDirection === 'desc'
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
                No matching files found
              </TableCell>
            </TableRow>
          ) : (
            paginatedFiles.map(({ id, name, fileType, size, tags, status }) => (
              <TableRow key={id}>
                <TableCell className='p-4'>{name || 'Unnamed'}</TableCell>
                <TableCell className='p-4'>{fileType || 'Unknown'}</TableCell>
                <TableCell className='p-4'>{formatFileSize(size)}</TableCell>
                <TableCell className='p-4'>
                  <div className='flex max-w-[150px] flex-wrap gap-2'>
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
                          >
                            {tag.label}
                          </Badge>
                        )
                      })}
                  </div>
                </TableCell>
                <TableCell className='p-4'>
                  {getStatusDisplay(status)}
                </TableCell>
                <TableCell className='p-4 text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger className='rounded-md p-2 hover:bg-gray-200'>
                      <EllipsisVerticalIcon className='h-4 w-4 text-gray-500' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() => handleDelete(id, name)}
                      >
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {sortedFiles.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={TABLE_HEAD.length} className='w-full p-4'>
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
        isOpen={deleteFileId !== null}
        onClose={() => setDeleteFileId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete File'
        description='Are you sure you want to delete this file? This action cannot be undone.'
        itemName={deleteFileName}
        confirmText='Delete'
      />
    </div>
  )
}

export default FileTable
