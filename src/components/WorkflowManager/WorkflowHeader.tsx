import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useDispatch } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useState } from 'react'
import { openModal } from '@/redux/workflowSlice'
import { Plus } from 'lucide-react'
import SelectModeDialog from './SelectModeDialog'
import { useNavigate } from 'react-router-dom'

interface WorkflowHeaderProps {
  onSearch: (query: string) => void
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ onSearch }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [modePromptOpen, setModePromptOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleCreateWorkflow = () => {
    setModePromptOpen(true)
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

      <SelectModeDialog
        open={modePromptOpen}
        onOpenChange={setModePromptOpen}
        title='Select mode'
        onSelectNew={() => {
          setModePromptOpen(false)
          navigate('/workflows/create')
        }}
        onSelectLegacy={() => {
          setModePromptOpen(false)
          dispatch(openModal())
        }}
      />
    </div>
  )
}

export default WorkflowHeader
