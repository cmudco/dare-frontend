import React from 'react'

import type { ToolCall } from '@/redux/types/conversation'

interface CodeSandboxRunViewProps {
  toolCall: ToolCall
}

/** One Python run in the provider's code sandbox: the code, then its output. */
export const CodeSandboxRunView: React.FC<CodeSandboxRunViewProps> = ({
  toolCall,
}) => {
  // The live result event carries the code; persisted arguments hold it too.
  const argumentCode = toolCall.arguments?.code
  const code =
    toolCall.providerResult?.code ??
    (typeof argumentCode === 'string' ? argumentCode : '')
  const logs = toolCall.providerResult?.logs ?? ''

  return (
    <div className='mt-2 space-y-2 text-xs'>
      {code && (
        <pre className='m-0 max-h-64 overflow-auto rounded-sm bg-muted p-2 font-mono leading-relaxed text-foreground'>
          {code}
        </pre>
      )}
      <div>
        <p className='mb-1 font-medium text-muted-foreground'>Output</p>
        <pre className='m-0 max-h-48 overflow-auto rounded-sm bg-muted p-2 font-mono leading-relaxed whitespace-pre-wrap text-muted-foreground'>
          {logs || 'No printed output.'}
        </pre>
      </div>
    </div>
  )
}

export default CodeSandboxRunView
