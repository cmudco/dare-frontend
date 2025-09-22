import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  deleteWorkflow,
  startWorkflowRun,
  cloneWorkflow,
  getWorkflows,
} from '../../redux/asyncThunks/workflow'
import { formatDate } from '../../utils/constants/prompts'
import { WORKFLOWS_TABLE_HEAD } from '../../utils/constants/workflows'
import { openEditModal, selectWorkflowForView } from '../../redux/workflowSlice'
import { useNavigate } from 'react-router-dom'
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
import {
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { DeleteConfirmation } from '../DeleteConfirmation'
import SelectModeDialog from './SelectModeDialog'
import {
  SortDirection,
  updateSortState,
  sortWorkflows,
} from '@/utils/sortUtils'
import { getModeBadge, getStepCount } from '@/utils/workflowUtils'
import WorkflowViewer from './WorkflowViewer'
import { WorkflowTableProps } from '@/redux/types/workflow'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { Workflow } from '@/redux/types/workflow'

const WorkflowTable = ({ searchQuery }: WorkflowTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { workflows, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const navigate = useNavigate()
  const [editModePromptOpen, setEditModePromptOpen] = useState<number | null>(
    null
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<number | null>(null)
  const [deleteWorkflowTitle, setDeleteWorkflowTitle] = useState<string>('')

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((workflow) => {
      const workflowTitle = workflow.title?.toLowerCase() || ''
      const workflowDescription = workflow.description?.toLowerCase() || ''
      const matchesSearch =
        searchQuery === '' ||
        workflowTitle.includes(searchQuery.toLowerCase()) ||
        workflowDescription.includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [workflows, searchQuery])

  const sortedWorkflows = useMemo(() => {
    return sortWorkflows(filteredWorkflows, sortColumn, sortDirection)
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
    updateSortState(column, sortColumn, setSortColumn, setSortDirection)
  }

  const handleEdit = (id: number) => {
    setEditModePromptOpen(id)
  }

  const handleRun = async (id: number) => {
    try {
      await dispatch(startWorkflowRun(id)).unwrap()
      dispatch(selectWorkflowForView({ workflowId: id, mode: 'run' }))
    } catch (error) {
      console.error('Failed to start workflow run:', error)
    }
  }

  const handleView = (workflowId: number) => {
    dispatch(selectWorkflowForView({ workflowId, mode: 'view' }))
  }

  const handleDelete = (id: number, title: string) => {
    setDeleteWorkflowId(id)
    setDeleteWorkflowTitle(title || 'Untitled')
  }

  const handleDeleteConfirm = async () => {
    if (deleteWorkflowId) {
      try {
        await dispatch(deleteWorkflow(deleteWorkflowId)).unwrap()
      } catch (err) {
        console.error('Failed to delete workflow:', err)
      }
      setDeleteWorkflowId(null)
      setDeleteWorkflowTitle('')
    }
  }

  const handleClone = (id: number) => {
    dispatch(cloneWorkflow(id)).then((action) => {
      if (cloneWorkflow.fulfilled.match(action)) {
        const payload = action.payload as Workflow
        dispatch(getWorkflows()).then(() => {
          dispatch(openEditModal(payload.id))
        })
      }
    })
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            {WORKFLOWS_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold text-foreground transition-colors duration-150 ${
                  head !== 'Action'
                    ? 'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'
                    : ''
                }`}
                onClick={() => head !== 'Action' && handleSort(head)}
              >
                <div className='flex items-center justify-between gap-2 opacity-70'>
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
          {workflows.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={WORKFLOWS_TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                Loading workflows...
              </TableCell>
            </TableRow>
          ) : sortedWorkflows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={WORKFLOWS_TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                No matching workflows found
              </TableCell>
            </TableRow>
          ) : (
            paginatedWorkflows.map((workflow) => (
              <TableRow key={workflow.id} className='border-border'>
                <TableCell className='p-4'>
                  <h3 className='font-medium text-foreground'>
                    {workflow.title || 'Untitled'}
                  </h3>
                </TableCell>
                <TableCell className='p-4'>
                  <p className='max-w-[300px] truncate text-sm text-muted-foreground'>
                    {workflow.description || 'No description'}
                  </p>
                </TableCell>
                <TableCell className='p-4'>
                  {getModeBadge(workflow.mode)}
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  {getStepCount(workflow)}
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  {formatDate(workflow.createdAt || workflow.created_at)}
                </TableCell>
                <TableCell className='p-4 text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger className='rounded-md p-2 transition-colors hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'>
                      <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleRun(workflow.id)}
                        className='cursor-pointer'
                      >
                        <PlayIcon className='mr-2 h-4 w-4' />
                        <span>Run</span>
                      </DropdownMenuItem>
                      {workflow.latestRun && (
                        <DropdownMenuItem
                          onClick={() => handleView(workflow.id)}
                          className='cursor-pointer'
                        >
                          <EyeIcon className='mr-2 h-4 w-4' />
                          <span>View Last Run</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleEdit(workflow.id)}
                        className='cursor-pointer'
                      >
                        <PencilIcon className='mr-2 h-4 w-4' />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleClone(workflow.id)}
                        className='cursor-pointer text-yellow-500'
                      >
                        <DocumentDuplicateIcon className='h-4 w-4' />
                        <span>Clone</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() =>
                          handleDelete(workflow.id, workflow.title)
                        }
                      >
                        <TrashIcon className='mr-2 h-4 w-4' />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {sortedWorkflows.length > 0 && (
          <TableFooter>
            <TableRow className='bg-background'>
              <TableCell
                colSpan={WORKFLOWS_TABLE_HEAD.length}
                className='w-full p-4'
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

      <DeleteConfirmation
        isOpen={!!deleteWorkflowId}
        onClose={() => setDeleteWorkflowId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete Workflow'
        description='Are you sure you want to delete this workflow? This action cannot be undone.'
        itemName={deleteWorkflowTitle}
        confirmText='Delete'
      />

      <WorkflowViewer />

      <SelectModeDialog
        open={!!editModePromptOpen}
        onOpenChange={(open) => !open && setEditModePromptOpen(null)}
        title='Select mode'
        onSelectNew={() => {
          const id = editModePromptOpen
          setEditModePromptOpen(null)
          if (id) navigate(`/workflows/${id}/edit`)
        }}
        onSelectLegacy={() => {
          const id = editModePromptOpen
          setEditModePromptOpen(null)
          if (id) dispatch(openEditModal(id))
        }}
      />
    </div>
  )
}

export default WorkflowTable
