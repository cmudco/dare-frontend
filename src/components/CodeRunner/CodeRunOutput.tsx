import React from 'react'
import { Check, CircleAlert, Loader2, Square, Terminal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CodeRunState } from '@/hooks/useCodeRunner'
import { RUNNER_LABELS } from '@/utils/codeRunner/protocol'
import type { RunnerLanguage } from '@/utils/codeRunner/protocol'

interface CodeRunOutputProps {
  run: CodeRunState
  language: RunnerLanguage
  needsInput: boolean
  stdin: string
  onStdinChange: (value: string) => void
  onClose: () => void
  className?: string
}

const formatDuration = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`

const CodeRunOutput: React.FC<CodeRunOutputProps> = ({
  run,
  language,
  needsInput,
  stdin,
  onStdinChange,
  onClose,
  className,
}) => {
  const hasOutput = run.output.length > 0 || run.figures.length > 0 || run.error

  return (
    <div
      className={cn(
        'not-prose overflow-hidden rounded-lg border border-border bg-card text-foreground',
        className
      )}
    >
      <div className='flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground'>
        <Terminal className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>Output</span>
        <span className='hidden sm:inline'>
          {RUNNER_LABELS[language]} · runs in your browser
        </span>
        <span className='flex-1' />
        {run.status === 'running' && (
          <span className='flex items-center gap-1'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            {run.progress}
          </span>
        )}
        {run.status === 'done' && run.durationMs !== null && (
          <span className='flex items-center gap-1 text-green-600 dark:text-green-400'>
            <Check className='h-3.5 w-3.5' />
            {formatDuration(run.durationMs)}
          </span>
        )}
        {run.status === 'failed' && (
          <span className='flex items-center gap-1 text-destructive'>
            <CircleAlert className='h-3.5 w-3.5' />
            Error
          </span>
        )}
        {run.status === 'stopped' && (
          <span className='flex items-center gap-1'>
            <Square className='h-3 w-3 fill-current' />
            Stopped
          </span>
        )}
        <button
          type='button'
          onClick={onClose}
          className='rounded-sm p-0.5 hover:bg-accent hover:text-foreground'
          aria-label='Close output'
        >
          <X className='h-3.5 w-3.5' />
        </button>
      </div>

      {needsInput && (
        <div className='border-b border-border px-3 py-2'>
          <label className='mb-1 block text-xs text-muted-foreground'>
            Program input · one line per{' '}
            <code className='font-mono'>
              {language === 'python' ? 'input()' : 'prompt()'}
            </code>{' '}
            call
          </label>
          <textarea
            value={stdin}
            onChange={(event) => onStdinChange(event.target.value)}
            rows={2}
            spellCheck={false}
            placeholder='Type the answers your program will ask for'
            className='w-full resize-y rounded-md border border-border bg-background px-2 py-1 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
          />
        </div>
      )}

      {hasOutput ? (
        <div className='max-h-80 overflow-auto px-3 py-2 font-mono text-[0.8125rem] leading-relaxed'>
          {run.output.length > 0 && (
            <pre className='font-mono text-[0.8125rem] break-words whitespace-pre-wrap'>
              {run.output.map((chunk, index) => (
                <span
                  key={index}
                  className={cn(
                    chunk.stream === 'stderr' && 'text-destructive'
                  )}
                >
                  {chunk.text}
                </span>
              ))}
            </pre>
          )}
          {run.error && (
            <pre
              className={cn(
                'mt-1 font-mono text-[0.8125rem] break-words whitespace-pre-wrap',
                run.status === 'stopped'
                  ? 'text-muted-foreground'
                  : 'text-destructive'
              )}
            >
              {run.error}
            </pre>
          )}
          {run.figures.map((figure, index) => (
            <img
              key={index}
              src={`data:image/png;base64,${figure}`}
              alt={`Figure ${index + 1}`}
              className='my-2 max-h-96 max-w-full rounded-md border border-border bg-white'
            />
          ))}
        </div>
      ) : (
        <p className='px-3 py-2 text-xs text-muted-foreground'>
          {run.status === 'running'
            ? 'Waiting for output…'
            : run.status === 'done'
              ? 'The program finished without printing anything.'
              : run.status === 'stopped'
                ? 'Stopped before printing anything.'
                : 'Press Run to execute the code.'}
        </p>
      )}
    </div>
  )
}

export default CodeRunOutput
