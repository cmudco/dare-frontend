import { useEffect, useState } from 'react'
import WorkflowHeader from './WorkflowHeader'
import WorkflowTable from './WorkflowTable'
// LEGACY: Commenting out WorkflowModal import
// import WorkflowModal from './WorkflowModal'
import { useAppDispatch } from '@/redux/hooks'
import { getFiles } from '@/redux/asyncThunks/file'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { getWorkflows } from '@/redux/asyncThunks/workflow'

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
    <div className='flex h-full flex-col'>
      <div className='flex-grow overflow-auto p-8'>
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
        {/* LEGACY: Commenting out WorkflowModal component */}
        {/* <WorkflowModal /> */}
      </div>
    </div>
  )
}

export default WorkflowManagerLayout
