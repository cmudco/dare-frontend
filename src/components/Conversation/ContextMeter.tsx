import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import type { Message } from '@/redux/types/conversation'
import { SenderType } from '@/utils/constants/conversation'
import { sumUsage, usageRounds } from '@/utils/usageDetails'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const RING = 2 * Math.PI * 7
// Past this share of the window, replies risk losing early context.
const NEARLY_FULL = 0.8

interface TokenTotals {
  uncached: number
  cacheRead: number
  cacheWrite: number
  output: number
}

const tokensOf = (message: Message): TokenTotals => {
  const cacheRead = sumUsage(message, 'cachedInputTokens')
  const cacheWrite = sumUsage(message, 'cacheWriteInputTokens')
  return {
    uncached: (message.inputTokens ?? 0) - cacheRead - cacheWrite,
    cacheRead,
    cacheWrite,
    output: message.outputTokens ?? 0,
  }
}

const addTotals = (a: TokenTotals, b: TokenTotals): TokenTotals => ({
  uncached: a.uncached + b.uncached,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
  output: a.output + b.output,
})

const percent = (share: number) =>
  `${share > 0 && share < 0.01 ? '<1' : Math.round(share * 100)}%`

const TokenGrid = ({
  title,
  totals,
}: {
  title: string
  totals: TokenTotals
}) => (
  <div>
    <p className='mb-1.5 text-xs font-medium text-foreground'>{title}</p>
    <dl className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs'>
      {(
        [
          ['Input (uncached)', totals.uncached],
          ['Output', totals.output],
          ['Cache read', totals.cacheRead],
          ['Cache write', totals.cacheWrite],
        ] as const
      ).map(([label, value]) => (
        <div key={label} className='flex justify-between gap-2'>
          <dt className='text-muted-foreground'>{label}</dt>
          <dd className='font-medium text-foreground tabular-nums'>
            {compact.format(value)}
          </dd>
        </div>
      ))}
    </dl>
  </div>
)

/**
 * How full the selected model's context window is. The last reply's final
 * prompt, plus that reply, is what the next message is sent on top of.
 */
const ContextMeter = () => {
  const messages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )
  const replies = useMemo(
    () =>
      (messages ?? []).filter(
        (message) =>
          message.senderType === SenderType.AI_ASSISTANT && !message.streaming
      ),
    [messages]
  )
  const windowTokens = useSelector(
    (state: RootState) =>
      state.conversation.pickerEntries.find(
        (entry) => entry.id === state.conversation.selectedModel
      )?.maxInputTokens
  )
  if (!windowTokens) return null

  const last = replies[replies.length - 1]
  const lastRound = last ? usageRounds(last).slice(-1)[0] : undefined
  const used = lastRound ? lastRound.inputTokens + lastRound.outputTokens : 0
  const share = Math.min(used / windowTokens, 1)
  const nearlyFull = share >= NEARLY_FULL
  const totals = replies
    .map(tokensOf)
    .reduce(addTotals, { uncached: 0, cacheRead: 0, cacheWrite: 0, output: 0 })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={`Context window ${percent(share)} full`}
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
              animate={{ strokeDashoffset: RING * (1 - Math.max(share, 0.04)) }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className={nearlyFull ? 'stroke-destructive' : 'stroke-primary'}
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={10}
        className='w-[min(340px,calc(100vw-2rem))] space-y-4 p-4'
      >
        <div className='flex items-baseline justify-between'>
          <p className='text-sm font-medium text-foreground'>Context window</p>
          <p className='text-xs text-muted-foreground tabular-nums'>
            {compact.format(used)} / {compact.format(windowTokens)} (
            {percent(share)})
          </p>
        </div>
        <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
          <motion.div
            className={`h-full rounded-full ${nearlyFull ? 'bg-destructive' : 'bg-primary'}`}
            initial={false}
            animate={{ width: `${share * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <p className='text-xs text-muted-foreground'>
          {!last
            ? 'Fills up as the chat goes on: history, files and tool results all count.'
            : nearlyFull
              ? 'Nearly full. Start a new chat or pick a model with a larger window to keep early messages in view.'
              : `${compact.format(windowTokens - used)} tokens free for the next message.`}
        </p>
        {last && (
          <>
            <TokenGrid title='Last reply' totals={tokensOf(last)} />
            <TokenGrid title='This chat' totals={totals} />
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default ContextMeter
