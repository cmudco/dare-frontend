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
import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { serializeWorkflow } from '@/utils/workflowBuilder/serializeWorkflow'
import { createOrUpdateWorkflow } from '@/redux/asyncThunks/workflow'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { toast } from '@/utils/toast'
import { ArrowLeft, Undo2, Redo2 } from 'lucide-react'
import { WorkflowNodeType } from '@/utils/constants/workflows'

const WorkflowCreatePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const savedViewport = useAppSelector((s) => s.workflowBuilder.savedViewport)
  const hasAtLeastOneStep = nodes.some((n) => n.type === WorkflowNodeType.Step)
  const history = useAppSelector((s) => s.workflowBuilder.history)
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    // @ts-expect-error - exposed by WorkflowBuilder
    if (window.__workflowUndo) window.__workflowUndo()
  }, [])

  const handleRedo = useCallback(() => {
    // @ts-expect-error - exposed by WorkflowBuilder
    if (window.__workflowRedo) window.__workflowRedo()
  }, [])

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
    <div className='relative h-screen w-screen overflow-hidden bg-gray-50'>
      {/* Full canvas workflow builder */}
      <ReactFlowProvider>
        <WorkflowBuilder />
      </ReactFlowProvider>

      {/* Floating top toolbar */}
      <div className='pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4'>
        {/* Back button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigate('/workflows')}
          className='pointer-events-auto h-9 gap-2 bg-white/90 shadow-md backdrop-blur-sm'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Workflows
        </Button>

        {/* Controls toolbar */}
        <div className='pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm'>
          {/* Node/Edge count */}
          <div className='flex items-center gap-2 border-r border-border pr-3 text-xs text-muted-foreground'>
            <span>{nodes.length} nodes</span>
            <span className='text-border'>|</span>
            <span>{edges.length} edges</span>
          </div>

          {/* Undo/Redo */}
          <div className='flex items-center gap-1 border-r border-border pr-3'>
            <TooltipProvider>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className='h-8 w-8'
                  >
                    <Undo2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Cmd/Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className='h-8 w-8'
                  >
                    <Redo2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Cmd/Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size='sm'
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
        </div>
      </div>
    </div>
  )
}

export default WorkflowCreatePage
