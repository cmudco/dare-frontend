import { useEffect, useState } from 'react'
import FileStatusPoller from '@/components/FileManager/FileStatusPoller'
import FileUploadModal from '@/components/FileManager/FileUploadModal'
import MoveFilesModal from '@/components/FileManager/MoveFilesModal'
import ShareFileModal from '@/components/FileManager/ShareFileModal'
import SharedFilesTable from '@/components/FileManager/SharedFilesTable'
import SharedLibraries from '@/components/FileManager/SharedLibraries'
import FolderModal from '@/components/FolderManager/FolderModal'
import FolderUploadModal from '@/components/FolderManager/FolderUploadModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  createFolder,
  getFiles,
  getFolders,
  getSharedFiles,
} from '@/redux/asyncThunks/file'
import { getTags } from '@/redux/asyncThunks/tag'
import { SourceLocation } from '@/redux/types/files'
import { useSourceLocation } from '@/hooks/useSourceLocation'
import BulkActionBar from './BulkActionBar'
import SourcesHome from './SourcesHome'
import SourcesListView from './SourcesListView'
import SourcesNav from './SourcesNav'
import SourcesToolbar from './SourcesToolbar'

const ALL: SourceLocation = { kind: 'all' }

const SourcesLayout = () => {
  const dispatch = useAppDispatch()
  const { location, goTo } = useSourceLocation()
  const { searchQuery, selectedTags, mediaTypeFilter } = useAppSelector(
    (state) => state.files
  )
  const isSyftboxUser = useAppSelector(
    (state) => state.user.user?.isSyftboxFileStorage ?? false
  )
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [uploadingFolder, setUploadingFolder] = useState(false)

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getFolders())
    dispatch(getTags())
    if (isSyftboxUser) dispatch(getSharedFiles())
  }, [dispatch, isSyftboxUser])

  const filtering =
    searchQuery.trim() !== '' ||
    selectedTags.length > 0 ||
    mediaTypeFilter !== 'all'
  // Filtering from Home searches the whole library.
  const browsing = location.kind === 'home' && filtering ? ALL : location
  const showToolbar =
    browsing.kind !== 'libraries' && browsing.kind !== 'shared'

  const renderContent = () => {
    switch (browsing.kind) {
      case 'home':
        return (
          <SourcesHome
            goTo={goTo}
            onNewFolder={() => setCreatingFolder(true)}
          />
        )
      case 'libraries':
        return <SharedLibraries />
      case 'shared':
        return <SharedFilesTable />
      default:
        return <SourcesListView location={browsing} goTo={goTo} />
    }
  }

  return (
    <div className='flex grow flex-col gap-6 overflow-auto px-10 py-6 md:flex-row'>
      <SourcesNav
        location={location}
        goTo={goTo}
        onNewFolder={() => setCreatingFolder(true)}
      />
      <main className='flex min-w-0 grow flex-col gap-5'>
        {showToolbar && (
          <SourcesToolbar onUploadFolder={() => setUploadingFolder(true)} />
        )}
        {renderContent()}
        <BulkActionBar />
      </main>

      <FileUploadModal />
      <FileStatusPoller />
      <MoveFilesModal />
      {isSyftboxUser && <ShareFileModal />}
      <FolderModal
        isOpen={creatingFolder}
        onClose={() => setCreatingFolder(false)}
        onCreateFolder={(name) => dispatch(createFolder(name))}
      />
      <FolderUploadModal
        isOpen={uploadingFolder}
        onClose={() => setUploadingFolder(false)}
      />
    </div>
  )
}

export default SourcesLayout
