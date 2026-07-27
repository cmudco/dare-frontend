import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import {
  getFiles,
  getFolders,
  getSharedFiles,
} from '../../redux/asyncThunks/file'
import { getTags } from '../../redux/asyncThunks/tag'
import { setCurrentView, setActiveTab } from '../../redux/fileSlice'

import FileUploadModal from './FileUploadModal'
import FileHeader from './FileHeader'
import FileTable from './FileTable'
import FileStatusPoller from './FileStatusPoller'
import FolderHeader from '../FolderManager/FolderHeader'
import FolderTable from '../FolderManager/FolderTable'
import MoveFilesModal from './MoveFilesModal'
import ShareFileModal from './ShareFileModal'
import SharedFilesTable from './SharedFilesTable'
import SharedLibraries from './SharedLibraries'
import ViewToggle from './ViewToggle'
import { Badge } from '../ui/badge'
import { FileView } from '../../redux/types/files'

const FileManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentView, activeTab, sharedFiles } = useSelector(
    (state: RootState) => state.files
  )
  const user = useSelector((state: RootState) => state.user.user)
  const isSyftboxUser = user?.isSyftboxFileStorage ?? false

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getFolders())
    dispatch(getTags())
    if (isSyftboxUser) {
      dispatch(getSharedFiles())
    }
  }, [dispatch, isSyftboxUser])

  const handleToggleView = (view: FileView) => {
    dispatch(setCurrentView(view))
    if (view === 'files' || view === 'media') {
      dispatch(getFiles())
    } else if (view === 'folders') {
      dispatch(getFolders())
    }
  }

  const handleTabChange = (tab: 'my-files' | 'shared') => {
    dispatch(setActiveTab(tab))
    if (tab === 'shared' && sharedFiles.length === 0) {
      dispatch(getSharedFiles())
    }
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='relative grow overflow-auto p-8'>
        <div className='h-full w-full bg-transparent shadow-none'>
          <div className='px-0'>
            {currentView === 'files' && (
              <>
                <FileHeader onToggleView={handleToggleView} />

                {isSyftboxUser && (
                  <div className='mt-4 flex gap-0 border-b px-2.5'>
                    <button
                      className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
                        activeTab === 'my-files'
                          ? 'text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleTabChange('my-files')}
                    >
                      My Files
                    </button>
                    <button
                      className={`relative flex items-center gap-2 px-4 pb-3 text-sm font-medium transition-colors ${
                        activeTab === 'shared'
                          ? 'text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleTabChange('shared')}
                    >
                      Shared with me
                      {sharedFiles.length > 0 && (
                        <Badge
                          variant='default'
                          className='flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs'
                        >
                          {sharedFiles.length}
                        </Badge>
                      )}
                    </button>
                  </div>
                )}

                {activeTab === 'my-files' || !isSyftboxUser ? (
                  <FileTable />
                ) : (
                  <SharedFilesTable />
                )}
              </>
            )}
            {currentView === 'folders' && (
              <>
                <FolderHeader onToggleView={handleToggleView} />
                <FolderTable />
              </>
            )}
            {currentView === 'media' && (
              <>
                <FileHeader onToggleView={handleToggleView} />
                <FileTable />
              </>
            )}
            {currentView === 'libraries' && (
              <>
                <div className='px-2.5'>
                  <ViewToggle onToggleView={handleToggleView} />
                </div>
                <SharedLibraries />
              </>
            )}
          </div>
        </div>

        <FileUploadModal />
        <FileStatusPoller />
        <MoveFilesModal />
        {isSyftboxUser && <ShareFileModal />}
      </div>
    </div>
  )
}

export default FileManagerLayout
