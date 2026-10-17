import React, { useState } from 'react'
import { useCodeRunner } from '@/hooks/useCodeRunner'
import { readsInput, RUNNER_LABELS } from '@/utils/codeRunner/protocol'
import type { RunnerLanguage } from '@/utils/codeRunner/protocol'
import CodeRunOutput from './CodeRunOutput'
import RunCodeButton from './RunCodeButton'

interface ArtifactCodeRunnerProps {
  runner: RunnerLanguage
  /** The editor's current text, saved or not. */
  code: string
}

/** Run bar and output pane under a code artifact's editor. */
const ArtifactCodeRunner: React.FC<ArtifactCodeRunnerProps> = ({
  runner,
  code,
}) => {
  const run = useCodeRunner(runner)
  const [open, setOpen] = useState(false)
  const [stdin, setStdin] = useState('')
  const needsInput = readsInput(runner, code)

  const handleRun = () => {
    const firstOpen = !open
    setOpen(true)
    if (needsInput && firstOpen && !stdin) return
    run.run(code, stdin)
  }
  const handleClose = () => {
    run.stop()
    run.clear()
    setOpen(false)
  }

  return (
    <div className='flex max-h-[45%] shrink-0 flex-col gap-2 border-t border-border bg-muted/30 px-4 py-2'>
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <RunCodeButton
          running={run.status === 'running'}
          onRun={handleRun}
          onStop={run.stop}
          className='border border-border bg-background text-foreground'
        />
        <span>
          {RUNNER_LABELS[runner]} · runs in your browser, nothing is installed
        </span>
      </div>
      {open && (
        <CodeRunOutput
          run={run}
          language={runner}
          needsInput={needsInput}
          stdin={stdin}
          onStdinChange={setStdin}
          onClose={handleClose}
          className='min-h-0 overflow-auto'
        />
      )}
    </div>
  )
}

export default ArtifactCodeRunner
