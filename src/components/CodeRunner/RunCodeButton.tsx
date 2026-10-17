import React from 'react'
import { Play, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface RunCodeButtonProps {
  running: boolean
  onRun: () => void
  onStop: () => void
  className?: string
}

const RunCodeButton: React.FC<RunCodeButtonProps> = ({
  running,
  onRun,
  onStop,
  className,
}) => (
  <Button
    type='button'
    variant='ghost'
    size='sm'
    className={cn('h-6 gap-1 px-2 text-xs text-muted-foreground', className)}
    onClick={running ? onStop : onRun}
    title={running ? 'Stop the program' : 'Run this code in your browser'}
    aria-label={running ? 'Stop' : 'Run'}
  >
    {running ? (
      <Square className='h-3 w-3 fill-current' />
    ) : (
      <Play className='h-3.5 w-3.5 fill-current' />
    )}
    <span className='hidden sm:inline'>{running ? 'Stop' : 'Run'}</span>
  </Button>
)

export default RunCodeButton
