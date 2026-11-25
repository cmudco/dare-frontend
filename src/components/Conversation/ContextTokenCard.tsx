import type { TokenTotals } from '@/utils/usageDetails'
import { formatUsdPrecise } from '@/utils/wallets'
import { formatCompactTokens } from '../Projects/projectSources'

interface ContextTokenCardProps {
  title: string
  totals: TokenTotals
}

const ContextTokenCard = ({ title, totals }: ContextTokenCardProps) => {
  const rows = [
    ['Input', totals.uncached],
    ['Output', totals.output],
    ['Cache read', totals.cacheRead],
    ['Cache write', totals.cacheWrite],
  ] as const

  return (
    <div className='rounded-lg bg-muted/50 p-3'>
      <div className='mb-2 flex items-baseline justify-between'>
        <p className='text-xs font-medium text-foreground'>{title}</p>
        <p className='text-xs text-muted-foreground tabular-nums'>
          {formatUsdPrecise(String(totals.cost))}
        </p>
      </div>
      <dl className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs'>
        {rows.map(([label, value]) => (
          <div key={label} className='flex justify-between gap-2'>
            <dt className='text-muted-foreground'>{label}</dt>
            <dd className='font-medium text-foreground tabular-nums'>
              {formatCompactTokens(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default ContextTokenCard
