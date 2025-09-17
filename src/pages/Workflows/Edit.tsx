import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowBuilder, { type WorkflowBuilderHandle } from './_builder/WorkflowBuilder'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { getWorkflowById, startWorkflowRun, getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { clearSelectedWorkflow } from '@/redux/workflowSlice'
import { setSelectedWorkflowRun } from '@/redux/workflowSlice'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { useState, useEffect as useEffectHook } from 'react'

const WorkflowEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const builderRef = useRef<WorkflowBuilderHandle>(null)
  const workflow = useAppSelector((s) => s.workflow.selectedWorkflow)
  const selectedRun = useAppSelector((s) => s.workflow.selectedWorkflowRun)
  const [isRunning, setIsRunning] = useState(false)

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

  // Load last run only once per workflow id (avoid re-fetch on Save)
  const loadedRunForWorkflowRef = useRef<string | null>(null)
  useEffect(() => {
    if (!workflow?.id) return
    const wfId = String(workflow.id)
    if (loadedRunForWorkflowRef.current === wfId) return
    const lastId = (workflow.latestRun?.id as any) || workflow.lastRunId
    if (lastId) dispatch(getWorkflowRunById(String(lastId)))
    else dispatch(setSelectedWorkflowRun(null))
    loadedRunForWorkflowRef.current = wfId
  }, [dispatch, workflow?.id])

  // Poll run while running (only for this workflow)
  useEffectHook(() => {
    if (!selectedRun?.id) return
    const belongsToThis = String(selectedRun.workflow) === String(id)
    setIsRunning(belongsToThis && selectedRun.status === WorkflowRunStepStatus.Running)
    let t: any
    if (belongsToThis && selectedRun.status === WorkflowRunStepStatus.Running) {
      t = setInterval(() => dispatch(getWorkflowRunById(selectedRun.id)), 3000)
    }
    return () => t && clearInterval(t)
  }, [dispatch, selectedRun?.id, selectedRun?.status, selectedRun?.workflow, id])

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between px-8 py-4 border-b'>
        <div>
          <h1 className='text-2xl font-semibold'>Edit Workflow</h1>
          <p className='text-muted-foreground'>Modify your workflow and save changes.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={() => builderRef.current?.save()} className='normal-case' disabled={isRunning}>Save changes</Button>
          {id && (
            <Button variant='outline' onClick={() => dispatch(startWorkflowRun(id))} disabled={isRunning} className='normal-case'>Run</Button>
          )}
          <Button
            variant='secondary'
            onClick={() => { dispatch(setSelectedWorkflowRun(null)); navigate('/workflows') }}
            className='normal-case'
          >Back</Button>
        </div>
      </div>
      <div className='flex flex-1 min-h-0'>
        <ReactFlowProvider key={id}>
          <WorkflowBuilder key={id} ref={builderRef} initialWorkflow={workflow || undefined} workflowId={id} disableEditing={isRunning} />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default WorkflowEditPage
