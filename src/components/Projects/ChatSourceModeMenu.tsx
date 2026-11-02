import { BookOpen, ChevronDown, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useChatProjectSources } from '@/hooks/useChatProjectSources'
import { useSourceSize } from '@/hooks/useSourceSize'
import { switchChatSourceMode } from '@/redux/asyncThunks/conversation'
import { useAppDispatch } from '@/redux/hooks'
import {
  PROJECT_SOURCE_MODE_LABELS,
  ProjectSourceMode,
} from '@/utils/constants/project'
import { toast } from '@/utils/toast'
import { formatTokenEstimate } from './projectSources'

const NO_FOLDERS: number[] = []

/** Switch a project chat between searching its files and reading them in full. */
const ChatSourceModeMenu = () => {
  const dispatch = useAppDispatch()
  const { fileIds, mode } = useChatProjectSources()
  const sizeState = useSourceSize(fileIds, NO_FOLDERS)

  if (mode === null) return null

  const fullNote =
    sizeState.status === 'ready'
      ? sizeState.size.fitsFullFiles
        ? `Sends ${fileIds.length === 1 ? 'the file' : `all ${fileIds.length} files`} whole each turn (${formatTokenEstimate(sizeState.size.estimatedTokens)}).`
        : `Too large: ${formatTokenEstimate(sizeState.size.estimatedTokens)}, limit ${formatTokenEstimate(sizeState.size.tokenLimit)}.`
      : sizeState.status === 'error'
        ? 'Could not measure these files.'
        : 'Measuring files…'
  const fullAllowed =
    sizeState.status === 'ready' && sizeState.size.fitsFullFiles

  const handleChange = (next: string) => {
    const target = next as ProjectSourceMode
    if (target === mode) return
    dispatch(switchChatSourceMode({ fileIds, mode: target }))
      .unwrap()
      .catch(() => toast.error('Could not change how this chat uses sources.'))
  }

  const Icon = mode === ProjectSourceMode.FULL ? BookOpen : Search

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='How this chat uses project sources'
        className='inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
      >
        <Icon className='h-3.5 w-3.5' />
        {mode === 'mixed' ? 'Mixed' : PROJECT_SOURCE_MODE_LABELS[mode]}
        <ChevronDown className='h-3 w-3' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-72'>
        <DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
          How this chat uses project files
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={mode === 'mixed' ? '' : mode}
          onValueChange={handleChange}
        >
          <DropdownMenuRadioItem value={ProjectSourceMode.SEARCH}>
            <span className='flex flex-col gap-0.5'>
              <span>Search relevant passages</span>
              <span className='text-xs text-muted-foreground'>
                Best for many or large files.
              </span>
            </span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value={ProjectSourceMode.FULL}
            disabled={!fullAllowed && mode !== ProjectSourceMode.FULL}
          >
            <span className='flex flex-col gap-0.5'>
              <span>Read full files</span>
              <span className='text-xs text-muted-foreground'>{fullNote}</span>
            </span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <p className='px-2 py-1.5 text-xs text-muted-foreground'>
          Applies from your next message. Shared libraries are always searched.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChatSourceModeMenu
