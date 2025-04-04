import { useEffect, useState } from 'react'
import { getWorkflows } from '../../redux/asyncThunks/workflow'
import WorkflowHeader from './WorkflowHeader'
import WorkflowTable from './WorkflowTable'
import WorkflowModal from './WorkflowModal'
import { useAppDispatch } from '@/redux/hooks'
import { getFiles } from '@/redux/aynscThunks/file'
import { getAvailableModels } from '@/redux/aynscThunks/conversation'

const WorkflowManagerLayout = () => {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getWorkflows())
    dispatch(getFiles())
    dispatch(getAvailableModels())
  }, [dispatch])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-8 flex-grow overflow-auto'>
        <div
          className='h-full w-full shadow-none'
          color='transparent'
          placeholder=''
        >
          <div className='px-0' placeholder=''>
            <WorkflowHeader onSearch={handleSearch} />
            <WorkflowTable searchQuery={searchQuery} />
          </div>
        </div>
        <WorkflowModal />
      </div>
    </div>
  )
}

export default WorkflowManagerLayout
