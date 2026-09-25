import { ChevronRight } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { SourceLocation } from '@/redux/types/files'
import { useSourceFiles } from '@/hooks/useSourceFiles'
import FolderActionsMenu from './FolderActionsMenu'
import SourceList from './SourceList'

type ListLocation = Extract<
  SourceLocation,
  { kind: 'all' | 'unfiled' | 'attention' | 'folder' }
>

const TITLES: Record<Exclude<ListLocation['kind'], 'folder'>, string> = {
  all: 'All sources',
  unfiled: 'Unfiled',
  attention: 'Needs attention',
}

const EMPTY_MESSAGES: Record<ListLocation['kind'], string> = {
  all: 'No sources match these filters.',
  unfiled: 'Every file is in a folder.',
  attention: 'Nothing needs your attention.',
  folder: 'This folder is empty. Select files elsewhere and add them here.',
}

interface SourcesListViewProps {
  location: ListLocation
  goTo: (location: SourceLocation) => void
}

const SourcesListView = ({ location, goTo }: SourcesListViewProps) => {
  const files = useSourceFiles(location)
  const folder = useAppSelector((state) =>
    location.kind === 'folder'
      ? state.files.folders.find((f) => f.id === location.folderId)
      : undefined
  )
  const title =
    location.kind === 'folder'
      ? (folder?.name ?? 'Folder')
      : TITLES[location.kind]

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-1 text-sm'>
        <button
          type='button'
          onClick={() => goTo({ kind: 'home' })}
          className='rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          Sources
        </button>
        <ChevronRight className='h-4 w-4 text-muted-foreground' />
        <h2 className='font-medium'>{title}</h2>
        {folder && (
          <FolderActionsMenu
            folder={folder}
            onDeleted={() => goTo({ kind: 'home' })}
          />
        )}
      </div>
      <SourceList
        files={files}
        folderId={folder?.id}
        emptyState={
          <p className='rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground'>
            {EMPTY_MESSAGES[location.kind]}
          </p>
        }
      />
    </div>
  )
}

export default SourcesListView
