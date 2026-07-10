import { useEffect, useState } from 'react'
import WorkflowHeader from './WorkflowHeader'
import WorkflowTable from './WorkflowTable'
import SharedWorkflowsTable from './SharedWorkflowsTable'
import { useAppDispatch } from '@/redux/hooks'
import { getFiles } from '@/redux/asyncThunks/file'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { getWorkflows, getSharedWorkflows } from '@/redux/asyncThunks/workflow'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { fetchSharedWithMe } from '@/redux/asyncThunks/sharing'
import { ShareableEntityType } from '@/redux/types/sharing'

const WorkflowManagerLayout = () => {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<
    'my' | 'library' | 'shared-with-me'
  >('my')
  const enableSharing = useFeatureFlag('enableSharing')

  useEffect(() => {
    dispatch(getWorkflows())
    dispatch(getFiles())
    dispatch(getAvailableModels())
  }, [dispatch])

  useEffect(() => {
    if (activeTab === 'library') {
      dispatch(getSharedWorkflows())
    }
    if (activeTab === 'shared-with-me') {
      dispatch(fetchSharedWithMe(ShareableEntityType.Workflow))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='grow overflow-auto p-8'>
        <div
          className='h-full w-full shadow-none'
          color='transparent'
          placeholder=''
        >
          <div className='px-0' placeholder=''>
            <WorkflowHeader onSearch={handleSearch} />
            {enableSharing && (
              <div
                data-tour='workflows-tabs'
                className='mt-4 flex gap-1 border-b border-border'
              >
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
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'shared-with-me'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('shared-with-me')}
                >
                  Shared With Me
                </button>
              </div>
            )}
            {activeTab === 'shared-with-me' ? (
              <div className='mt-4'>
                <SharedWorkflowsTable searchQuery={searchQuery} />
              </div>
            ) : (
              <WorkflowTable searchQuery={searchQuery} activeTab={activeTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowManagerLayout
