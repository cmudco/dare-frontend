import React from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import type { ProviderToolResult } from '@/redux/types/dareToolResults'

interface ProviderToolResultViewProps {
  result: ProviderToolResult
}

const formatContentSize = (size?: number) => {
  if (!size) return null
  return `${size.toLocaleString()} chars`
}

const formatRetrievalStatus = (status?: string) => {
  if (!status) return null
  return status.replace(/^URL_RETRIEVAL_STATUS_/, '').toLowerCase()
}

/**
 * Renders the result of a provider-native tool (for example Anthropic
 * web_fetch): source link, retrieval metadata, and a content preview.
 */
export const ProviderToolResultView: React.FC<ProviderToolResultViewProps> = ({
  result,
}) => {
  const contentSize = formatContentSize(result.contentSize)
  const retrievalStatus = formatRetrievalStatus(result.retrievalStatus)

  return (
    <div className='mt-2 space-y-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
      <div className='flex items-start gap-2'>
        <FileText className='mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
        <div className='min-w-0 flex-1'>
          {result.url ? (
            <a
              href={result.url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex max-w-full items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400'
            >
              <span className='truncate'>{result.title || result.url}</span>
              <ExternalLink className='h-3 w-3 shrink-0' />
            </a>
          ) : (
            <span className='font-medium text-foreground'>
              {result.title || 'Fetched content'}
            </span>
          )}
          <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground'>
            {result.mediaType && <span>{result.mediaType}</span>}
            {retrievalStatus && <span>{retrievalStatus}</span>}
            {contentSize && <span>{contentSize}</span>}
            {result.retrievedAt && <span>{result.retrievedAt}</span>}
            {result.truncated && <span>truncated preview</span>}
          </div>
        </div>
      </div>

      {result.errorCode && (
        <div className='rounded-sm bg-destructive/10 p-2 text-destructive'>
          {result.errorCode}
        </div>
      )}

      {result.contentPreview && (
        <div className='max-h-60 overflow-auto rounded-sm bg-card p-2'>
          <pre className='m-0 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap'>
            {result.contentPreview}
          </pre>
        </div>
      )}
    </div>
  )
}

export default ProviderToolResultView
