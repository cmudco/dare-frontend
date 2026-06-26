import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { getAgents } from '../../redux/asyncThunks/agent'
import AgentHeader from './AgentHeader'
import AgentTable from './AgentTable'
import AgentModal from './AgentModal'

const AgentManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getAgents())
  }, [dispatch])

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
            <AgentHeader onSearch={handleSearch} />
            <AgentTable searchQuery={searchQuery} />
          </div>
        </div>
        <AgentModal />
      </div>
    </div>
  )
}

export default AgentManagerLayout
