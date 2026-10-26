import { ArrowDownUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SOURCE_SORT_LABELS, SourceSort } from '@/utils/constants/project'

interface Props {
  value: SourceSort
  onChange: (sort: SourceSort) => void
}

const SourceSortSelect = ({ value, onChange }: Props) => (
  <Select value={value} onValueChange={(next) => onChange(next as SourceSort)}>
    <SelectTrigger aria-label='Sort sources' className='w-40 shrink-0 gap-2'>
      <ArrowDownUp className='h-4 w-4 shrink-0 text-muted-foreground' />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Object.values(SourceSort).map((sort) => (
        <SelectItem key={sort} value={sort}>
          {SOURCE_SORT_LABELS[sort]}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default SourceSortSelect
