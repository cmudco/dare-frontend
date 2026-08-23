import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Check,
  Code,
  Copy,
  Download,
  FileImage,
  FileText,
  Loader2,
  Presentation,
} from 'lucide-react'
import type { ArtifactType } from '@/redux/types/artifact'
import type { RootState } from '@/redux/store'
import { ArtifactDownloadFormat } from '@/utils/constants/artifactDownloads'
import { toast } from '@/utils/toast'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import {
  getDownloadOptions,
  getFormatLabel,
} from './download/artifactDownloadOptions'
import { copyArtifactContent } from './download/artifactClipboard'
import { downloadArtifact } from './download/artifactDownloader'
import { sanitizeDownloadTitle } from './download/fileDownload'

interface ArtifactActionsProps {
  artifactId: number
  content: string
  title: string
  artifactType: ArtifactType
  filename?: string
  contentType?: string
}

const SUPPORTED_ACTION_TYPES: ArtifactType[] = [
  'docx',
  'pptx',
  'pdf',
  'diagram',
  'chart',
  'image',
  'react',
  'code',
  'document',
]

const COPYABLE_ACTION_TYPES: ArtifactType[] = [
  'docx',
  'diagram',
  'react',
  'code',
  'document',
]

const ArtifactActions: React.FC<ArtifactActionsProps> = ({
  artifactId,
  content,
  title,
  artifactType,
  filename,
  contentType,
}) => {
  const [copied, setCopied] = useState(false)
  const [loadingFormat, setLoadingFormat] =
    useState<ArtifactDownloadFormat | null>(null)
  const conversationId = useSelector(
    (state: RootState) => state.conversation.activeConversation?.conversationId
  )

  if (!SUPPORTED_ACTION_TYPES.includes(artifactType)) {
    return null
  }

  const copyAvailable = COPYABLE_ACTION_TYPES.includes(artifactType)
  const downloadOptions = getDownloadOptions(
    artifactType,
    contentType,
    filename,
    content
  )
  const sanitizedTitle = sanitizeDownloadTitle(title)

  const handleCopy = async () => {
    if (!content) return

    try {
      await copyArtifactContent(artifactType, content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy content:', error)
      toast.error('Failed to copy content. Please try again.')
    }
  }

  const handleDownload = async (format: ArtifactDownloadFormat) => {
    if (!content) return

    setLoadingFormat(format)
    try {
      await downloadArtifact({
        artifactId,
        artifactType,
        content,
        contentType,
        conversationId,
        filename,
        format,
        sanitizedTitle,
      })
    } catch (error) {
      console.error(`Failed to download ${artifactType} as ${format}:`, error)
      toast.error(
        `Failed to generate ${getFormatLabel(format)}. Please try again.`
      )
    } finally {
      setLoadingFormat(null)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <TooltipProvider>
        {copyAvailable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => void handleCopy()}
                disabled={!content}
                className='h-8 w-8 p-0'
              >
                {copied ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              disabled={!content || !!loadingFormat}
              className='h-8 w-8 p-0'
              title='Download'
            >
              {loadingFormat ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Download className='h-4 w-4' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {downloadOptions.map((option) => (
              <DropdownMenuItem
                key={option.format}
                disabled={!!loadingFormat}
                onSelect={(event) => {
                  event.preventDefault()
                  void handleDownload(option.format)
                }}
              >
                {getDownloadIcon(option.format)}
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  )
}

function getDownloadIcon(format: ArtifactDownloadFormat) {
  switch (format) {
    case ArtifactDownloadFormat.PPTX:
      return <Presentation className='h-4 w-4' />
    case ArtifactDownloadFormat.IMAGE_ORIGINAL:
    case ArtifactDownloadFormat.PNG:
    case ArtifactDownloadFormat.JPEG:
      return <FileImage className='h-4 w-4' />
    case ArtifactDownloadFormat.CHART_JSON:
    case ArtifactDownloadFormat.MMD:
    case ArtifactDownloadFormat.JSX:
    case ArtifactDownloadFormat.TXT:
    case ArtifactDownloadFormat.MD:
      return <Code className='h-4 w-4' />
    default:
      return <FileText className='h-4 w-4' />
  }
}

export default ArtifactActions
