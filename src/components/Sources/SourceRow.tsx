import {
  EllipsisVerticalIcon,
  Eye,
  FolderMinus,
  RefreshCw,
  ScanText,
  Share2,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import TagsDisplay from '@/components/FileManager/TagsDisplay'
import { MyFile, MyFolder } from '@/redux/types/files'
import { Tag } from '@/redux/types/tags'
import { FileStatus } from '@/utils/constants/file'
import { getFileIcon } from '@/utils/constants/files'
import { formatRelativeDate } from '@/utils/dateUtils'
import { formatFileSize } from '@/utils/files'
import { cn } from '@/lib/utils'
import SourceStatusBadge from './SourceStatusBadge'

export type SourceRowAction =
  | 'view'
  | 'tag'
  | 'share'
  | 'reprocess'
  | 'reviewOcr'
  | 'removeFromFolder'
  | 'delete'

interface SourceRowProps {
  file: MyFile
  folders: MyFolder[]
  allTags: Tag[]
  selected: boolean
  canShare: boolean
  canRemoveFromFolder: boolean
  onSelectedChange: (fileId: number, selected: boolean) => void
  onAction: (action: SourceRowAction, file: MyFile) => void
}

const SourceRow = ({
  file,
  folders,
  allTags,
  selected,
  canShare,
  canRemoveFromFolder,
  onSelectedChange,
  onAction,
}: SourceRowProps) => {
  const name = file.name || 'Unnamed'
  const ocrActionable =
    file.ocr?.status === 'awaiting_approval' || file.ocr?.status === 'partial'

  return (
    <li
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50',
        selected && 'bg-primary/5'
      )}
    >
      <input
        type='checkbox'
        aria-label={`Select ${name}`}
        className='h-4 w-4 shrink-0 rounded-sm border-border text-primary focus:ring-primary'
        checked={selected}
        onChange={(e) => onSelectedChange(file.id, e.target.checked)}
      />
      <button
        type='button'
        className='flex min-w-0 items-center gap-2.5 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        onClick={() => onAction('view', file)}
      >
        <span className='shrink-0'>{getFileIcon(file.fileType)}</span>
        <span className='truncate text-sm font-medium' title={name}>
          {name}
        </span>
      </button>
      <div className='flex min-w-0 flex-wrap items-center gap-1.5 [&>*]:whitespace-nowrap'>
        {folders.map((folder) => (
          <Badge key={folder.id} variant='outline' className='font-normal'>
            {folder.name}
          </Badge>
        ))}
        <TagsDisplay
          tags={file.tags}
          allTags={allTags}
          fileId={file.id}
          maxVisible={2}
        />
        <SourceStatusBadge file={file} />
      </div>
      <span className='ml-auto hidden shrink-0 text-xs whitespace-nowrap text-muted-foreground sm:block'>
        {formatFileSize(file.size)} · {formatRelativeDate(file.createdAt)}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${name}`}
          className='shrink-0 rounded-md p-1.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {ocrActionable && (
            <DropdownMenuItem onClick={() => onAction('reviewOcr', file)}>
              <ScanText className='mr-2 h-4 w-4' />
              {file.ocr?.status === 'partial'
                ? 'Continue transcription'
                : 'Review transcription'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onAction('view', file)}>
            <Eye className='mr-2 h-4 w-4' />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('tag', file)}>
            <TagIcon className='mr-2 h-4 w-4' />
            {file.tags.length === 0 ? 'Add tags' : 'Edit tags'}
          </DropdownMenuItem>
          {canShare && (
            <DropdownMenuItem onClick={() => onAction('share', file)}>
              <Share2 className='mr-2 h-4 w-4' />
              Share
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={file.status === FileStatus.PROCESSING || file.isMedia}
            onClick={() => onAction('reprocess', file)}
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Reprocess document
          </DropdownMenuItem>
          {canRemoveFromFolder && (
            <DropdownMenuItem
              onClick={() => onAction('removeFromFolder', file)}
            >
              <FolderMinus className='mr-2 h-4 w-4' />
              Remove from folder
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => onAction('delete', file)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

export default SourceRow
