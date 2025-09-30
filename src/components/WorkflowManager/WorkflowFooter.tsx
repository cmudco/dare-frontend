// LEGACY WORKFLOW FOOTER - COMMENTED OUT
/*
import React from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { closeModal } from '../../redux/workflowSlice'
import { DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { WorkflowFooterProps } from '@/redux/types/workflow'

const WorkflowFooter: React.FC<WorkflowFooterProps> = ({ loading }) => {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <DialogFooter className='flex justify-end gap-2 pt-4'>
      <Button
        type='button'
        variant='outline'
        onClick={() => dispatch(closeModal())}
      >
        Cancel
      </Button>
      <Button type='submit' disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </DialogFooter>
  )
}

export default WorkflowFooter
*/

// Placeholder component to prevent import errors
import React from 'react'

const WorkflowFooter: React.FC = () => {
  return null
}

export default WorkflowFooter
