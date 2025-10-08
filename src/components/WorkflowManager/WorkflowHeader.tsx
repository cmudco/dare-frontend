import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
// LEGACY: Commenting out unused dispatch since legacy modal is disabled
// import { useDispatch } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useState } from 'react'
// LEGACY: Commenting out legacy modal import and SelectModeDialog since only "New" mode is available
// import { openModal } from '@/redux/workflowSlice'
// import SelectModeDialog from './SelectModeDialog'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface WorkflowHeaderProps {
  onSearch: (query: string) => void
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ onSearch }) => {
  // LEGACY: Commenting out unused dispatch since legacy modal is disabled
  // const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleCreateWorkflow = () => {
    // Directly navigate to new workflow creation since legacy mode is disabled
    navigate('/workflows/create')
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

      {/* LEGACY: SelectModeDialog removed since only "New" mode is available */}
      {/* Users now directly navigate to /workflows/create */}
    </div>
  )
}

export default WorkflowHeader
