import { Folder } from 'lucide-react'
import { MyFolder } from '@/redux/types/files'
import { formatRelativeDate } from '@/utils/dateUtils'

interface FolderCardProps {
  folder: MyFolder
  onOpen: () => void
}

const FolderCard = ({ folder, onOpen }: FolderCardProps) => (
  <button
    type='button'
    onClick={onOpen}
    className='flex flex-col gap-1 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
  >
    <span className='flex items-center gap-2 text-sm font-medium'>
      <Folder className='h-4 w-4 shrink-0 text-primary' />
      <span className='truncate'>{folder.name}</span>
    </span>
    <span className='text-xs text-muted-foreground'>
      {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'} · updated{' '}
      {formatRelativeDate(folder.updatedAt)}
    </span>
  </button>
)

export default FolderCard
