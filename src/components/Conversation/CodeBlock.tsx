import React from 'react'
import { Button } from '../ui/button'
import { Copy } from 'lucide-react'

export const CodeBlock: React.FC<{
  className?: string
  children: React.ReactNode
  props?: React.HTMLAttributes<HTMLElement>
}> = ({ className, children, props }) => {
  const codeString = String(children).trim()
  const [copied, setCopied] = React.useState(false)
  return (
    <div className='group relative my-4'>
      <pre className='not-prose overflow-x-auto rounded-md bg-transparent text-foreground'>
        <code className={className + ' text-foreground'} {...props}>
          {children}
        </code>
      </pre>
      <div className='mt-2 flex items-center'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='dark:bg-dark-chat-history/80 flex h-6 min-h-0 w-6 min-w-0 items-center justify-center border border-border bg-background px-1 py-0.5 text-foreground opacity-80 shadow-sm transition-opacity hover:opacity-100'
          style={{ fontSize: '0.75rem' }}
          onClick={() => {
            navigator.clipboard.writeText(codeString)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
          title={copied ? 'Copied!' : 'Copy code'}
          tabIndex={0}
        >
          <Copy
            className='h-3 w-3 transition-transform duration-200'
            style={{
              transform: copied ? 'scale(1.2) rotate(-20deg)' : 'scale(1)',
            }}
          />
        </Button>
        {copied && (
          <span
            className='animate-fade-in-out dark:bg-dark-chat-history/90 ml-2 rounded bg-background px-2 py-0.5 text-xs font-semibold text-green-600 shadow dark:text-green-400'
            style={{ zIndex: 20 }}
          >
            Snippet copied!
          </span>
        )}
      </div>
    </div>
  )
}
