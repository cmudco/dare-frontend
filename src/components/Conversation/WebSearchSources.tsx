import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Quote,
} from 'lucide-react'
import { WebSearchSource } from '@/redux/types/conversation'

interface WebSearchSourcesProps {
  sources: WebSearchSource[]
}

const providerColors: Record<string, string> = {
  openai:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  claude:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const WebSearchSources: React.FC<WebSearchSourcesProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!sources || sources.length === 0) return null

  const toggleOpen = () => setIsOpen(!isOpen)

  // Extract domain from URL for display
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className='mt-2 w-full min-w-0 max-w-[95%] pl-0 sm:pl-10'>
      <button
        onClick={toggleOpen}
        className='flex items-center text-sm text-muted-foreground hover:text-foreground'
      >
        {isOpen ? (
          <ChevronUp className='mr-1 h-4 w-4' />
        ) : (
          <ChevronDown className='mr-1 h-4 w-4' />
        )}
        <Globe className='mr-1.5 h-4 w-4' />
        {isOpen ? 'Hide Web Sources' : `Show Web Sources (${sources.length})`}
      </button>

      {isOpen && (
        <div className='mt-2 space-y-2'>
          {sources.map((source) => (
            <div
              key={source.id}
              className='rounded-lg border border-border bg-muted/50 p-3'
            >
              <div className='flex min-w-0 flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <a
                    href={source.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary'
                  >
                    <span className='truncate'>
                      {source.title || getDomain(source.url)}
                    </span>
                    <ExternalLink className='h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
                  </a>
                  <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                    {getDomain(source.url)}
                  </p>
                </div>

                <div className='flex shrink-0 flex-wrap items-center gap-2'>
                  {source.pageAge && (
                    <span className='text-xs text-muted-foreground'>
                      {source.pageAge}
                    </span>
                  )}
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      providerColors[source.provider] ||
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {source.provider}
                  </span>
                </div>
              </div>

              {source.citedText && (
                <div className='mt-2 flex items-start gap-2 rounded-sm border-l-2 border-muted-foreground/30 bg-background/50 p-2'>
                  <Quote className='mt-0.5 h-3 w-3 shrink-0 text-muted-foreground' />
                  <p className='line-clamp-3 text-xs text-muted-foreground'>
                    {source.citedText}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WebSearchSources
