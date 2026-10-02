import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface ProposalGroupRowProps {
  icon: ReactNode
  name: string
  isNew: boolean
  files: { id: number; name: string }[]
}

/** One folder or tag in a proposal and the files it would receive. */
export function ProposalGroupRow({
  icon,
  name,
  isNew,
  files,
}: ProposalGroupRowProps) {
  return (
    <li className='space-y-1'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
        {icon}
        <span className='truncate'>{name}</span>
        {isNew && (
          <Badge variant='secondary' className='px-1.5 py-0 text-[10px]'>
            new
          </Badge>
        )}
        <span className='ml-auto shrink-0 text-muted-foreground'>
          {files.length} file{files.length === 1 ? '' : 's'}
        </span>
      </div>
      <p className='line-clamp-2 pl-5 text-[11px] text-muted-foreground'>
        {files.map((file) => file.name).join(', ')}
      </p>
    </li>
  )
}
