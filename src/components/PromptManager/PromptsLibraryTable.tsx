import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { DocumentDuplicateIcon } from '@heroicons/react/20/solid'
import { EllipsisVerticalIcon, Eye } from 'lucide-react'

import { AppDispatch, RootState } from '../../redux/store'
import {
  cloneFromLibrary,
  getPromptsLibrary,
} from '../../redux/asyncThunks/promptsLibrary'
import { getPrompts } from '../../redux/asyncThunks/prompt'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { PublishedPrompt } from '@/redux/types/prompt'
import { stripHtml } from '../../utils/textUtils'
import { formatDate } from '../../utils/constants/prompts'
import { toast } from '@/utils/toast'
import PromptDetailsModal from './PromptDetailsModal'

const LIBRARY_TABLE_HEAD = ['Prompt', 'Author', 'Published', 'Action']

interface PromptsLibraryTableProps {
  searchQuery: string
}

const PromptsLibraryTable = ({ searchQuery }: PromptsLibraryTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { publishedPrompts, loading } = useSelector(
    (state: RootState) => state.promptsLibrary
  )
  const currentUserEmail = useSelector(
    (state: RootState) => state.user.user?.email
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedPrompt, setSelectedPrompt] = useState<PublishedPrompt | null>(
    null
  )

  useEffect(() => {
    dispatch(getPromptsLibrary())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredPrompts = useMemo(() => {
    return publishedPrompts.filter((prompt) => {
      const matchesSearch =
        searchQuery === '' ||
        prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.authorEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [publishedPrompts, searchQuery])

  const sortedPrompts = useMemo(() => {
    if (!sortColumn) return filteredPrompts

    return [...filteredPrompts].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortColumn) {
        case 'Prompt':
          aValue = a.title || ''
          bValue = b.title || ''
          break
        case 'Author':
          aValue = a.authorEmail || ''
          bValue = b.authorEmail || ''
          break
        case 'Published':
          aValue = new Date(a.publishedAt).getTime()
          bValue = new Date(b.publishedAt).getTime()
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

  const totalItems = sortedPrompts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedPrompts = sortedPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleSort = (column: string) => {
    if (column === 'Action') return
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleClone = async (prompt: PublishedPrompt) => {
    try {
      await dispatch(cloneFromLibrary(prompt.id)).unwrap()
      dispatch(getPrompts())
      toast.success('Prompt cloned to your library')
    } catch (error) {
      toast.error('Failed to clone prompt')
      console.error('Failed to clone prompt:', error)
    }
  }

  const renderPromptContent = (content: string) => {
    return stripHtml(content)
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-background bg-muted'>
            {LIBRARY_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors duration-150 select-none ${
                  head !== 'Action' ? 'hover:bg-accent hover:opacity-100' : ''
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
          {publishedPrompts.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={LIBRARY_TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                Loading library...
              </TableCell>
            </TableRow>
          ) : sortedPrompts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={LIBRARY_TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                No published prompts found
              </TableCell>
            </TableRow>
          ) : (
            paginatedPrompts.map((prompt) => (
              <TableRow key={prompt.id} className='border-border'>
                <TableCell className='p-4'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium text-foreground'>
                        {prompt.title || 'Untitled'}
                      </h3>
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
                        v{prompt.version || 1}
                      </span>
                    </div>
                    <p className='max-w-[300px] truncate text-sm text-muted-foreground'>
                      {renderPromptContent(prompt.content) || 'No content'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  <div className='flex items-center gap-2'>
                    {prompt.authorEmail}
                    {prompt.authorEmail === currentUserEmail && (
                      <span className='inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'>
                        Owner
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  {formatDate(prompt.publishedAt)}
                </TableCell>
                <TableCell className='p-4 text-center'>
                  {prompt.authorEmail !== currentUserEmail && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className='rounded-md p-2 hover:bg-accent'>
                        <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setSelectedPrompt(prompt)}
                          className='cursor-pointer text-blue-500'
                        >
                          <Eye className='h-4 w-4' />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleClone(prompt)}
                          className='cursor-pointer text-green-600'
                        >
                          <DocumentDuplicateIcon className='h-4 w-4' />
                          <span>Clone to My Prompts</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {sortedPrompts.length > 0 && (
          <TableFooter>
            <TableRow className='bg-background'>
              <TableCell
                colSpan={LIBRARY_TABLE_HEAD.length}
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

      <PromptDetailsModal
        isOpen={!!selectedPrompt}
        prompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onClone={
          selectedPrompt
            ? () => {
                handleClone(selectedPrompt)
                setSelectedPrompt(null)
              }
            : undefined
        }
      />
    </div>
  )
}

export default PromptsLibraryTable
