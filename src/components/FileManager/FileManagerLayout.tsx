import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import { getFiles, getFolders } from '../../redux/asyncThunks/file'
import { getTags } from '../../redux/asyncThunks/tag'
import { setCurrentView } from '../../redux/fileSlice'

import FileUploadModal from './FileUploadModal'
import FileHeader from './FileHeader'
import FileTable from './FileTable'
import FileStatusPoller from './FileStatusPoller'
import FolderHeader from '../FolderManager/FolderHeader'
import FolderTable from '../FolderManager/FolderTable'
import MoveFilesModal from './MoveFilesModal'

const FileManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentView } = useSelector((state: RootState) => state.files)

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getFolders())
    dispatch(getTags())
  }, [dispatch])

  const handleToggleView = (view: 'files' | 'folders' | 'media') => {
    dispatch(setCurrentView(view))
    if (view === 'files' || view === 'media') {
      dispatch(getFiles())
    } else {
      dispatch(getFolders())
    }
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='relative flex-grow overflow-auto p-8'>
        <div className='h-full w-full bg-transparent shadow-none'>
          <div className='px-0'>
            {currentView === 'files' && (
              <>
                <FileHeader onToggleView={handleToggleView} />
                <FileTable />
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
          </div>
        </div>

        <FileUploadModal />
        <FileStatusPoller />
        <MoveFilesModal />
      </div>
    </div>
  )
}

export default FileManagerLayout
