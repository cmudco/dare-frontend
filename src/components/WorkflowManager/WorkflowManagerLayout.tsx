import { useEffect, useState } from 'react'
import WorkflowHeader from './WorkflowHeader'
import WorkflowTable from './WorkflowTable'
import { useAppDispatch } from '@/redux/hooks'
import { getFiles } from '@/redux/asyncThunks/file'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { getWorkflows, getSharedWorkflows } from '@/redux/asyncThunks/workflow'

const WorkflowManagerLayout = () => {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('my')

  useEffect(() => {
    dispatch(getWorkflows())
    dispatch(getFiles())
    dispatch(getAvailableModels())
  }, [dispatch])

  useEffect(() => {
    if (activeTab === 'library') {
      dispatch(getSharedWorkflows())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

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
            <div className='mt-4 flex gap-1 border-b border-border'>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'my'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('my')}
              >
                My Workflows
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'library'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('library')}
              >
                Library
              </button>
            </div>
            <WorkflowTable searchQuery={searchQuery} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowManagerLayout
