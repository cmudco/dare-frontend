import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatTokens, formatToolCallDuration } from '../../runFormat'
import type { AgentRunToolCall } from '../../types'

/** Pretty-print a tool result when it's JSON; otherwise return it as-is. */
const prettify = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

interface ToolCallModalProps {
  call: AgentRunToolCall | null
  onClose: () => void
}

// Full input/output of one tool call — what was actually searched and what
// actually came back, so a scholar can audit a run without trusting summaries.
const ToolCallModal = ({ call, onClose }: ToolCallModalProps) => (
  <Dialog open={!!call} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className='flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0'>
      {call && (
        <>
          <DialogHeader className='shrink-0 space-y-0.5 border-b border-border px-5 py-3 pr-12 text-left'>
            <DialogTitle className='text-sm'>{call.tool}</DialogTitle>
            <p className='text-xs text-muted-foreground'>
              {call.status} · {formatToolCallDuration(call.durationMs)}
              {call.resultTokens != null &&
                ` · ${formatTokens(call.resultTokens)} added to context`}
            </p>
          </DialogHeader>
          <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4'>
            <div>
              <p className='mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                Input
              </p>
              <pre className='rounded-lg bg-muted/40 p-3 text-xs break-all whitespace-pre-wrap'>
                {call.url || call.query || '—'}
              </pre>
            </div>
            {call.error && (
              <div>
                <p className='mb-1.5 text-xs font-medium tracking-wide text-red-600 uppercase dark:text-red-400'>
                  Error
                </p>
                <pre className='rounded-lg bg-red-500/10 p-3 text-xs break-all whitespace-pre-wrap text-red-700 dark:text-red-300'>
                  {call.error}
                </pre>
              </div>
            )}
            <div>
              <p className='mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                Result
              </p>
              <pre className='rounded-lg bg-muted/40 p-3 text-xs break-all whitespace-pre-wrap'>
                {call.resultSummary
                  ? prettify(call.resultSummary)
                  : call.error
                    ? 'The call failed — see the error above.'
                    : 'No result captured — this is a native agent tool (e.g. web_search) that runs inside the agent loop and never passes through DARE’s gateway. Gateway tools (fetch_page, Scite, Consensus) record their full result here.'}
              </pre>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
)

export default ToolCallModal
