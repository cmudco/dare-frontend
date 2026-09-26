import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ProjectIconKey } from '@/utils/constants/project'
import ProjectIcon from './ProjectIcon'

interface Props {
  value: ProjectIconKey
  onChange: (icon: ProjectIconKey) => void
}

const ICON_KEYS = Object.values(ProjectIconKey)

/** Icon button that sits inside the name field, like a prefix. */
const ProjectIconPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label='Choose project icon'
          className='flex h-full items-center justify-center border-r border-border px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:outline-hidden'
        >
          <ProjectIcon icon={value} className='h-5 w-5' />
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto p-2'>
        <div
          role='listbox'
          aria-label='Project icons'
          className='grid grid-cols-6 gap-1'
        >
          {ICON_KEYS.map((key) => (
            <button
              key={key}
              type='button'
              role='option'
              aria-selected={key === value}
              aria-label={key}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                key === value && 'bg-primary/10 text-primary'
              )}
            >
              <ProjectIcon icon={key} className='h-[18px] w-[18px]' />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ProjectIconPicker
