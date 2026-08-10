/**
 * MemoryCard
 *
 * One memory in the feed: layer badge, content, clickable category tags,
 * provenance dates (relative and absolute), and — on semantic search
 * results — a relevance meter. Legacy event-type items render as dated
 * facts with a time anchor.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Check, Copy, Pencil, Trash2, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatRelativeDate, formatShortDate } from '@/utils/dateUtils'
import { toast } from '@/utils/toast'
import { MemoryType, type MemoryItem } from '@/redux/types/memory'
import { badgeVariantFor, layerFor } from './layers'

interface Props {
  item: MemoryItem
  onDelete: (id: string) => void
  /** Show the relevance meter (semantic search results) */
  showScore?: boolean
  /** Filter the feed by a category tag */
  onCategoryClick?: (category: string) => void
}

/**
 * A rule has structure: "When <trigger>, <action>". Pull the trigger out so
 * the card can highlight it instead of rendering the rule as flat prose.
 */
const parseRule = (
  content: string
): { trigger: string; action: string } | null => {
  const match = content.match(/^when\s+(.+?)\s*[,:]\s*(.+)$/i)
  if (!match) return null
  return { trigger: match[1], action: match[2] }
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const MemoryCard = ({
  item,
  onDelete,
  showScore = false,
  onCategoryClick,
}: Props) => {
  const [copied, setCopied] = useState(false)
  const layer = layerFor(item.memoryType)
  const isDated = item.memoryType === MemoryType.EVENT
  const anchorDate = item.createdAt
  const rule =
    item.memoryType === MemoryType.BEHAVIOR ? parseRule(item.content) : null
  const scorePercent =
    typeof item.score === 'number'
      ? Math.round(Math.min(Math.max(item.score, 0), 1) * 100)
      : null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className='group rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <Badge variant={badgeVariantFor(item.memoryType)}>
            {layer?.label ?? item.memoryType}
          </Badge>
          {isDated && anchorDate && (
            <span className='inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground'>
              <CalendarClock className='h-3 w-3' />
              {formatShortDate(anchorDate)}
            </span>
          )}
          {item.categories?.map((category) => (
            <button
              key={category}
              type='button'
              onClick={() => onCategoryClick?.(category)}
              title={`Filter by ${category}`}
              className='rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            >
              #{category}
            </button>
          ))}
        </div>

        <div className='flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label='Copy memory'
                  onClick={handleCopy}
                  className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
                >
                  {copied ? (
                    <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <button
                    aria-label='Edit memory'
                    disabled
                    className='cursor-not-allowed rounded-md p-1.5 text-muted-foreground/40'
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Editing arrives with the layered memory backend
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label='Forget memory'
                  onClick={() => onDelete(item.id)}
                  className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </TooltipTrigger>
              <TooltipContent>Forget</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {rule ? (
        <p className='mt-2.5 text-sm leading-relaxed'>
          <span className='mr-2 inline-flex translate-y-[-1px] items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 align-middle text-xs font-medium text-amber-700 dark:text-amber-400'>
            <Zap className='h-3 w-3' />
            When {rule.trigger}
          </span>
          {capitalize(rule.action)}
        </p>
      ) : (
        <p className='mt-2.5 text-sm leading-relaxed'>{item.content}</p>
      )}

      <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-2.5 text-xs text-muted-foreground'>
        {showScore && scorePercent !== null && (
          <span className='inline-flex items-center gap-2'>
            <span className='h-1.5 w-16 overflow-hidden rounded-full bg-muted'>
              <span
                className='block h-full rounded-full bg-dare-gradient'
                style={{ width: `${scorePercent}%` }}
              />
            </span>
            <span className='font-medium text-foreground tabular-nums'>
              {scorePercent}% match
            </span>
          </span>
        )}
        {item.createdAt && (
          <span>
            Remembered {formatShortDate(item.createdAt)}
            <span className='text-muted-foreground/70'>
              {' '}
              · {formatRelativeDate(item.createdAt)}
            </span>
          </span>
        )}
        {item.updatedAt && item.updatedAt !== item.createdAt && (
          <span>
            Updated {formatShortDate(item.updatedAt)}
            <span className='text-muted-foreground/70'>
              {' '}
              · {formatRelativeDate(item.updatedAt)}
            </span>
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default MemoryCard
