import { Badge } from '@/components/ui/badge'
import { FileStatus } from './file'
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileJsonIcon,
  FileArchiveIcon,
} from 'lucide-react'

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
          <Loader2 className='mr-1 h-4 w-4 animate-spin' /> Processing
        </Badge>
      )
    case FileStatus.PROCESSED:
      return (
        <Badge variant='green'>
          <CheckCircle className='mr-1 h-4 w-4' /> Processed
        </Badge>
      )
    case FileStatus.FAILED:
      return (
        <Badge variant='destructive'>
          <XCircle className='mr-1 h-4 w-4' /> Failed
        </Badge>
      )
    default:
      return <Badge variant='outline'>Unknown</Badge>
  }
}

export const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileIcon className='h-5 w-5 text-gray-500' />

  const type = fileType.toLowerCase()

  if (
    type.includes('image') ||
    ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].some((ext) =>
      type.includes(ext)
    )
  ) {
    return <FileImageIcon className='h-5 w-5 text-blue-500' />
  } else if (
    type.includes('text') ||
    ['doc', 'docx', 'txt', 'pdf', 'md'].some((ext) => type.includes(ext))
  ) {
    return <FileTextIcon className='h-5 w-5 text-green-500' />
  } else if (
    type.includes('json') ||
    ['js', 'ts', 'jsx', 'tsx'].some((ext) => type.includes(ext))
  ) {
    return <FileJsonIcon className='h-5 w-5 text-yellow-500' />
  } else if (
    type.includes('zip') ||
    type.includes('rar') ||
    type.includes('tar') ||
    type.includes('gz')
  ) {
    return <FileArchiveIcon className='h-5 w-5 text-purple-500' />
  } else {
    return <FileIcon className='h-5 w-5 text-gray-500' />
  }
}
