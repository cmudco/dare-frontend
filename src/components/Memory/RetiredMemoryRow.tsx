/**
 * RetiredMemoryRow
 *
 * One memory that stopped being true, struck through, with whatever replaced
 * it beside it. A retired fact shown without its successor reads as data
 * loss rather than as a correction.
 */
import { ArrowRight } from 'lucide-react'
import type { MemoryItem } from '@/redux/types/memory'
import { formatShortDate } from '@/utils/dateUtils'

const RetiredMemoryRow: React.FC<{ item: MemoryItem }> = ({ item }) => (
  <div className='rounded-xl border border-border bg-card p-4 shadow-xs'>
    <div className='flex flex-wrap items-center gap-1.5'>
      {item.categories
        ?.filter((category) => category !== 'no-longer-current')
        .map((category) => (
          <span
            key={category}
            className='rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground'
          >
            #{category}
          </span>
        ))}
      {item.validUntil && (
        <span className='rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground'>
          until {formatShortDate(item.validUntil)}
        </span>
      )}
    </div>

    <p className='mt-2 text-sm text-muted-foreground line-through decoration-muted-foreground/40'>
      {item.content}
    </p>

    {item.replacedBy && (
      <div className='mt-2 flex items-start gap-2 text-sm'>
        <ArrowRight className='mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
        <p className='text-foreground'>{item.replacedBy}</p>
      </div>
    )}
  </div>
)

export default RetiredMemoryRow
