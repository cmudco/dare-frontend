import * as SelectPrimitive from '@radix-ui/react-select'

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BackgroundModelCandidate } from '@/redux/types/backgroundModels'

// Radix Select reserves the empty string, so "no choice" needs a stand-in.
const DEFAULT_VALUE = '__default__'

const formatRate = (value: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(Number(value))

const formatRates = (model: BackgroundModelCandidate) =>
  `${formatRate(model.inputTokenRatePerMillion)} / ${formatRate(model.outputTokenRatePerMillion)} per 1M tokens`

interface CatalogModelSelectProps {
  id: string
  models: BackgroundModelCandidate[]
  value: string
  defaultLabel: string
  onChange: (identifier: string) => void
  disabled?: boolean
}

/** A catalog model, or "" for the inherited default. */
const CatalogModelSelect = ({
  id,
  models,
  value,
  defaultLabel,
  onChange,
  disabled,
}: CatalogModelSelectProps) => (
  <Select
    value={value || DEFAULT_VALUE}
    onValueChange={(next) => onChange(next === DEFAULT_VALUE ? '' : next)}
    disabled={disabled}
  >
    <SelectTrigger id={id} className='w-full'>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectPrimitive.Item value={DEFAULT_VALUE} className={ITEM_CLASS}>
        <SelectPrimitive.ItemText>{defaultLabel}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
      {models.map((model) => (
        // Only the name is ItemText, so the closed trigger shows it alone.
        <SelectPrimitive.Item
          key={model.identifier}
          value={model.identifier}
          className={ITEM_CLASS}
        >
          <SelectPrimitive.ItemText>{model.name}</SelectPrimitive.ItemText>
          <span className='ml-auto pl-4 text-xs whitespace-nowrap text-muted-foreground'>
            {formatRates(model)}
          </span>
        </SelectPrimitive.Item>
      ))}
    </SelectContent>
  </Select>
)

const ITEM_CLASS =
  'relative flex w-full cursor-default items-center gap-2 rounded-xs py-1.5 pr-3 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50'

export default CatalogModelSelect
