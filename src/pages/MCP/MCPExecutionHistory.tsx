import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getMcpExecutions } from '@/redux/asyncThunks/mcp'
import { MCPExecutionRow } from '@/components/MCP'
import { Loader2, Clock, AlertCircle } from 'lucide-react'

/**
 * MCPExecutionHistory - Display execution logs
 */
const MCPExecutionHistory = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { executionHistory, executionHistoryLoading, error } = useAppSelector(
    (state) => state.mcp
  )

  // Fetch execution history on mount
  useEffect(() => {
    dispatch(getMcpExecutions(undefined))
  }, [dispatch])

  if (executionHistoryLoading && executionHistory.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
        <AlertCircle className='mb-4 h-12 w-12 text-red-500' />
        <h3 className='text-lg font-medium'>Failed to load history</h3>
        <p className='text-sm text-muted-foreground'>{error}</p>
      </div>
    )
  }

  if (executionHistory.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
        <Clock className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='text-lg font-medium'>No executions yet</h3>
        <p className='mb-4 text-sm text-muted-foreground'>
          Execute a tool to see it appear here
        </p>
        <button
          onClick={() => navigate('/mcp')}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
        >
          Browse Servers
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Execution History</h2>
          <p className='text-sm text-muted-foreground'>
            {executionHistory.length} execution
            {executionHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Execution List */}
      <div className='space-y-3'>
        {executionHistory.map((execution) => (
          <MCPExecutionRow key={execution.id} execution={execution} />
        ))}
      </div>
    </div>
  )
}

export default MCPExecutionHistory
