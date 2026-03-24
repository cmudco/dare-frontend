import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

import { AppDispatch, RootState } from '../../redux/store'
import { forkWorkflow } from '../../redux/asyncThunks/workflow'
import { SharedItem, ShareableEntityType } from '@/redux/types/sharing'
import { toast } from '@/utils/toast'
import { getModeBadge } from '@/utils/workflowUtils'
import { Button } from '../ui/button'
import ForkConfirmDialog from '../shared/ForkConfirmDialog'
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

const TABLE_HEAD = [
  'Title',
  'Description',
  'Shared By',
  'Mode',
  'Steps',
  'Action',
]

interface SharedWorkflowsTableProps {
  searchQuery: string
}

const SharedWorkflowsTable = ({ searchQuery }: SharedWorkflowsTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { sharedWithMe, loading } = useSelector(
    (state: RootState) => state.sharing
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [forkWorkflowItem, setForkWorkflowItem] = useState<SharedItem | null>(
    null
  )

  const sharedWorkflows = useMemo(
    () =>
      sharedWithMe.filter(
        (item) => item.contentType === ShareableEntityType.Workflow
      ),
    [sharedWithMe]
  )

  const filteredWorkflows = useMemo(() => {
    return sharedWorkflows.filter((workflow) => {
      const matchesSearch =
        searchQuery === '' ||
        workflow.entityTitle
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        workflow.entityDescription
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        workflow.sharedByEmail
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [sharedWorkflows, searchQuery])

  const sortedWorkflows = useMemo(() => {
    if (!sortColumn) {
      return filteredWorkflows
    }

    return [...filteredWorkflows].sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortColumn) {
        case 'Title':
          aValue = a.entityTitle || ''
          bValue = b.entityTitle || ''
          break
        case 'Description':
          aValue = a.entityDescription || ''
          bValue = b.entityDescription || ''
          break
        case 'Shared By':
          aValue = a.sharedByEmail || ''
          bValue = b.sharedByEmail || ''
          break
        case 'Mode':
          aValue = a.entityMode || ''
          bValue = b.entityMode || ''
          break
        case 'Steps':
          aValue = a.entityStepCount || 0
          bValue = b.entityStepCount || 0
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
  }, [filteredWorkflows, sortColumn, sortDirection])

  const totalPages = Math.ceil(sortedWorkflows.length / itemsPerPage)
  const paginatedWorkflows = sortedWorkflows.slice(
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

  const handleConfirmFork = async () => {
    if (!forkWorkflowItem) {
      return
    }

    try {
      const forkedWorkflow = await dispatch(
        forkWorkflow(Number(forkWorkflowItem.objectId))
      ).unwrap()
      setForkWorkflowItem(null)
      navigate(`/workflows/${forkedWorkflow.id}/edit`)
    } catch (error) {
      setForkWorkflowItem(null)
      toast.error((error as Error).message || 'Failed to fork workflow.')
    }
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            {TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold text-foreground transition-colors duration-150 ${
                  head !== 'Action'
                    ? 'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'
                    : ''
                }`}
                onClick={() => handleSort(head)}
              >
                <div className='flex items-center justify-between gap-2 opacity-70'>
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
          {sharedWorkflows.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                Loading shared workflows...
              </TableCell>
            </TableRow>
          ) : sortedWorkflows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length}
                className='p-4 text-center text-muted-foreground'
              >
                No shared workflows available yet.
              </TableCell>
            </TableRow>
          ) : (
            paginatedWorkflows.map((workflow) => (
              <TableRow key={workflow.id} className='border-border'>
                <TableCell className='p-4'>
                  <h3 className='font-medium text-foreground'>
                    {workflow.entityTitle || 'Untitled'}
                  </h3>
                </TableCell>
                <TableCell className='p-4'>
                  <p className='max-w-[300px] truncate text-sm text-muted-foreground'>
                    {workflow.entityDescription || 'No description'}
                  </p>
                </TableCell>
                <TableCell className='p-4 text-sm text-muted-foreground'>
                  {workflow.sharedByEmail}
                </TableCell>
                <TableCell className='p-4'>
                  {getModeBadge(workflow.entityMode || 'parallel')}
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  {workflow.entityStepCount || 0}
                </TableCell>
                <TableCell className='p-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setForkWorkflowItem(workflow)}
                  >
                    Fork
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {sortedWorkflows.length > 0 && (
          <TableFooter>
            <TableRow className='bg-background'>
              <TableCell colSpan={TABLE_HEAD.length} className='w-full p-4'>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm dark:text-white'>
                      Rows per page:
                    </span>
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

      <ForkConfirmDialog
        isOpen={!!forkWorkflowItem}
        title={forkWorkflowItem?.entityTitle || 'Untitled'}
        entityType='workflow'
        copiedItems={[
          'Workflow structure and settings',
          'All step configurations',
          'All prompts as copies in your account',
        ]}
        infoNote="Files are not copied. You'll need to upload your own files after forking."
        onConfirm={handleConfirmFork}
        onCancel={() => setForkWorkflowItem(null)}
      />
    </div>
  )
}

export default SharedWorkflowsTable
