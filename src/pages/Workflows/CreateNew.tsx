import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowBuilder, { type WorkflowBuilderHandle } from './_builder/WorkflowBuilder'
import { useRef, useEffect } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'

const WorkflowCreatePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const builderRef = useRef<WorkflowBuilderHandle>(null)

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getPrompts())
    dispatch(getAvailableModels())
  }, [dispatch])
  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between px-8 py-4 border-b'>
        <div>
          <h1 className='text-2xl font-semibold'>Workflow Builder</h1>
          <p className='text-muted-foreground'>Design your workflow by connecting steps.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={() => builderRef.current?.save()} className='normal-case'>Save</Button>
          <Button variant='secondary' onClick={() => navigate(-1)} className='normal-case'>Back</Button>
        </div>
      </div>
      <div className='flex flex-1 min-h-0'>
        <ReactFlowProvider>
          <WorkflowBuilder
            ref={builderRef}
            onSaved={(wid) => navigate(`/workflows/${wid}/edit`)}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default WorkflowCreatePage

