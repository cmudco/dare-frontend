import { Badge } from '@/components/ui/badge'
import { FileStatus } from './file'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export const getJobStatusDisplay = (jobStatus?: string) => {
  switch (jobStatus) {
    case 'queued':
      return <Badge variant='secondary'>Queued</Badge>
    case 'started':
      return <Badge variant='secondary'>Started</Badge>
    case 'finished':
      return <Badge variant='green'>Finished</Badge>
    case 'failed':
      return <Badge variant='destructive'>Failed</Badge>
    default:
      return <Badge variant='outline'>Pending</Badge>
  }
}

export const getStatusDisplay = (status: FileStatus) => {
  switch (status) {
    case FileStatus.PROCESSING:
      return (
        <Badge variant='secondary'>
          <Loader2 className='w-4 h-4 animate-spin mr-1' /> Processing
        </Badge>
      )
    case FileStatus.PROCESSED:
      return (
        <Badge variant='green'>
          <CheckCircle className='w-4 h-4 mr-1' /> Processed
        </Badge>
      )
    case FileStatus.FAILED:
      return (
        <Badge variant='destructive'>
          <XCircle className='w-4 h-4 mr-1' /> Failed
        </Badge>
      )
    default:
      return <Badge variant='outline'>Unknown</Badge>
  }
}
