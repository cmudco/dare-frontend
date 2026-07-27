import { CheckCircle, Loader2, Wrench, XCircle } from 'lucide-react'
import { ToolCallStatus } from '@/utils/constants/dareTools'

/** Status icon for a tool call, shared by the row and the timeline rail. */
export const getStatusIcon = (status: ToolCallStatus) => {
  switch (status) {
    case ToolCallStatus.PENDING:
    case ToolCallStatus.EXECUTING:
      return (
        <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground motion-reduce:animate-none' />
      )
    case ToolCallStatus.COMPLETED:
      return <CheckCircle className='h-3.5 w-3.5 text-green-500' />
    case ToolCallStatus.FAILED:
      return <XCircle className='h-3.5 w-3.5 text-destructive' />
    default:
      return <Wrench className='h-3.5 w-3.5 text-muted-foreground' />
  }
}
