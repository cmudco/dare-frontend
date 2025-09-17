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
import { validateWorkflowData, updateStepApiIds } from '@/redux/workflowBuilderSlice'
import { serializeWorkflow } from '@/utils/workflowBuilder/workflowHelpers'
import { createOrUpdateWorkflow } from '@/redux/asyncThunks/workflow'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'

const WorkflowCreatePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const hasAtLeastOneStep = nodes.some((n) => n.type === 'step')

  const handleSave = () => {
    // Validate first
    dispatch(validateWorkflowData())

    // Get validation result and serialize
    const serializedWorkflow = serializeWorkflow(nodes, edges)
    if (!serializedWorkflow) {
      // Handle validation errors via toast in component
      return
    }

    // Dispatch save action for new workflow
    dispatch(createOrUpdateWorkflow({ workflowData: serializedWorkflow }))
      .unwrap()
      .then((saved: any) => {
        // Map ReactFlow step IDs to API step IDs for new steps
        const stepApiIds: Record<string, number> = {}
        const stepNodes = nodes.filter(n => n.type === 'step' && !n.data.apiId)

        saved.steps.forEach((apiStep: any, idx: number) => {
          if (stepNodes[idx]) {
            stepApiIds[stepNodes[idx].id] = apiStep.id
          }
        })

        // Update step nodes with their API IDs
        if (Object.keys(stepApiIds).length > 0) {
          dispatch(updateStepApiIds({ stepApiIds }))
        }

        const savedId = String(saved.id)
        // Navigate to edit page
        navigate(`/workflows/${savedId}/edit`)
      })
      .catch((error: unknown) => {
        // Handle error via toast
        console.error('Network error:', error)
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
