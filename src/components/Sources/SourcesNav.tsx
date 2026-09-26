import { useMemo } from 'react'
import {
  CircleAlert,
  Files,
  Folder,
  FolderPlus,
  House,
  Inbox,
  Library,
  LucideIcon,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/redux/hooks'
import { selectSourceCounts } from '@/redux/fileSlice'
import { SourceLocation } from '@/redux/types/files'
import { isSameLocation } from '@/hooks/useSourceLocation'
import SourcesNavItem from './SourcesNavItem'

interface SourcesNavProps {
  location: SourceLocation
  goTo: (location: SourceLocation) => void
  onNewFolder: () => void
}

const SourcesNav = ({ location, goTo, onNewFolder }: SourcesNavProps) => {
  const counts = useAppSelector(selectSourceCounts)
  const folders = useAppSelector((state) => state.files.folders)
  const sharedCount = useAppSelector((state) => state.files.sharedFiles.length)
  const isSyftboxUser = useAppSelector(
    (state) => state.user.user?.isSyftboxFileStorage ?? false
  )
  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders]
  )

  const item = (
    target: SourceLocation,
    icon: LucideIcon,
    label: string,
    count?: number
  ) => (
    <SourcesNavItem
      icon={icon}
      label={label}
      count={count}
      active={isSameLocation(location, target)}
      onSelect={() => goTo(target)}
    />
  )

  return (
    <nav
      data-tour='files-nav'
      aria-label='Sources'
      className='flex shrink-0 flex-col gap-4 md:sticky md:top-0 md:w-60 md:self-start'
    >
      <div className='flex flex-col gap-0.5'>
        {item({ kind: 'home' }, House, 'Home')}
        {item({ kind: 'all' }, Files, 'All sources', counts.all)}
        {item({ kind: 'unfiled' }, Inbox, 'Unfiled', counts.unfiled)}
        {item(
          { kind: 'attention' },
          CircleAlert,
          'Needs attention',
          counts.attention || undefined
        )}
        {isSyftboxUser &&
          item({ kind: 'shared' }, Users, 'Shared with me', sharedCount)}
      </div>

      <section className='flex flex-col gap-0.5'>
        <div className='flex items-center justify-between px-2.5 pb-1'>
          <h2 className='text-xs font-medium text-muted-foreground'>Folders</h2>
          <Button
            variant='ghost'
            size='icon'
            aria-label='New folder'
            className='h-6 w-6'
            onClick={onNewFolder}
          >
            <FolderPlus className='h-3.5 w-3.5' />
          </Button>
        </div>
        {sortedFolders.length === 0 ? (
          <p className='px-2.5 text-xs text-muted-foreground'>No folders yet</p>
        ) : (
          sortedFolders.map((folder) => (
            <SourcesNavItem
              key={folder.id}
              icon={Folder}
              label={folder.name}
              count={folder.fileCount}
              active={
                location.kind === 'folder' && location.folderId === folder.id
              }
              onSelect={() => goTo({ kind: 'folder', folderId: folder.id })}
            />
          ))
        )}
      </section>

      <section className='flex flex-col gap-0.5'>
        <h2 className='px-2.5 pb-1 text-xs font-medium text-muted-foreground'>
          Libraries
        </h2>
        {item({ kind: 'libraries' }, Library, 'Shared libraries')}
      </section>
    </nav>
  )
}

export default SourcesNav
