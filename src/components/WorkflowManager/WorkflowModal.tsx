import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { closeModal } from '../../redux/workflowSlice'
import { getPrompts } from '../../redux/aynscThunks/prompt'
import { Dialog, DialogContent } from '../ui/dialog'
import WorkflowForm from './WorkflowForm'

const WorkflowModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isModalOpen } = useSelector((state: RootState) => state.workflow)

  useEffect(() => {
    dispatch(getPrompts())
  }, [dispatch])

  const handleClose = () => {
    dispatch(closeModal())
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='mx-auto max-h-[90vh] w-[90vw] max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg'>
        <WorkflowForm />
      </DialogContent>
    </Dialog>
  )
}

export default WorkflowModal
