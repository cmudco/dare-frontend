import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  deleteWorkflow,
  startWorkflowRun,
  cloneWorkflow,
  getWorkflows,
  updateWorkflowDisplayOrder,
} from '../../redux/asyncThunks/workflow'
import { WORKFLOWS_TABLE_HEAD } from '../../utils/constants/workflows'
// LEGACY: Commenting out legacy modal import
// import { openEditModal, selectWorkflowForView } from '../../redux/workflowSlice'
import {
  selectWorkflowForView,
  updateWorkflowOrder,
} from '../../redux/workflowSlice'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import SortableWorkflowRow from './SortableWorkflowRow'
import {
  useDragSensors,
  createDisplayOrderUpdates,
  findWorkflowIndexes,
  isDragOperationValid,
  getWorkflowTitle,
} from '@/utils/workflowUtils'
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
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { DeleteConfirmation } from '../DeleteConfirmation'
// LEGACY: Commenting out SelectModeDialog since only "New" mode is available
// import SelectModeDialog from './SelectModeDialog'
import {
  SortDirection,
  updateSortState,
  sortWorkflows,
} from '@/utils/sortUtils'
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
  // LEGACY: Removing editModePromptOpen since we directly navigate to edit mode
  // const [editModePromptOpen, setEditModePromptOpen] = useState<number | null>(
  //   null
  // )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<number | null>(null)
  const [deleteWorkflowTitle, setDeleteWorkflowTitle] = useState<string>('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const sensors = useDragSensors()

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
    // Directly navigate to edit mode since legacy modal is disabled
    navigate(`/workflows/${id}/edit`)
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
          // LEGACY: Commenting out legacy modal usage, redirecting to new editor instead
          // dispatch(openEditModal(payload.id))
          navigate(`/workflows/${payload.id}/edit`)
        })
      }
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id) {
      const { oldIndex, newIndex } = findWorkflowIndexes(
        workflows,
        active.id,
        over?.id
      )

      if (isDragOperationValid(oldIndex, newIndex, active.id, over?.id)) {
        const newOrder = arrayMove(workflows, oldIndex, newIndex)
        const orderedIds = newOrder.map((workflow) => workflow.id)

        dispatch(updateWorkflowOrder(orderedIds))

        const displayOrderUpdates = createDisplayOrderUpdates(newOrder)

        try {
          await dispatch(updateWorkflowDisplayOrder(displayOrderUpdates))
        } catch (error) {
          console.error('Failed to update workflow display order:', error)
        }
      }
    }
  }

  return (
    <div className='overflow-auto'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Table className='mt-4 w-full min-w-max bg-background text-left'>
          <TableHeader>
            <TableRow className='bg-muted'>
              <TableHead className='w-12 p-4'>
                {/* Drag handle column */}
              </TableHead>
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
            <SortableContext
              items={paginatedWorkflows.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {workflows.length === 0 && loading ? (
                <TableRow>
                  <TableCell
                    colSpan={WORKFLOWS_TABLE_HEAD.length + 1}
                    className='p-4 text-center text-foreground'
                  >
                    Loading workflows...
                  </TableCell>
                </TableRow>
              ) : sortedWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={WORKFLOWS_TABLE_HEAD.length + 1}
                    className='p-4 text-center text-foreground'
                  >
                    No matching workflows found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWorkflows.map((workflow) => (
                  <SortableWorkflowRow
                    key={workflow.id}
                    workflow={workflow}
                    onRun={handleRun}
                    onView={handleView}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </SortableContext>
          </TableBody>
          {sortedWorkflows.length > 0 && (
            <TableFooter>
              <TableRow className='bg-background'>
                <TableCell
                  colSpan={WORKFLOWS_TABLE_HEAD.length + 1}
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

        <DragOverlay>
          {activeId ? (
            <div className='dark:bg-dark-chat-history min-h-[48px] rounded-md border border-gray-200 bg-white px-3 py-3 opacity-95 shadow-lg dark:border-dark-icon-unselected'>
              {(() => {
                const draggedWorkflow = workflows.find((w) => w.id === activeId)
                return draggedWorkflow ? (
                  <div className='flex items-center gap-2'>
                    <GripVertical className='h-5 w-5 text-gray-600 dark:text-white' />
                    <span className='text-gray-900 dark:text-white'>
                      {getWorkflowTitle(draggedWorkflow)}
                    </span>
                  </div>
                ) : null
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

      {/* LEGACY: SelectModeDialog removed since only "New" mode is available */}
      {/* Users now directly navigate to /workflows/[id]/edit */}
    </div>
  )
}

export default WorkflowTable
