import React, { useState } from 'react'
import { Copy, Download, Check, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import type { ArtifactType } from '@/redux/types/artifact'
import { generateDocxBlob } from './renderers/DocxRenderer'
import type { DocxDocumentConfig } from '@/redux/types/dareToolResults'
import { toast } from '@/utils/toast'

interface ArtifactActionsProps {
  content: string
  title: string
  artifactType: ArtifactType
  language?: string
  wordCount?: number
  disabled?: boolean
}

const ArtifactActions: React.FC<ArtifactActionsProps> = ({
  content,
  title,
  artifactType,
  language,
  wordCount,
  disabled = false,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (disabled || !content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy content:', error)
    }
  }

  const handleDownload = async () => {
    if (disabled || !content) return

    // Determine file extension based on artifact type
    let extension = 'md'
    let mimeType = 'text/markdown'

    if (artifactType === 'docx') {
      try {
        const config = JSON.parse(content) as DocxDocumentConfig
        const blob = await generateDocxBlob(config)
        const sanitizedTitle =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'artifact'

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${sanitizedTitle}.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download docx artifact:', error)
        toast.error('Failed to generate document. Please try again.')
      }
      return
    }

    if (artifactType === 'code' && language) {
      const languageExtensions: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        csharp: 'cs',
        go: 'go',
        rust: 'rs',
        ruby: 'rb',
        php: 'php',
        swift: 'swift',
        kotlin: 'kt',
        html: 'html',
        css: 'css',
        json: 'json',
        yaml: 'yaml',
        sql: 'sql',
        bash: 'sh',
        shell: 'sh',
      }
      extension = languageExtensions[language.toLowerCase()] || 'txt'
      mimeType = 'text/plain'
    }

    const sanitizedTitle =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'artifact'

    const filename = `${sanitizedTitle}.${extension}`
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='flex items-center gap-2'>
      {/* Word count */}
      {wordCount !== undefined && (
        <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
          <FileText className='h-3.5 w-3.5' />
          <span>{wordCount.toLocaleString()} words</span>
        </div>
      )}

      <TooltipProvider>
        {/* Copy button — hidden for docx since raw JSON is not useful */}
        {artifactType !== 'docx' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopy}
                disabled={disabled || !content}
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

        {/* Download button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => void handleDownload()}
              disabled={disabled || !content}
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
