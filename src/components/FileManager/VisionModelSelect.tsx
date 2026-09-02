import * as SelectPrimitive from '@radix-ui/react-select'

import { VisionModelCandidate } from '@/redux/types/files'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VisionModelSelectProps {
  id: string
  models: VisionModelCandidate[]
  value: string
  onChange: (identifier: string) => void
  disabled?: boolean
}

const formatPerPage = (value: number) =>
  `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(value)}/page`

const VisionModelSelect = ({
  id,
  models,
  value,
  onChange,
  disabled,
}: VisionModelSelectProps) => {
  const selected = models.find((model) => model.identifier === value)
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className='w-full gap-3'>
        <SelectValue placeholder='Choose a vision model' />
        {selected && (
          <span className='ml-auto text-xs whitespace-nowrap text-muted-foreground'>
            {formatPerPage(selected.estimatedCostPerPage)}
          </span>
        )}
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          // Only the name lives in ItemText, so the closed trigger shows the
          // name alone while the open list also shows cost and recommendation.
          <SelectPrimitive.Item
            key={model.identifier}
            value={model.identifier}
            className='relative flex w-full cursor-default items-center gap-2 rounded-xs py-1.5 pr-3 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50'
          >
            <SelectPrimitive.ItemText>{model.name}</SelectPrimitive.ItemText>
            <span className='ml-auto text-xs whitespace-nowrap text-muted-foreground'>
              {formatPerPage(model.estimatedCostPerPage)}
            </span>
            {model.recommended && (
              <span className='text-xs font-medium whitespace-nowrap text-primary'>
                Recommended
              </span>
            )}
          </SelectPrimitive.Item>
        ))}
      </SelectContent>
    </Select>
  )
}

export default VisionModelSelect
