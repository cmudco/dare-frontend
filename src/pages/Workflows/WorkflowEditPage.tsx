import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowBuilder from './_builder/WorkflowBuilder'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setErrorsByNodeId } from '@/redux/workflowBuilderSlice'
import { serializeWorkflow } from '@/utils/workflowBuilder/serializeWorkflow'
import { validateWorkflow } from '@/utils/workflowBuilder/validateWorkflow'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import {
  startWorkflowRun,
  createOrUpdateWorkflow,
} from '@/redux/asyncThunks/workflow'
import { clearSelectedWorkflow } from '@/redux/workflowSlice'
import { setSelectedWorkflowRun } from '@/redux/workflowSlice'
import { toast } from '@/utils/toast'

const WorkflowEditPage = () => {
  const navigate = useNavigate()
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? Number(idParam) : undefined
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const savedViewport = useAppSelector((s) => s.workflowBuilder.savedViewport)
  const hasAtLeastOneStep = nodes.some((n) => n.type === 'step')
  const isRunning = useAppSelector((s) => s.workflowBuilder.isRunning)

  const handleSave = () => {
    const validation = validateWorkflow(nodes, edges)
    dispatch(setErrorsByNodeId(validation.nodeErrors))

    if (!validation.isValid) {
      const message =
        validation.errorMessages[0] || 'Please fix the highlighted nodes'
      toast.error(message)
      return
    }

    const serializedWorkflow = serializeWorkflow(nodes, edges, savedViewport)
    if (!serializedWorkflow) {
      toast.error(
        'Unable to serialize workflow. Please fix the highlighted nodes.'
      )
      return
    }

    // Dispatch save action
    const targetId = id
    const action = targetId
      ? createOrUpdateWorkflow({
          id: targetId,
          workflowData: serializedWorkflow,
        })
      : createOrUpdateWorkflow({ workflowData: serializedWorkflow })

    dispatch(action)
      .unwrap()
      .then(() => {
        dispatch(setSelectedWorkflowRun(null))
        toast.success('Workflow updated!')
      })
      .catch(() => {
        toast.error('Failed to update workflow. Please try again.')
      })
  }

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getPrompts())
    dispatch(getAvailableModels())
  }, [dispatch])

  // Clear any previous workflow/run state when component mounts
  useEffect(() => {
    if (id) {
      dispatch(clearSelectedWorkflow())
      dispatch(setSelectedWorkflowRun(null))
    }
  }, [dispatch, id])

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between border-b px-8 py-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Edit Workflow</h1>
          <p className='text-muted-foreground'>
            Modify your workflow and save changes.
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
                    disabled={isRunning || !hasAtLeastOneStep}
                  >
                    Save changes
                  </Button>
                </span>
              </TooltipTrigger>
              {(isRunning || !hasAtLeastOneStep) && (
                <TooltipContent>
                  {isRunning
                    ? 'Cannot save while a run is in progress'
                    : 'Add at least one step to save'}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {id && (
            <Button
              variant='outline'
              onClick={() => dispatch(startWorkflowRun(id!))}
              disabled={isRunning}
              className='normal-case'
            >
              Run
            </Button>
          )}
          <Button
            variant='secondary'
            onClick={() => {
              dispatch(setSelectedWorkflowRun(null))
              navigate('/workflows')
            }}
            className='normal-case'
          >
            Back
          </Button>
        </div>
      </div>
      <div className='flex min-h-0 flex-1'>
        <ReactFlowProvider key={id}>
          <WorkflowBuilder
            key={id}
            workflowId={id}
            disableEditing={isRunning}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default WorkflowEditPage
