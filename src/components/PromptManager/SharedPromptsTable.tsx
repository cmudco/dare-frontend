import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

import { AppDispatch, RootState } from '../../redux/store'
import { clonePrompt } from '../../redux/asyncThunks/prompt'
import { openEditModal } from '../../redux/promptSlice'
import { Prompt } from '@/redux/types/prompt'
import { SharedItem, ShareableEntityType } from '@/redux/types/sharing'
import { stripHtml } from '../../utils/textUtils'
import { formatDate } from '../../utils/constants/prompts'
import { toast } from '@/utils/toast'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table'

const TABLE_HEAD = ['Prompt', 'Shared By', 'Shared', 'Action']

interface SharedPromptsTableProps {
  searchQuery: string
}

const SharedPromptsTable = ({ searchQuery }: SharedPromptsTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { sharedWithMe, loading } = useSelector(
    (state: RootState) => state.sharing
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sharedPrompts = useMemo(
    () =>
      sharedWithMe.filter(
        (item) => item.contentType === ShareableEntityType.Prompt
      ),
    [sharedWithMe]
  )

  const filteredPrompts = useMemo(() => {
    return sharedPrompts.filter((prompt) => {
      const matchesSearch =
        searchQuery === '' ||
        prompt.entityTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.entityContent
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        prompt.sharedByEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [sharedPrompts, searchQuery])

  const sortedPrompts = useMemo(() => {
    if (!sortColumn) {
      return filteredPrompts
    }

    return [...filteredPrompts].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortColumn) {
        case 'Prompt':
          aValue = a.entityTitle || ''
          bValue = b.entityTitle || ''
          break
        case 'Shared By':
          aValue = a.sharedByEmail || ''
          bValue = b.sharedByEmail || ''
          break
        case 'Shared':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [filteredPrompts, sortColumn, sortDirection])

  const totalPages = Math.ceil(sortedPrompts.length / itemsPerPage)
  const paginatedPrompts = sortedPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleSort = (column: string) => {
    if (column === 'Action') {
      return
    }

    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortColumn(column)
    setSortDirection('asc')
  }

  const handleClone = (prompt: SharedItem) => {
    dispatch(clonePrompt(Number(prompt.objectId))).then((result) => {
      if (clonePrompt.fulfilled.match(result)) {
        const payload = result.payload as Prompt
        dispatch(openEditModal(payload.id))
        toast.success('Prompt cloned to your prompts')
        return
      }

      toast.error(
        (result.payload as string) || 'Failed to clone shared prompt.'
      )
    })
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background bg-white text-left'>
        <TableHeader>
          <TableRow className='bg-background bg-muted'>
            {TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold transition-colors duration-150 dark:text-white ${
                  head !== 'Action'
                    ? 'hover:bg-gray-100 hover:opacity-100 dark:hover:bg-gray-700'
                    : ''
                }`}
                onClick={() => handleSort(head)}
              >
                <div className='flex items-center justify-between gap-2 opacity-70'>
                  {head}
                  {head !== 'Action' && (
                    <ChevronUpDownIcon
                      strokeWidth={2}
                      className={`h-4 w-4 ${
                        sortColumn === head ? 'text-blue-500' : ''
                      }`}
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
          {sharedPrompts.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length}
                className='p-4 text-center dark:text-white'
              >
                Loading shared prompts...
              </TableCell>
            </TableRow>
          ) : sortedPrompts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length}
                className='p-4 text-center dark:text-white'
              >
                No shared prompts found
              </TableCell>
            </TableRow>
          ) : (
            paginatedPrompts.map((prompt) => (
              <TableRow key={prompt.id} className='dark:border-gray-700'>
                <TableCell className='p-4'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium dark:text-white'>
                        {prompt.entityTitle || 'Untitled'}
                      </h3>
                      {prompt.entityVersion && (
                        <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
                          v{prompt.entityVersion}
                        </span>
                      )}
                    </div>
                    <p className='max-w-[300px] truncate text-sm text-gray-500 dark:text-gray-400'>
                      {stripHtml(prompt.entityContent || '') || 'No content'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='p-4 dark:text-white'>
                  {prompt.sharedByEmail}
                </TableCell>
                <TableCell className='p-4 dark:text-white'>
                  {formatDate(prompt.createdAt)}
                </TableCell>
                <TableCell className='p-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleClone(prompt)}
                  >
                    Clone to My Prompts
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {sortedPrompts.length > 0 && (
          <TableFooter>
            <TableRow className='bg-background'>
              <TableCell
                colSpan={TABLE_HEAD.length}
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
    </div>
  )
}

export default SharedPromptsTable
