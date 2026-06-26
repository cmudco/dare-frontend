import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { deleteAgent, getAgents } from '../../redux/asyncThunks/agent'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { formatDate } from '@/utils/constants/prompts'
import { AGENTS_TABLE_HEAD } from '../../utils/constants/agents'
import { openEditModal } from '../../redux/agentSlice'
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
import { TrashIcon } from '@heroicons/react/24/outline'
import { PencilIcon } from '@heroicons/react/20/solid'
import { updateSortState, SortDirection } from '@/utils/sortUtils'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { sortAgents, filterAgents } from '@/utils/agentUtils'

interface AgentTableProps {
  searchQuery: string
}

const AgentTable = ({ searchQuery }: AgentTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { agents, loading } = useSelector((state: RootState) => state.agent)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteAgentId, setDeleteAgentId] = useState<number | null>(null)
  const [deleteAgentName, setDeleteAgentName] = useState<string>('')

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )

  const filteredAgents = useMemo(() => {
    return filterAgents(agents, searchQuery)
  }, [agents, searchQuery])

  const sortedAgents = useMemo(() => {
    return sortAgents(filteredAgents, sortColumn, sortDirection)
  }, [filteredAgents, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    updateSortState(column, sortColumn, setSortColumn, setSortDirection)
  }

  const totalItems = sortedAgents.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedAgents = sortedAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleDeleteConfirm = async () => {
    if (deleteAgentId) {
      try {
        await dispatch(deleteAgent(deleteAgentId)).unwrap()
        dispatch(getAgents())
      } catch (error) {
        console.error('Failed to delete agent:', error)
      }
    }
    setDeleteAgentId(null)
  }

  const handleDelete = async (id: number, name: string) => {
    setDeleteAgentId(id)
    setDeleteAgentName(name || 'Untitled')
  }

  const handleEdit = (id: number) => {
    dispatch(openEditModal(id))
  }

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-background'>
            {AGENTS_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors duration-150 select-none ${
                  head !== 'Action' ? 'hover:bg-accent hover:opacity-100' : ''
                }`}
                onClick={() => head !== 'Action' && handleSort(head)}
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
          {agents.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={AGENTS_TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                Loading agents...
              </TableCell>
            </TableRow>
          ) : sortedAgents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={AGENTS_TABLE_HEAD.length}
                className='p-4 text-center text-foreground'
              >
                No matching agents found
              </TableCell>
            </TableRow>
          ) : (
            paginatedAgents.map((agent) => (
              <TableRow key={agent.id} className='border-border'>
                <TableCell className='p-4'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium text-foreground'>
                        {agent.name || 'Untitled'}
                      </h3>
                    </div>
                    <p className='max-w-[300px] truncate text-sm text-muted-foreground'>
                      {agent.description || 'No description'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                    {agent.promptTitle || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  <span className='inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'>
                    {agent.temperature ? agent.temperature.toFixed(2) : 'N/A'}
                  </span>
                </TableCell>
                <TableCell className='p-4 text-foreground'>
                  {formatDate(agent.createdAt)}
                </TableCell>
                <TableCell className='p-4 text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger className='rounded-md p-2 hover:bg-accent'>
                      <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleEdit(agent.id)}
                        className='cursor-pointer'
                      >
                        <PencilIcon className='h-4 w-4' />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() =>
                          handleDelete(agent.id, agent.name || 'Untitled')
                        }
                      >
                        <TrashIcon className='h-4 w-4' />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {sortedAgents.length > 0 && (
          <TableFooter>
            <TableRow className='bg-background'>
              <TableCell
                colSpan={AGENTS_TABLE_HEAD.length}
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
        isOpen={!!deleteAgentId}
        onClose={() => setDeleteAgentId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete Agent'
        description='Are you sure you want to delete this agent? This action cannot be undone.'
        itemName={deleteAgentName}
        confirmText='Delete'
      />
    </div>
  )
}

export default AgentTable
