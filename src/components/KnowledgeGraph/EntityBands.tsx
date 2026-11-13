import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { EntityBand } from '@/redux/types/knowledgeGraph'

const BAND_TEXT: Record<EntityBand['band'], { title: string; note: string }> = {
  '6+': { title: '6 or more passages', note: 'The main cast' },
  '3-5': { title: '3 to 5 passages', note: 'Recurring names' },
  '2': { title: '2 passages', note: 'Named twice' },
  '1': { title: '1 passage', note: 'Named once, in passing' },
}
const ORDER: EntityBand['band'][] = ['6+', '3-5', '2', '1']

interface EntityBandsProps {
  total: number
  /** Absent when the backend predates the breakdown. */
  bands?: EntityBand[]
}

const EntityBands = ({ total, bands = [] }: EntityBandsProps) => {
  const byBand = new Map(bands.map((band) => [band.band, band]))
  const rows = ORDER.flatMap((key) => byBand.get(key) ?? [])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type='button' className='min-w-0 text-left'>
          <p className='text-lg leading-tight font-semibold tabular-nums'>
            {total.toLocaleString()}
          </p>
          <p className='truncate text-xs text-muted-foreground underline decoration-dotted underline-offset-2'>
            Entities
          </p>
        </button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-96 space-y-3'>
        <div>
          <p className='text-sm font-semibold'>How often each name appears</p>
          <p className='text-xs text-muted-foreground'>
            Most names are mentioned once. The ones that keep coming back are
            the ones the graph is about.
          </p>
        </div>
        <ul className='space-y-3'>
          {rows.map((row) => (
            <li key={row.band} className='space-y-1'>
              <div className='flex items-baseline justify-between gap-3'>
                <p className='text-sm'>
                  <span className='font-medium'>
                    {BAND_TEXT[row.band].title}
                  </span>
                  <span className='text-muted-foreground'>
                    {' · '}
                    {BAND_TEXT[row.band].note}
                  </span>
                </p>
                <p className='text-sm font-semibold tabular-nums'>
                  {row.entities.toLocaleString()}
                </p>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-primary'
                  style={{
                    width: `${(row.entities / Math.max(total, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                {row.connected.toLocaleString()} with a stated relationship
                {row.examples.length > 0 &&
                  ` · e.g. ${row.examples.join(', ')}`}
              </p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export default EntityBands
