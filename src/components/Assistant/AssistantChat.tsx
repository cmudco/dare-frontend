import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp, Loader2, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assistantIntroFor } from '@/constants/assistant'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  selectAssistant,
  selectAssistantLimitReached,
  type AssistantLiveStep,
} from '@/redux/assistantSlice'
import {
  assistantSocketSend,
  assistantSocketStop,
} from '@/redux/middleware/assistantSocketMiddleware'
import type { AssistantMessage } from '@/schemas/assistantSocket'
import { AssistantMarkdown } from './AssistantMarkdown'
import { AssistantSteps, type AssistantStepView } from './AssistantSteps'
import { ProposalCard } from './ProposalCard'

function MessageBubble({
  message,
  liveSteps,
}: {
  message: AssistantMessage
  liveSteps: AssistantLiveStep[]
}) {
  if (message.role === 'user') {
    return (
      <div className='flex justify-end'>
        <div className='max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground'>
          {message.content}
        </div>
      </div>
    )
  }
  const isStreaming = message.status === 'streaming'
  const steps: AssistantStepView[] = isStreaming
    ? liveSteps.map((step) => ({ ...step, key: step.id }))
    : message.toolCalls.map((call, index) => ({
        key: `${message.id}-${index}`,
        name: call.name,
        status: call.status,
        arguments: call.arguments,
      }))
  const isRunningTool = steps.some((step) => step.status === 'running')
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
      {message.status === 'failed' && (
        <p className='text-xs text-destructive'>
          Something went wrong answering this. Please try again.
        </p>
      )}
      {message.status === 'stopped' && (
        <p className='mt-1 text-xs text-muted-foreground'>Stopped</p>
      )}
    </div>
  )
}

export function AssistantChat() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { messages, usage, threadStatus, isAnswering, liveSteps, error } =
    useAppSelector(selectAssistant)
  const limitReached = useAppSelector(selectAssistantLimitReached)
  const isLoading = threadStatus === 'loading'
  const intro = assistantIntroFor(location.pathname)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, liveSteps])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = (text: string) => {
    if (!text.trim() || isAnswering || limitReached) return
    dispatch(assistantSocketSend({ message: text, path: location.pathname }))
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit(draft)
    }
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div
        ref={scrollRef}
        className='min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3'
        data-testid='assistant-messages'
      >
        {isLoading && messages.length === 0 && (
          <div className='flex justify-center py-8'>
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className='flex flex-col items-start gap-3 py-2'>
            <div>
              <p className='text-sm font-medium text-foreground'>
                {intro.title}
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Ask about DARE, or about your own usage, files, chats and
                projects.
              </p>
            </div>
            <div className='flex flex-col items-start gap-1.5'>
              {intro.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type='button'
                  onClick={() => submit(suggestion)}
                  className='rounded-lg border border-border px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted'
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            liveSteps={liveSteps}
          />
        ))}
        {isAnswering &&
          messages[messages.length - 1]?.status !== 'streaming' && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Loader2 className='h-3 w-3 animate-spin' />
              Thinking…
            </div>
          )}
      </div>

      <div className='border-t border-border p-3'>
        {error && <p className='mb-2 text-xs text-destructive'>{error}</p>}
        <div className='flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring'>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={4000}
            disabled={limitReached}
            placeholder={
              limitReached
                ? "You've reached today's limit"
                : 'Ask about DARE or this page…'
            }
            aria-label='Ask the DARE assistant'
            className='[field-sizing:content] max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground'
          />
          {isAnswering ? (
            <Button
              type='button'
              size='icon'
              variant='secondary'
              className='h-7 w-7 shrink-0 rounded-full'
              onClick={() => dispatch(assistantSocketStop())}
              aria-label='Stop answering'
            >
              <Square className='h-3 w-3' />
            </Button>
          ) : (
            <Button
              type='button'
              size='icon'
              className='h-7 w-7 shrink-0 rounded-full'
              onClick={() => submit(draft)}
              disabled={!draft.trim() || limitReached}
              aria-label='Send question'
            >
              <ArrowUp className='h-3.5 w-3.5' />
            </Button>
          )}
        </div>
        {usage && (
          <p className='mt-1.5 text-right text-[11px] text-muted-foreground'>
            {usage.usedToday}/{usage.dailyLimit} questions today
          </p>
        )}
      </div>
    </div>
  )
}
