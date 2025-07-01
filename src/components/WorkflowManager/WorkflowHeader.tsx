import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useDispatch } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useState } from 'react'
import { openModal } from '@/redux/workflowSlice'
import { Plus } from 'lucide-react'

interface WorkflowHeaderProps {
  onSearch: (query: string) => void
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ onSearch }) => {
  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleCreateWorkflow = () => {
    dispatch(openModal())
  }

  return (
    <div className='flex items-center justify-between px-2.5'>
      <div className='relative flex h-[40px] w-[300px] items-center'>
        <MagnifyingGlassIcon className='absolute left-3 h-5 w-5 text-muted-foreground' />
        <Input
          type='text'
          placeholder='Search workflows'
          className='rounded-md border border-gray-300 bg-white pl-10 focus:border-primary focus:ring-2 focus:ring-primary'
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <Button
        variant='default'
        className='whitespace-nowrap rounded-md py-2 font-normal normal-case shadow-sm'
        onClick={handleCreateWorkflow}
      >
        <Plus />
        Create Workflow
      </Button>
    </div>
  )
}

export default WorkflowHeader
