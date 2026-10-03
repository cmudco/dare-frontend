import { Loader2 } from 'lucide-react'
import type { AssistantLiveStep } from '@/redux/assistantSlice'
import type { AssistantMessage } from '@/schemas/assistantSocket'
import {
  AssistantMessageStatus,
  AssistantRole,
  AssistantStepStatus,
} from '@/utils/constants/assistant'
import { AssistantMarkdown } from './AssistantMarkdown'
import { AssistantSteps, type AssistantStepView } from './AssistantSteps'
import { ProposalCard } from './ProposalCard'

export function AssistantMessageBubble({
  message,
  liveSteps,
}: {
  message: AssistantMessage
  liveSteps: AssistantLiveStep[]
}) {
  if (message.role === AssistantRole.USER) {
    return (
      <div className='flex justify-end'>
        <div className='max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground'>
          {message.content}
        </div>
      </div>
    )
  }
  const isStreaming = message.status === AssistantMessageStatus.STREAMING
  const steps: AssistantStepView[] = isStreaming
    ? liveSteps.map((step) => ({ ...step, key: step.id }))
    : message.toolCalls.map((call, index) => ({
        key: `${message.id}-${index}`,
        name: call.name,
        status: call.status,
        arguments: call.arguments,
      }))
  const isRunningTool = steps.some(
    (step) => step.status === AssistantStepStatus.RUNNING
  )
  return (
    <div className='text-sm text-foreground'>
      <AssistantSteps steps={steps} />
      {message.content && <AssistantMarkdown content={message.content} />}
      {isStreaming && !isRunningTool && !message.content && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Loader2 className='h-3 w-3 animate-spin' />
          {steps.length ? 'Reading what I found…' : 'Thinking…'}
        </div>
      )}
      {message.proposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
      {message.status === AssistantMessageStatus.FAILED && (
        <p className='text-xs text-destructive'>
          Something went wrong answering this. Please try again.
        </p>
      )}
      {message.status === AssistantMessageStatus.STOPPED && (
        <p className='mt-1 text-xs text-muted-foreground'>Stopped</p>
      )}
    </div>
  )
}
