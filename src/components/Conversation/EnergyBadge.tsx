import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RelatableStats } from '@/redux/types/billing'
import {
  formatEnergy,
  formatCarbon,
  formatWater,
  formatPhoneBattery,
  formatSearches,
} from '@/utils/energyFormatUtils'
import { Leaf } from 'lucide-react'

interface EnergyBadgeProps {
  energyWh: string | null | undefined
  carbonG?: string | null
  waterMl?: string | null
  energyStats?: RelatableStats | null
}

const EnergyBadge: React.FC<EnergyBadgeProps> = ({
  energyWh,
  carbonG,
  waterMl,
  energyStats,
}) => {
  const energy = energyWh ? parseFloat(energyWh) : 0
  if (!energy) return null

  const carbon = carbonG ? parseFloat(carbonG) : 0
  const water = waterMl ? parseFloat(waterMl) : 0

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex cursor-default items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted'>
            <Leaf className='h-3 w-3 text-emerald-500' />
            {formatEnergy(energy)}
          </span>
        </TooltipTrigger>
        <TooltipContent side='bottom' className='max-w-56'>
          <div className='space-y-1 text-xs'>
            <p>{formatCarbon(carbon)}</p>
            <p>{formatWater(water)}</p>
            {energyStats && (
              <div className='border-t pt-1 text-muted-foreground'>
                <p>
                  {formatPhoneBattery(energyStats.phoneBatteryPct)} of a phone
                </p>
                <p>
                  {formatSearches(energyStats.googleSearchesEquiv)} on Google
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default EnergyBadge
