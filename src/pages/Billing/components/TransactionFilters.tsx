import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionHistoryFilters } from '@/redux/types/billing'
import { PlatformFilter, PLATFORM_LABELS } from '@/utils/constants/billing'

// Radix Select reserves the empty string, so "every model" needs its own value.
const ALL_MODELS = '__all__'

type FilterKey = Exclude<keyof TransactionHistoryFilters, 'tab'>

interface TransactionFiltersProps {
  filters: TransactionHistoryFilters
  models: string[]
  onFilterChange: (key: FilterKey, value: string | null) => void
}

export const TransactionFilters = ({
  filters,
  models,
  onFilterChange,
}: TransactionFiltersProps) => (
  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
    <div className='space-y-1'>
      <Label htmlFor='transactions-platform'>Platform</Label>
      <Select
        value={filters.platform}
        onValueChange={(value) => onFilterChange('platform', value)}
      >
        <SelectTrigger id='transactions-platform'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PlatformFilter).map((platform) => (
            <SelectItem key={platform} value={platform}>
              {PLATFORM_LABELS[platform]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className='space-y-1'>
      <Label htmlFor='transactions-model'>Model</Label>
      <Select
        value={filters.model ?? ALL_MODELS}
        onValueChange={(value) =>
          onFilterChange('model', value === ALL_MODELS ? null : value)
        }
      >
        <SelectTrigger id='transactions-model'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_MODELS}>All models</SelectItem>
          {models.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className='space-y-1'>
      <Label htmlFor='transactions-from'>From</Label>
      <DatePicker
        id='transactions-from'
        value={filters.from ?? ''}
        max={filters.to ?? undefined}
        placeholder='First transaction'
        onChange={(value) => onFilterChange('from', value || null)}
      />
    </div>
    <div className='space-y-1'>
      <Label htmlFor='transactions-to'>Through</Label>
      <DatePicker
        id='transactions-to'
        value={filters.to ?? ''}
        min={filters.from ?? undefined}
        placeholder='Latest transaction'
        onChange={(value) => onFilterChange('to', value || null)}
      />
    </div>
  </div>
)
