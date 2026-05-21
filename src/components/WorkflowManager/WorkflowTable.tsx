import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import {
  deleteWorkflow,
  cloneWorkflow,
  getWorkflows,
  updateWorkflowDisplayOrder,
  forkWorkflow,
} from '../../redux/asyncThunks/workflow'
import { WORKFLOWS_TABLE_HEAD } from '../../utils/constants/workflows'
import { updateWorkflowOrder } from '../../redux/workflowSlice'
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
import ForkConfirmDialog from '../shared/ForkConfirmDialog'
import {
  useDragSensors,
  createDisplayOrderUpdates,
  findWorkflowIndexes,
  isDragOperationValid,
  getWorkflowTitle,
  getModeBadge,
  getStepCount,
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
import {
  SortDirection,
  updateSortState,
  sortWorkflows,
} from '@/utils/sortUtils'
import { WorkflowTableProps } from '@/redux/types/workflow'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { Workflow } from '@/redux/types/workflow'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { openSharing } from '@/redux/sharingSlice'
import { ShareableEntityType } from '@/redux/types/sharing'

const LIBRARY_TABLE_HEAD = [
  'Title',
  'Description',
  'Owner',
  'Mode',
  'Steps',
  'Action',
]

const WorkflowTable = ({ searchQuery, activeTab }: WorkflowTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { workflows, sharedWorkflows, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<number | null>(null)
  const [deleteWorkflowTitle, setDeleteWorkflowTitle] = useState<string>('')
  const [forkWorkflowId, setForkWorkflowId] = useState<number | null>(null)
  const [forkWorkflowTitle, setForkWorkflowTitle] = useState<string>('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const sensors = useDragSensors()
  const enableSharing = useFeatureFlag('enableSharing')

  const isLibrary = activeTab === 'library'
  const sourceWorkflows = isLibrary ? sharedWorkflows : workflows

  const filteredWorkflows = useMemo(() => {
    return sourceWorkflows.filter((workflow) => {
      const workflowTitle = workflow.title?.toLowerCase() || ''
      const workflowDescription = workflow.description?.toLowerCase() || ''
      const matchesSearch =
        searchQuery === '' ||
        workflowTitle.includes(searchQuery.toLowerCase()) ||
        workflowDescription.includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [sourceWorkflows, searchQuery])

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
  }, [searchQuery, activeTab])

  const handleSort = (column: string) => {
    updateSortState(column, sortColumn, setSortColumn, setSortDirection)
  }

  const handleEdit = (id: number) => {
    navigate(`/workflows/${id}/edit`)
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
          navigate(`/workflows/${payload.id}/edit`)
        })
      }
    })
  }

  const handleSharing = (workflow: Workflow) => {
    dispatch(
      openSharing({
        type: ShareableEntityType.Workflow,
        id: workflow.id,
        title: workflow.title || 'Untitled',
        isPublished: !!workflow.isPublished,
        canPublish: !workflow.isForked,
        isForked: !!workflow.isForked,
      })
    )
  }

  const handleForkClick = (id: number, title: string) => {
    setForkWorkflowId(id)
    setForkWorkflowTitle(title)
  }

  const handleConfirmFork = () => {
    if (forkWorkflowId) {
      dispatch(forkWorkflow(forkWorkflowId)).then((action) => {
        if (forkWorkflow.fulfilled.match(action)) {
          const payload = action.payload as Workflow
          setForkWorkflowId(null)
          setForkWorkflowTitle('')
          navigate(`/workflows/${payload.id}/edit`)
        }
      })
    }
  }

  const handleCancelFork = () => {
    setForkWorkflowId(null)
    setForkWorkflowTitle('')
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

  // Library view — simple table without drag-and-drop (only when sharing is enabled)
  if (isLibrary && enableSharing) {
    return (
      <div className='overflow-auto'>
        <Table className='mt-4 w-full min-w-max bg-background text-left'>
          <TableHeader>
            <TableRow className='bg-muted'>
              {LIBRARY_TABLE_HEAD.map((head) => (
                <TableHead
                  key={head}
                  className='p-4 text-sm font-semibold text-foreground'
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sharedWorkflows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={LIBRARY_TABLE_HEAD.length}
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
                      {workflow.title || 'Untitled'}
                    </h3>
                  </TableCell>
                  <TableCell className='p-4'>
                    <p className='max-w-[300px] truncate text-sm text-muted-foreground'>
                      {workflow.description || 'No description'}
                    </p>
                  </TableCell>
                  <TableCell className='p-4 text-sm text-muted-foreground'>
                    {workflow.ownerUsername || 'Unknown'}
                  </TableCell>
                  <TableCell className='p-4'>
                    {getModeBadge(workflow.mode)}
                  </TableCell>
                  <TableCell className='p-4 text-foreground'>
                    {getStepCount(workflow)}
                  </TableCell>
                  <TableCell className='p-4'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleForkClick(
                          workflow.id,
                          workflow.title || 'Untitled'
                        )
                      }
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
                <TableCell
                  colSpan={LIBRARY_TABLE_HEAD.length}
                  className='w-full p-4'
                >
                  <div className='flex w-full items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      {sortedWorkflows.length} shared workflow
                      {sortedWorkflows.length !== 1 ? 's' : ''}
                    </span>
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

        <ForkConfirmDialog
          isOpen={!!forkWorkflowId}
          title={forkWorkflowTitle}
          entityType='workflow'
          copiedItems={[
            'Workflow structure and settings',
            'All step configurations',
            'All prompts (as new copies with "FORK OF" prefix)',
          ]}
          infoNote="Files are not copied. You'll need to upload your own files after forking."
          onConfirm={handleConfirmFork}
          onCancel={handleCancelFork}
        />
      </div>
    )
  }

  // My Workflows view — with drag-and-drop and publish/clone/delete actions
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
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
                    onSharing={handleSharing}
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

      <ForkConfirmDialog
        isOpen={!!forkWorkflowId}
        title={forkWorkflowTitle}
        entityType='workflow'
        copiedItems={[
          'Workflow structure and settings',
          'All step configurations',
          'All prompts (as new copies with "FORK OF" prefix)',
        ]}
        infoNote="Files are not copied. You'll need to upload your own files after forking."
        onConfirm={handleConfirmFork}
        onCancel={handleCancelFork}
      />
    </div>
  )
}

export default WorkflowTable
