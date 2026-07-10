import { cn } from '@/lib/utils'

// A quiet confidence indicator — a thin bar, never a loud metric.
const ConfidenceBar = ({
  value,
  className,
}: {
  value: number
  className?: string
}) => {
  const tone =
    value >= 85
      ? 'bg-green-500'
      : value >= 70
        ? 'bg-amber-500'
        : 'bg-muted-foreground/60'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='h-1.5 w-20 overflow-hidden rounded-full bg-muted'>
        <div
          className={cn('h-full rounded-full', tone)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className='text-xs tabular-nums text-muted-foreground'>
        {value}% confidence
      </span>
    </div>
  )
}

export default ConfidenceBar
