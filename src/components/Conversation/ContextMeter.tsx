import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import type { Message } from '@/redux/types/conversation'
import { SenderType } from '@/utils/constants/conversation'
import { sumUsage, usageRounds } from '@/utils/usageDetails'
import { formatUsdPrecise } from '@/utils/wallets'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const RING = 2 * Math.PI * 7
// Past this share of the window, the next reply risks running out of room.
const NEARLY_FULL = 0.8
const SPRING = { type: 'spring', stiffness: 140, damping: 22 } as const

interface TokenTotals {
  uncached: number
  cacheRead: number
  cacheWrite: number
  output: number
  cost: number
}

const EMPTY: TokenTotals = {
  uncached: 0,
  cacheRead: 0,
  cacheWrite: 0,
  output: 0,
  cost: 0,
}

const tokensOf = (message: Message): TokenTotals => {
  const cacheRead = sumUsage(message, 'cachedInputTokens')
  const cacheWrite = sumUsage(message, 'cacheWriteInputTokens')
  return {
    uncached: (message.inputTokens ?? 0) - cacheRead - cacheWrite,
    cacheRead,
    cacheWrite,
    output: message.outputTokens ?? 0,
    cost: Number(message.cost ?? 0),
  }
}

const addTotals = (a: TokenTotals, b: TokenTotals): TokenTotals => ({
  uncached: a.uncached + b.uncached,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
  output: a.output + b.output,
  cost: a.cost + b.cost,
})

const percent = (share: number) =>
  `${share > 0 && share < 0.01 ? '<1' : Math.round(share * 100)}%`

const TokenCard = ({
  title,
  totals,
}: {
  title: string
  totals: TokenTotals
}) => (
  <div className='rounded-lg bg-muted/50 p-3'>
    <div className='mb-2 flex items-baseline justify-between'>
      <p className='text-xs font-medium text-foreground'>{title}</p>
      <p className='text-xs text-muted-foreground tabular-nums'>
        {formatUsdPrecise(String(totals.cost))}
      </p>
    </div>
    <dl className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs'>
      {(
        [
          ['Input', totals.uncached],
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
 * How much of the selected model's context window the last reply used: its
 * final prompt (history, files, web results, tool output) plus the reply.
 * Web results and tool output belong to that turn only, so the next prompt
 * can be smaller.
 */
const ContextMeter = () => {
  const messages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )
  const model = useSelector((state: RootState) =>
    state.conversation.pickerEntries.find(
      (entry) => entry.id === state.conversation.selectedModel
    )
  )
  const replies = useMemo(
    () =>
      (messages ?? []).filter(
        (message) =>
          message.senderType === SenderType.AI_ASSISTANT && !message.streaming
      ),
    [messages]
  )
  if (!model?.maxInputTokens) return null
  const windowTokens = model.maxInputTokens

  const last = replies[replies.length - 1]
  const lastRound = last ? usageRounds(last).slice(-1)[0] : undefined
  const prompt = lastRound?.inputTokens ?? 0
  const reply = lastRound?.outputTokens ?? 0
  const used = prompt + reply
  const share = Math.min(used / windowTokens, 1)
  const nearlyFull = share >= NEARLY_FULL
  const fill = nearlyFull ? 'bg-destructive' : 'bg-primary'
  const totals = replies.map(tokensOf).reduce(addTotals, EMPTY)
  const label = last
    ? `Last reply used ${percent(share)} of the context window`
    : 'Context window'

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
        className='w-[min(360px,calc(100vw-2rem))] space-y-4 p-4'
      >
        <div>
          <div className='flex items-baseline justify-between gap-3'>
            <p className='text-sm font-medium text-foreground'>
              Context window
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {model.name} · {compact.format(windowTokens)}
            </p>
          </div>
          <div className='mt-3 flex items-baseline gap-1.5'>
            <span className='text-2xl font-semibold text-foreground tabular-nums'>
              {compact.format(used)}
            </span>
            <span className='text-xs text-muted-foreground'>
              of {compact.format(windowTokens)} used by the last reply
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                nearlyFull
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {percent(share)}
            </span>
          </div>
        </div>

        <div>
          <div className='flex h-2 overflow-hidden rounded-full bg-muted'>
            <motion.div
              className={fill}
              initial={false}
              animate={{
                width: `${(Math.min(prompt, windowTokens) / windowTokens) * 100}%`,
              }}
              transition={SPRING}
            />
            <motion.div
              className={`${fill} opacity-50`}
              initial={false}
              animate={{
                width: `${(Math.min(reply, windowTokens) / windowTokens) * 100}%`,
              }}
              transition={SPRING}
            />
          </div>
          <div className='mt-2 flex gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <span className={`h-2 w-2 rounded-full ${fill}`} />
              Prompt {compact.format(prompt)}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className={`h-2 w-2 rounded-full ${fill} opacity-50`} />
              Reply {compact.format(reply)}
            </span>
            <span className='ml-auto'>
              {compact.format(Math.max(windowTokens - used, 0))} free
            </span>
          </div>
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
            <TokenCard title='Last reply' totals={tokensOf(last)} />
            <TokenCard title='This chat' totals={totals} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default ContextMeter
