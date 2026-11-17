import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PICTURE_SIZES } from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'

interface GraphPagerProps {
  offset: number
  size: number
  /** Names on this page of the picture. */
  pageCount: number
  total: number
  /** Where each tier starts in the ranked order. */
  tiers: { tier: number; title: string; start: number; count: number }[]
  /** A name picked from outside this page, and how many names came with it. */
  added: { label: string; count: number } | null
  onPage: (offset: number) => void
  onSize: (size: number) => void
  onRemoveAdded: () => void
  onBrowse: () => void
}

const Divider = () => <span className='mx-1 h-4 w-px bg-border' />

/** Says which names the picture draws, and steps through the rest. */
const GraphPager = ({
  offset,
  size,
  pageCount,
  total,
  tiers,
  added,
  onPage,
  onSize,
  onRemoveAdded,
  onBrowse,
}: GraphPagerProps) => (
  <div className='absolute bottom-3 left-3 z-10 flex flex-col items-start gap-1.5 text-xs text-muted-foreground'>
    {added && (
      <div className='flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-sm'>
        <span>
          Added{' '}
          <span className='font-medium text-foreground'>{added.label}</span>
          {added.count > 1 &&
            ` and ${added.count - 1} ${added.count === 2 ? 'name' : 'names'} near it`}
        </span>
        <button
          type='button'
          className='font-medium text-foreground underline underline-offset-2'
          onClick={onRemoveAdded}
        >
          Remove
        </button>
      </div>
    )}
    <div className='flex items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-1 shadow-sm'>
      <span className='px-1'>Tier</span>
      {tiers
        .filter((tier) => tier.count > 0)
        .map((tier) => {
          const current =
            offset >= tier.start && offset < tier.start + tier.count
          return (
            <Button
              key={tier.tier}
              variant={current ? 'secondary' : 'ghost'}
              size='sm'
              aria-pressed={current}
              title={`Tier ${tier.tier} · ${tier.title} · ${tier.count.toLocaleString()} names`}
              className='h-6 px-1.5 text-xs tabular-nums'
              onClick={() => onPage(tier.start)}
            >
              {tier.tier}
            </Button>
          )
        })}
      <Divider />
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6'
        aria-label='Previous names'
        disabled={offset === 0}
        onClick={() => onPage(Math.max(offset - size, 0))}
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>
      <span className='px-1 tabular-nums'>
        Names {(offset + 1).toLocaleString()}–
        {(offset + pageCount).toLocaleString()} of {total.toLocaleString()}
      </span>
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6'
        aria-label='Next names'
        disabled={offset + size >= total}
        onClick={() => onPage(offset + size)}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
      <Divider />
      <span className='px-1'>Show</span>
      {PICTURE_SIZES.map((option) => (
        <Button
          key={option}
          variant={option === size ? 'secondary' : 'ghost'}
          size='sm'
          aria-pressed={option === size}
          className='h-6 px-1.5 text-xs tabular-nums'
          onClick={() => onSize(option)}
        >
          {option}
        </Button>
      ))}
      <Divider />
      <button
        type='button'
        className='px-1 font-medium text-foreground underline underline-offset-2'
        onClick={onBrowse}
      >
        Browse all
      </button>
    </div>
  </div>
)

export default GraphPager
