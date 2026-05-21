import React, { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import type { ArtifactType } from '@/redux/types/artifact'
import {
  generateDocxBlob,
  generateDocxHtml,
  generateDocxPlainText,
} from './renderers/DocxRenderer'
import type { DocxDocumentConfig } from '@/redux/types/dareToolResults'
import { toast } from '@/utils/toast'

interface ArtifactActionsProps {
  content: string
  title: string
  artifactType: ArtifactType
}

const SUPPORTED_ACTION_TYPES: readonly ArtifactType[] = ['docx', 'react']

const ArtifactActions: React.FC<ArtifactActionsProps> = ({
  content,
  title,
  artifactType,
}) => {
  const [copied, setCopied] = useState(false)

  if (!SUPPORTED_ACTION_TYPES.includes(artifactType)) {
    return null
  }

  const sanitizedTitle =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'artifact'

  const handleCopy = async () => {
    if (!content) return

    try {
      if (artifactType === 'docx') {
        const config = JSON.parse(content) as DocxDocumentConfig
        const plainText = generateDocxPlainText(config)
        const html = generateDocxHtml(config)

        const canWriteRichClipboard =
          typeof window !== 'undefined' &&
          typeof window.ClipboardItem !== 'undefined' &&
          typeof navigator.clipboard.write === 'function'

        if (canWriteRichClipboard) {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': new Blob([html], { type: 'text/html' }),
              'text/plain': new Blob([plainText], { type: 'text/plain' }),
            }),
          ])
        } else {
          await navigator.clipboard.writeText(plainText)
        }
      } else {
        await navigator.clipboard.writeText(content)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy content:', error)
      toast.error('Failed to copy content. Please try again.')
    }
  }

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownload = async () => {
    if (!content) return

    if (artifactType === 'docx') {
      try {
        const config = JSON.parse(content) as DocxDocumentConfig
        const blob = await generateDocxBlob(config)
        triggerDownload(blob, `${sanitizedTitle}.docx`)
      } catch (error) {
        console.error('Failed to download docx artifact:', error)
        toast.error('Failed to generate document. Please try again.')
      }
      return
    }

    triggerDownload(
      new Blob([content], { type: 'text/jsx' }),
      `${sanitizedTitle}.jsx`
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <TooltipProvider>
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => void handleDownload()}
              disabled={!content}
              className='h-8 w-8 p-0'
            >
              <Download className='h-4 w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default ArtifactActions
