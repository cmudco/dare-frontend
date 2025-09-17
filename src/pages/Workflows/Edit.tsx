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
import { validateWorkflowData, updateStepApiIds } from '@/redux/workflowBuilderSlice'
import { serializeWorkflow } from '@/utils/workflowBuilder/workflowHelpers'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import {
  getWorkflowById,
  startWorkflowRun,
  getWorkflowRunById,
  createOrUpdateWorkflow,
} from '@/redux/asyncThunks/workflow'
import { clearSelectedWorkflow } from '@/redux/workflowSlice'
import { setSelectedWorkflowRun } from '@/redux/workflowSlice'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { useState, useEffect as useEffectHook } from 'react'

const WorkflowEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const workflow = useAppSelector((s) => s.workflow.selectedWorkflow)
  const selectedRun = useAppSelector((s) => s.workflow.selectedWorkflowRun)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const hasAtLeastOneStep = nodes.some((n) => n.type === 'step')
  const [isRunning, setIsRunning] = useState(false)

  const handleSave = () => {
    // Validate first
    dispatch(validateWorkflowData())

    // Get validation result and serialize
    const serializedWorkflow = serializeWorkflow(nodes, edges)
    if (!serializedWorkflow) {
      // Handle validation errors via toast in component
      return
    }

    // Dispatch save action
    const targetId = workflow?.id?.toString() || id || ''
    const action = targetId
      ? createOrUpdateWorkflow({ id: targetId, workflowData: serializedWorkflow })
      : createOrUpdateWorkflow({ workflowData: serializedWorkflow })

    dispatch(action)
      .unwrap()
      .then((saved: any) => {
        // Map ReactFlow step IDs to API step IDs for new steps only
        const stepApiIds: Record<string, number> = {}
        const newStepNodes = nodes.filter(n => n.type === 'step' && !n.data.apiId)

        if (saved.steps && newStepNodes.length > 0) {
          // For existing workflows, new steps are added at the end
          const existingStepsCount = nodes.filter(n => n.type === 'step' && n.data.apiId).length

          saved.steps.slice(existingStepsCount).forEach((apiStep: any, idx: number) => {
            if (newStepNodes[idx]) {
              stepApiIds[newStepNodes[idx].id] = apiStep.id
            }
          })

          // Update step nodes with their API IDs
          if (Object.keys(stepApiIds).length > 0) {
            dispatch(updateStepApiIds({ stepApiIds }))
          }
        }

        // Clear any previously selected run
        dispatch(setSelectedWorkflowRun(null))
        // Handle success via toast
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

  useEffect(() => {
    if (id) {
      // Ensure we don't briefly render a previous workflow while a new one loads
      dispatch(clearSelectedWorkflow())
      dispatch(getWorkflowById(id))
    }
  }, [dispatch, id])

  // Do not auto-load or resume last run when editing; user must click Run
  useEffect(() => {
    if (!workflow?.id) return
    dispatch(setSelectedWorkflowRun(null))
  }, [dispatch, workflow?.id])

  // Poll run while running (only for this workflow)
  useEffectHook(() => {
    if (!selectedRun?.id) return
    const belongsToThis = String(selectedRun.workflow) === String(id)
    setIsRunning(
      belongsToThis && selectedRun.status === WorkflowRunStepStatus.Running
    )
    let t: ReturnType<typeof setInterval> | undefined
    if (belongsToThis && selectedRun.status === WorkflowRunStepStatus.Running) {
      t = setInterval(() => dispatch(getWorkflowRunById(selectedRun.id)), 3000)
    }
    return () => t && clearInterval(t)
  }, [
    dispatch,
    selectedRun?.id,
    selectedRun?.status,
    selectedRun?.workflow,
    id,
  ])

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
              onClick={() => dispatch(startWorkflowRun(id))}
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
            initialWorkflow={workflow || undefined}
            workflowId={id}
            disableEditing={isRunning}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default WorkflowEditPage
