import React, { useRef, useEffect, useState, useCallback } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface ReactComponentRendererProps {
  /** React component JSX code */
  code: string
  /** Title for the iframe */
  title: string
  /** Callback when an error occurs */
  onError?: (error: string) => void
}

type SandboxStatus = 'loading' | 'ready' | 'rendering' | 'success' | 'error'

/**
 * ReactComponentRenderer - Renders React components in a sandboxed iframe
 *
 * Uses postMessage API to communicate with the sandbox.
 * The sandbox pre-loads React, Tailwind CSS, Shadcn UI components, Lucide icons, and Recharts.
 */
export const ReactComponentRenderer: React.FC<ReactComponentRendererProps> = ({
  code,
  title,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<SandboxStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const prevCodeRef = useRef<string>('')
  const isReadyRef = useRef(false)

  const sendCode = useCallback((codeToSend: string) => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      setStatus('rendering')
      setError(null)
      iframe.contentWindow.postMessage(
        { type: 'render', code: codeToSend },
        '*'
      )
    }
  }, [])

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) return

      switch (event.data.type) {
        case 'ready':
          isReadyRef.current = true
          setStatus('ready')
          sendCode(code)
          prevCodeRef.current = code
          break
        case 'success':
          setStatus('success')
          setError(null)
          break
        case 'error':
          setStatus('error')
          setError(event.data.message)
          onError?.(event.data.message)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [code, sendCode, onError])

  // Re-render ONLY when code prop changes (not status!)
  useEffect(() => {
    if (isReadyRef.current && code !== prevCodeRef.current) {
      sendCode(code)
      prevCodeRef.current = code
    }
  }, [code, sendCode])

  return (
    <div className='relative h-full min-h-[300px] w-full overflow-hidden rounded-lg bg-gray-950'>
      {/* Loading overlay */}
      {(status === 'loading' || status === 'rendering') && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-gray-950'>
          <div className='flex items-center gap-2 text-gray-400'>
            <svg className='h-5 w-5 animate-spin' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                fill='none'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              />
            </svg>
            <span>
              {status === 'loading' ? 'Loading sandbox...' : 'Rendering...'}
            </span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {status === 'error' && error && (
        <div className='absolute left-0 right-0 top-0 z-10 border-b border-red-800 bg-red-950 p-3'>
          <div className='flex items-start gap-2'>
            <svg
              className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-red-300'>
                Component Error
              </p>
              <p className='mt-1 break-all font-mono text-sm text-red-400'>
                {error}
              </p>
            </div>
            <button
              onClick={() => sendCode(code)}
              className='flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300'
            >
              <ArrowPathIcon className='h-4 w-4' />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Sandboxed iframe */}
      <iframe
        ref={iframeRef}
        src='/react-sandbox.html'
        sandbox='allow-scripts'
        className={`h-full w-full border-0 ${status === 'error' ? 'pt-16' : ''}`}
        title={title}
      />
    </div>
  )
}

export default ReactComponentRenderer
