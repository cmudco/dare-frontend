import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FileStatus } from './file'
import { FileProcessingStage } from '@/redux/types/files'
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileJsonIcon,
  FileArchiveIcon,
  ScanLine,
} from 'lucide-react'

const PROCESSING_STAGE_LABELS: Record<FileProcessingStage, string> = {
  parsing: 'Analyzing document',
  enriching: 'Describing visuals',
  embedding: 'Creating embeddings',
  indexing: 'Storing search index',
  complete: 'Processing',
}

export const getStatusDisplay = (
  status: FileStatus,
  errorMessage?: string,
  processingStage?: FileProcessingStage
) => {
  switch (status) {
    case FileStatus.PROCESSING:
      return (
        <Badge variant='secondary'>
          <Loader2 className='mr-1 h-4 w-4 animate-spin' />{' '}
          {processingStage
            ? PROCESSING_STAGE_LABELS[processingStage]
            : 'Processing'}
        </Badge>
      )
    case FileStatus.PROCESSED:
      return (
        <Badge variant='green'>
          <CheckCircle className='mr-1 h-4 w-4' /> Processed
        </Badge>
      )
    case FileStatus.FAILED: {
      const failedBadge = (
        <Badge variant='destructive' className='cursor-pointer'>
          <XCircle className='mr-1 h-4 w-4' /> Failed
        </Badge>
      )

      if (errorMessage && errorMessage.trim()) {
        const formatErrorMessage = (error: string) => {
          if (error.includes('You exceeded your current quota')) {
            return 'OpenAI quota exceeded. Please check your billing details.'
          }
          if (error.includes('Error generating batch embeddings')) {
            return 'Failed to generate embeddings. Check API limits.'
          }
          if (error.includes('Error reading file content')) {
            return 'Unable to read file content. Check file format.'
          }
          return error
        }

        const displayMessage = formatErrorMessage(errorMessage)

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{failedBadge}</TooltipTrigger>
              <TooltipContent className='max-w-sm p-3' side='top'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>Error Details:</p>
                  <p className='text-xs text-muted-foreground'>
                    {displayMessage}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return failedBadge
    }
    case FileStatus.NEEDS_OCR: {
      const needsOcrBadge = (
        <Badge variant='yellow' className='cursor-pointer'>
          <ScanLine className='mr-1 h-4 w-4' /> Needs OCR
        </Badge>
      )

      // The backend explains which pages were scans; show that rather than a
      // generic "no text found", which reads like a failure.
      if (!errorMessage?.trim()) return needsOcrBadge

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{needsOcrBadge}</TooltipTrigger>
            <TooltipContent className='max-w-sm p-3' side='top'>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Scanned document</p>
                <p className='text-xs text-muted-foreground'>{errorMessage}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    default:
      return <Badge variant='outline'>Unknown</Badge>
  }
}

export const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileIcon className='h-5 w-5 text-muted-foreground' />

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
    return <FileIcon className='h-5 w-5 text-muted-foreground' />
  }
}
