import { AnimatePresence, motion } from 'framer-motion'
import { useNextMessageFiles } from '@/hooks/useNextMessageFiles'
import { cn } from '@/lib/utils'
import {
  selectChatTokenTotals,
  selectLastMeasuredReply,
  selectSelectedPickerEntry,
} from '@/redux/conversationSlice'
import { useAppSelector } from '@/redux/hooks'
import { isImageOrAudioModel } from '@/redux/utils/modelSyncHelpers'
import { CONTEXT_NEARLY_FULL_SHARE } from '@/utils/constants/conversation'
import { tokenTotals, usageRounds } from '@/utils/usageDetails'
import { formatCompactTokens } from '../Projects/projectSources'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import ContextTokenCard from './ContextTokenCard'

const RING = 2 * Math.PI * 7
const SPRING = { type: 'spring', stiffness: 140, damping: 22 } as const

const percent = (share: number) =>
  `${share > 0 && share < 0.01 ? '<1' : Math.round(share * 100)}%`

interface NextMessage {
  counting: boolean
  added: number
  removed: number
  estimated: boolean
}

const nextMessageText = (next: NextMessage, mayOverflow: boolean) => {
  if (next.counting)
    return 'Next message: counting tokens for the files you changed…'
  const approx = next.estimated ? '~' : ''
  const parts = [
    next.added > 0 &&
      `${approx}+${formatCompactTokens(next.added)} from files you added`,
    next.removed > 0 &&
      `${approx}−${formatCompactTokens(next.removed)} from files you removed`,
  ].filter(Boolean)
  return [
    `Next message: ${parts.join(', ')}`,
    next.estimated && ' (estimated)',
    mayOverflow && '. It may not fit this model.',
  ]
    .filter(Boolean)
    .join('')
}

/**
 * How much of the selected model's context window the last reply used: its
 * final prompt (history, files, web results, tool output) plus the reply.
 */
const ContextMeter = () => {
  const model = useAppSelector(selectSelectedPickerEntry)
  const last = useAppSelector(selectLastMeasuredReply)
  const chatTotals = useAppSelector(selectChatTokenTotals)
  const next = useNextMessageFiles(last)
  // Image and audio models answer without a chat context window.
  if (!model || isImageOrAudioModel(model)) return null

  const windowTokens = model.maxInputTokens
  const lastRound = last ? usageRounds(last).slice(-1)[0] : undefined
  const prompt = lastRound?.inputTokens ?? 0
  const reply = lastRound?.outputTokens ?? 0
  const used = prompt + reply
  const share = Math.min(used / windowTokens, 1)
  const nearlyFull = share >= CONTEXT_NEARLY_FULL_SHARE
  const fill = nearlyFull ? 'bg-destructive' : 'bg-primary'
  const mayOverflow = used + next.added - next.removed > windowTokens
  const label = last
    ? `Last reply used ${percent(share)} of the context window`
    : 'Context window'
  const segments = [
    { key: 'prompt', tokens: prompt, className: fill },
    { key: 'reply', tokens: reply, className: cn(fill, 'opacity-50') },
    { key: 'added', tokens: next.added, className: cn(fill, 'opacity-20') },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={label}
          title={label}
          className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          <svg viewBox='0 0 18 18' className='h-[18px] w-[18px] -rotate-90'>
            <circle
              cx='9'
              cy='9'
              r='7'
              fill='none'
              strokeWidth='2.5'
              className='stroke-muted'
            />
            <motion.circle
              cx='9'
              cy='9'
              r='7'
              fill='none'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeDasharray={RING}
              initial={false}
              animate={{
                strokeDashoffset:
                  RING * (1 - (last ? Math.max(share, 0.04) : 0)),
              }}
              transition={SPRING}
              className={nearlyFull ? 'stroke-destructive' : 'stroke-primary'}
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={10}
        collisionPadding={8}
        className='max-h-[var(--radix-popover-content-available-height)] w-[min(360px,calc(100vw-2rem))] space-y-4 overflow-y-auto p-4'
      >
        <div>
          <div className='flex items-baseline justify-between gap-3'>
            <p className='text-sm font-medium text-foreground'>
              Context window
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {model.name} · {formatCompactTokens(windowTokens)}
            </p>
          </div>
          <div className='mt-3 flex items-baseline gap-1.5'>
            <span className='text-2xl font-semibold text-foreground tabular-nums'>
              {formatCompactTokens(used)}
            </span>
            <span className='text-xs text-muted-foreground'>
              of {formatCompactTokens(windowTokens)} used by the last reply
            </span>
            <span
              className={cn(
                'ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                nearlyFull
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {percent(share)}
            </span>
          </div>
        </div>

        <div>
          <div className='flex h-2 overflow-hidden rounded-full bg-muted'>
            {segments.map((segment) => (
              <motion.div
                key={segment.key}
                className={segment.className}
                initial={false}
                animate={{
                  width: `${(Math.min(segment.tokens, windowTokens) / windowTokens) * 100}%`,
                }}
                transition={SPRING}
              />
            ))}
          </div>
          <div className='mt-2 flex gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <span className={cn('h-2 w-2 rounded-full', fill)} />
              Prompt {formatCompactTokens(prompt)}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className={cn('h-2 w-2 rounded-full opacity-50', fill)} />
              Reply {formatCompactTokens(reply)}
            </span>
            <span className='ml-auto'>
              {formatCompactTokens(Math.max(windowTokens - used, 0))} free
            </span>
          </div>
          <AnimatePresence initial={false}>
            {(next.counting || next.added > 0 || next.removed > 0) && (
              <motion.p
                key='next'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={cn(
                  'flex items-center gap-1.5 overflow-hidden pt-2 text-xs',
                  mayOverflow ? 'text-destructive' : 'text-foreground'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full opacity-20',
                    fill
                  )}
                />
                {nextMessageText(next, mayOverflow)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className='text-xs leading-relaxed text-muted-foreground'>
          {!last
            ? 'Shows how much of the window each reply uses. History, files, web results and tool output all count.'
            : nearlyFull
              ? 'The last reply nearly filled the window. Big files, web results or a long chat can push the next one over: start a new chat or pick a model with a larger window.'
              : 'The prompt counts history, files, web results and tool output. Web results and tool output only count for the turn that used them.'}
        </p>

        {last && (
          <div className='grid gap-2'>
            <ContextTokenCard title='Last reply' totals={tokenTotals(last)} />
            <ContextTokenCard title='This chat' totals={chatTotals} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default ContextMeter
