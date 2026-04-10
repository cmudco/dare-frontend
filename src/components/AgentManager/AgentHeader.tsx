import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useDispatch } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useState } from 'react'
import { openModal } from '@/redux/agentSlice'
import { Plus } from 'lucide-react'

interface AgentHeaderProps {
  onSearch: (query: string) => void
}

const AgentHeader: React.FC<AgentHeaderProps> = ({ onSearch }) => {
  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleCreateAgent = () => {
    dispatch(openModal())
  }

  return (
    <div className='flex items-center justify-between px-2.5'>
      <div
        data-tour='agents-search'
        className='relative flex h-[40px] w-[300px] items-center'
      >
        <MagnifyingGlassIcon className='absolute left-3 h-5 w-5 text-gray-500' />
        <Input
          type='text'
          placeholder='Search agents'
          className='rounded-md border border-gray-300 bg-white pl-10 focus:border-primary focus:ring-2 focus:ring-primary dark:border-dark-icon-unselected dark:bg-transparent dark:text-white'
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <Button
        data-tour='agents-create'
        variant='default'
        className='whitespace-nowrap rounded-md py-2 font-normal normal-case shadow-sm'
        onClick={handleCreateAgent}
      >
        <Plus />
        Create Agent
      </Button>
    </div>
  )
}

export default AgentHeader
