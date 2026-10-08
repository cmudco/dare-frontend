import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'

export interface SelectableRow<Id extends string | number> {
  id: Id
  label: string
  meta?: string
}

interface Props<Id extends string | number> {
  /** Prefix for checkbox ids so several lists can share a dialog. */
  idPrefix: string
  rows: SelectableRow<Id>[]
  selected: Id[]
  onToggle: (id: Id) => void
  emptyLabel: string
  icon?: React.ReactNode
}

const SelectableList = <Id extends string | number>({
  idPrefix,
  rows,
  selected,
  onToggle,
  emptyLabel,
  icon,
}: Props<Id>) =>
  rows.length === 0 ? (
    <p className='py-10 text-center text-sm text-muted-foreground'>
      {emptyLabel}
    </p>
  ) : (
    <ul className='flex flex-col gap-0.5'>
      {rows.map((row) => {
        const checkboxId = `${idPrefix}-${row.id}`
        return (
          <li key={row.id}>
            <label
              htmlFor={checkboxId}
              className='flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent'
            >
              <Checkbox
                id={checkboxId}
                checked={selected.includes(row.id)}
                onCheckedChange={() => onToggle(row.id)}
              />
              {icon && <span className='text-muted-foreground'>{icon}</span>}
              <span className='flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3'>
                <span className='min-w-0 truncate text-sm sm:flex-1'>
                  {row.label}
                </span>
                {row.meta && (
                  <span className='min-w-0 truncate text-xs text-muted-foreground sm:max-w-[50%]'>
                    {row.meta}
                  </span>
                )}
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )

export default SelectableList
