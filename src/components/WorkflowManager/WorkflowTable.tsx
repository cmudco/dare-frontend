import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  deleteWorkflow,
  startWorkflowRun,
  getLatestWorkflowRun,
} from '../../redux/asyncThunks/workflow'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { formatDate } from '../../utils/constants/prompts'
import { WORKFLOWS_TABLE_HEAD } from '../../utils/constants/workflows'
import { openEditModal } from '../../redux/workflowSlice'
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
import { EllipsisVerticalIcon } from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getModeBadge, getStepCount } from '@/utils/constants/workflow'
import { WorkflowTableProps } from '@/redux/types/workflow'
import WorkflowRunDrawer from './WorkflowRunDrawer'

const WorkflowTable = ({ searchQuery }: WorkflowTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { workflows, loading } = useSelector(
    (state: RootState) => state.workflow
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null)
  const [deleteWorkflowTitle, setDeleteWorkflowTitle] = useState<string>('')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

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

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage)
  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleDeleteConfirm = async () => {
    if (deleteWorkflowId) {
      try {
        await dispatch(deleteWorkflow(deleteWorkflowId)).unwrap()
      } catch (error) {
        console.error('Failed to delete workflow:', error)
      }
    }
    setDeleteWorkflowId(null)
  }

  const handleDelete = async (id: string, title: string) => {
    setDeleteWorkflowId(id)
    setDeleteWorkflowTitle(title || 'Untitled')
  }

  const handleEdit = (id: string) => {
    dispatch(openEditModal(id))
  }

  const handleRun = async (id: string) => {
    try {
      const action = await dispatch(startWorkflowRun(id)).unwrap()
      setSelectedRunId(action.id)
    } catch (error) {
      console.error('Failed to start workflow run:', error)
    }
  }

  const handleView = async (workflowId: string) => {
    try {
      const workflow = workflows.find((w) => w.id === workflowId)

      if (workflow?.lastRunId) {
        setSelectedRunId(workflow.lastRunId)
      } else {
        const resultAction = await dispatch(
          getLatestWorkflowRun(workflowId)
        ).unwrap()

        if (resultAction.run) {
          setSelectedRunId(resultAction.run.id)
        }
      }
    } catch (error) {
      console.error('Failed to view workflow run history:', error)
    }
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-white text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            {WORKFLOWS_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className='cursor-pointer p-4 text-sm font-semibold'
              >
                <div className='flex items-center justify-between gap-2 opacity-70'>
                  {head}
                  <ChevronUpDownIcon strokeWidth={2} className='h-4 w-4' />
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
                className='p-4 text-center'
              >
                Loading workflows...
              </TableCell>
            </TableRow>
          ) : filteredWorkflows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={WORKFLOWS_TABLE_HEAD.length}
                className='p-4 text-center'
              >
                No matching workflows found
              </TableCell>
            </TableRow>
          ) : (
            paginatedWorkflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell className='p-4'>
                  <h3 className='font-medium'>
                    {workflow.title || 'Untitled'}
                  </h3>
                </TableCell>
                <TableCell className='p-4'>
                  <p className='max-w-[300px] truncate text-sm text-gray-500'>
                    {workflow.description || 'No description'}
                  </p>
                </TableCell>
                <TableCell className='p-4'>
                  {getModeBadge(workflow.mode)}
                </TableCell>
                <TableCell className='p-4'>{getStepCount(workflow)}</TableCell>
                <TableCell className='p-4'>
                  {formatDate(workflow?.createdAt)}
                </TableCell>
                <TableCell className='p-4 text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger className='rounded-md p-2 hover:bg-gray-200'>
                      <EllipsisVerticalIcon className='h-4 w-4 text-gray-500' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleRun(workflow.id)}
                        className='cursor-pointer'
                      >
                        <span>Run</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleView(workflow.id)}
                        className='cursor-pointer'
                        disabled={!workflow.lastRunId && !workflow.id}
                      >
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEdit(workflow.id)}
                        className='cursor-pointer'
                      >
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() =>
                          handleDelete(workflow.id, workflow.title)
                        }
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

        {filteredWorkflows.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={WORKFLOWS_TABLE_HEAD.length}
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
        isOpen={!!deleteWorkflowId}
        onClose={() => setDeleteWorkflowId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete Workflow'
        description='Are you sure you want to delete this workflow? This action cannot be undone.'
        itemName={deleteWorkflowTitle}
        confirmText='Delete'
      />

      <WorkflowRunDrawer
        runId={selectedRunId}
        isOpen={!!selectedRunId}
        onClose={() => setSelectedRunId(null)}
      />
    </div>
  )
}

export default WorkflowTable
