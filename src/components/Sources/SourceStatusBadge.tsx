import { Badge } from '@/components/ui/badge'
import { MyFile } from '@/redux/types/files'
import { FileStatus } from '@/utils/constants/file'
import { getStatusDisplay } from '@/utils/constants/files'

interface SourceStatusBadgeProps {
  file: MyFile
}

/** Shows status only when it tells the user something; a healthy processed
 *  file shows nothing. */
const SourceStatusBadge = ({ file }: SourceStatusBadgeProps) => {
  if (file.status !== FileStatus.PROCESSED) {
    return getStatusDisplay(
      file.status,
      file.errorMessage,
      file.processingStage
    )
  }
  if (file.ocr?.status === 'awaiting_approval') {
    return <Badge variant='yellow'>Transcription needs approval</Badge>
  }
  if (file.ocr?.status === 'partial') {
    return <Badge variant='yellow'>Transcription paused</Badge>
  }
  if (file.failedImageCount) {
    return (
      <Badge
        variant='yellow'
        title={`${file.failedImageCount} figure descriptions failed`}
      >
        {file.failedImageCount}{' '}
        {file.failedImageCount === 1 ? 'figure' : 'figures'} failed
      </Badge>
    )
  }
  if (file.errorMessage) {
    return (
      <Badge variant='yellow' title={file.errorMessage}>
        Processed with warnings
      </Badge>
    )
  }
  return null
}

export default SourceStatusBadge
