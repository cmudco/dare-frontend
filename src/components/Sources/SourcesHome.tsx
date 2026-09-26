import { useMemo } from 'react'
import { FolderPlus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { openModal } from '@/redux/fileSlice'
import { SourceLocation } from '@/redux/types/files'
import { useSourceFiles } from '@/hooks/useSourceFiles'
import FolderCard from './FolderCard'
import SourceList from './SourceList'

const RECENT_COUNT = 8
const ALL: SourceLocation = { kind: 'all' }

interface SourcesHomeProps {
  goTo: (location: SourceLocation) => void
  onNewFolder: () => void
}

const SourcesHome = ({ goTo, onNewFolder }: SourcesHomeProps) => {
  const dispatch = useAppDispatch()
  const folders = useAppSelector((state) => state.files.folders)
  const files = useSourceFiles(ALL)
  const recentFolders = useMemo(
    () => [...folders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [folders]
  )

  return (
    <div className='flex flex-col gap-8'>
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-medium text-muted-foreground'>Folders</h2>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {recentFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={() => goTo({ kind: 'folder', folderId: folder.id })}
            />
          ))}
          <button
            type='button'
            onClick={onNewFolder}
            className='flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
          >
            <FolderPlus className='h-4 w-4' />
            New folder
          </button>
        </div>
      </section>

      <section className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-sm font-medium text-muted-foreground'>Recent</h2>
          {files.length > RECENT_COUNT && (
            <Button variant='link' size='sm' onClick={() => goTo(ALL)}>
              View all {files.length}
            </Button>
          )}
        </div>
        <SourceList
          files={files.slice(0, RECENT_COUNT)}
          emptyState={
            <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center'>
              <p className='text-sm text-muted-foreground'>
                Upload documents, images, or audio to search them in chat.
              </p>
              <Button onClick={() => dispatch(openModal())}>
                <Upload className='h-4 w-4' />
                Upload files
              </Button>
            </div>
          }
        />
      </section>
    </div>
  )
}

export default SourcesHome
