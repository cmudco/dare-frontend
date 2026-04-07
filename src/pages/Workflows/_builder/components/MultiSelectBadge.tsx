import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { LucideIcon } from 'lucide-react'

interface MultiSelectBadgeProps {
  label: string
  icon: LucideIcon
  selectedIds: number[]
  items: Array<{ id: number; name?: string; label?: string }>
  nameMap?: Record<number, string>
  placeholder?: string
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

export default function MultiSelectBadge({
  label,
  icon: Icon,
  selectedIds,
  items,
  nameMap,
  placeholder = '+ Add',
  onAdd,
  onRemove,
}: MultiSelectBadgeProps) {
  const getDisplayName = (id: number): string => {
    if (nameMap?.[id]) return nameMap[id]
    const item = items.find((i) => i.id === id)
    return item?.name || item?.label || `#${id}`
  }

  const availableItems = items.filter((item) => !selectedIds.includes(item.id))

  return (
    <div className='space-y-2'>
      <Label className='flex items-center gap-2 text-xs font-medium'>
        <Icon className='h-3 w-3' />
        {label}
      </Label>
      <div className='flex flex-wrap gap-1'>
        {selectedIds.map((id) => (
          <Badge key={id} variant='secondary' className='text-xs'>
            {getDisplayName(id)}
            <Button
              size='sm'
              variant='ghost'
              className='ml-1 h-4 w-4 p-0'
              onClick={() => onRemove(id)}
            >
              <X className='h-3 w-3' />
            </Button>
          </Badge>
        ))}
        <Select
          value=''
          onValueChange={(value) => {
            if (value) onAdd(Number(value))
          }}
        >
          <SelectTrigger className='w-full bg-background text-sm'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {availableItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name || item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
