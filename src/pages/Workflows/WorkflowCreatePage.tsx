import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigate } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowBuilder from './_builder/WorkflowBuilder'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { serializeWorkflow } from '@/utils/workflowBuilder/serializeWorkflow'
import { createOrUpdateWorkflow } from '@/redux/asyncThunks/workflow'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { toast } from '@/utils/toast'

const WorkflowCreatePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const savedViewport = useAppSelector((s) => s.workflowBuilder.savedViewport)
  const hasAtLeastOneStep = nodes.some((n) => n.type === 'step')

  const handleSave = () => {
    const serializedWorkflow = serializeWorkflow(nodes, edges, savedViewport)
    if (!serializedWorkflow) {
      toast.error('Unable to serialize workflow.')
      return
    }

    // Dispatch save action for new workflow
    dispatch(createOrUpdateWorkflow({ workflowData: serializedWorkflow }))
      .unwrap()
      .then((saved) => {
        const savedId = String(saved.id)
        toast.success('Workflow saved!')
        navigate(`/workflows/${savedId}/edit`)
      })
      .catch(() => {
        toast.error('Failed to save workflow. Please try again.')
      })
  }

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getPrompts())
    dispatch(getAvailableModels())
  }, [dispatch])
  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between border-b px-8 py-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Workflow Builder</h1>
          <p className='text-muted-foreground'>
            Design your workflow by connecting steps.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleSave}
                    className='normal-case'
                    disabled={!hasAtLeastOneStep}
                  >
                    Save
                  </Button>
                </span>
              </TooltipTrigger>
              {!hasAtLeastOneStep && (
                <TooltipContent>Add at least one step to save</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button
            variant='secondary'
            onClick={() => navigate(-1)}
            className='normal-case'
          >
            Back
          </Button>
        </div>
      </div>
      <div className='flex min-h-0 flex-1'>
        <ReactFlowProvider>
          <WorkflowBuilder />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default WorkflowCreatePage
