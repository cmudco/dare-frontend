import { History } from 'lucide-react'

/**
 * MCPExecutionHistory - Placeholder for execution history page
 * Will be implemented with backend endpoint for listing executions
 */
const MCPExecutionHistory = () => {
  return (
    <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
      <History className='mb-4 h-12 w-12 text-muted-foreground' />
      <h3 className='text-lg font-medium'>Execution History</h3>
      <p className='text-muted-foreground'>
        Coming soon - View past tool executions
      </p>
    </div>
  )
}

export default MCPExecutionHistory
