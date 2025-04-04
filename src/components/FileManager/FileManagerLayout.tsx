import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { getFiles } from '../../redux/aynscThunks/file'
import { getTags } from '../../redux/aynscThunks/tag'

import FileUploadModal from './FileUploadModal'
import FileHeader from './FileHeader'
import FileTable from './FileTable'
import FileStatusPoller from './FileStatusPoller'
import ProcessingFilesPopover from './ProcessingFilesPopover'

const FileManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getTags())
  }, [dispatch])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTagsChange = (tags: number[]) => {
    setSelectedTags(tags)
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-8 flex-grow overflow-auto relative'>
        <div className='h-full w-full shadow-none bg-transparent'>
          <div className='px-0'>
            <FileHeader
              onSearch={handleSearch}
              onTagsChange={handleTagsChange}
            />
            <FileTable searchQuery={searchQuery} selectedTags={selectedTags} />
          </div>
        </div>

        <FileUploadModal />
        <FileStatusPoller />
        <ProcessingFilesPopover />
      </div>
    </div>
  )
}

export default FileManagerLayout
