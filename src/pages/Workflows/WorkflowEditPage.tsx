import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import WorkflowBuilder from './_builder/WorkflowBuilder'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setManualMode,
  resetPartialRun,
  setSavingStatus,
} from '@/redux/workflowBuilderSlice'
import { SavingStatus } from '@/redux/types/workflowBuilder'
import { serializeWorkflow } from '@/utils/workflowBuilder/serializeWorkflow'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import {
  startWorkflowRun,
  createOrUpdateWorkflow,
  getActivePartialRun,
  toggleManualMode,
} from '@/redux/asyncThunks/workflow'
import { clearSelectedWorkflow } from '@/redux/workflowSlice'
import { setSelectedWorkflowRun } from '@/redux/workflowSlice'
import { toast } from '@/utils/toast'
import type { GetActivePartialRunResponse } from '@/redux/types/workflow'
import { useDebounce } from '@/hooks/useDebounce'
import { Loader2, Check, AlertCircle, Copy } from 'lucide-react'
import {
  exportWorkflow,
  exportWorkflowToString,
} from '@/utils/workflowBuilder/exportWorkflow'

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
  const manualModeEnabled = useAppSelector(
    (s) => s.workflowBuilder.manualModeEnabled
  )
  const executedStepNodeIds = useAppSelector(
    (s) => s.workflowBuilder.executedStepNodeIds
  )
  const currentPartialRunId = useAppSelector(
    (s) => s.workflowBuilder.currentPartialRunId
  )
  const savingStatus = useAppSelector((s) => s.workflowBuilder.savingStatus)

  const stepNodes = nodes.filter((n) => n.type === 'step')
  const executedStepsCount = stepNodes.filter((n) =>
    executedStepNodeIds.includes(n.id)
  ).length
  const loadedWorkflow = useAppSelector((s) => s.workflowBuilder.loadedWorkflow)

  const handleManualModeToggle = async (checked: boolean) => {
    if (!loadedWorkflow?.id) return

    try {
      // Update the workflow's manual mode setting
      await dispatch(
        toggleManualMode({
          workflowId: loadedWorkflow.id,
          manualModeEnabled: checked,
        })
      ).unwrap()

      // Update local state
      dispatch(setManualMode(checked))

      if (checked) {
        // Fetch and restore partial run if it exists
        const result = await dispatch(getActivePartialRun(loadedWorkflow.id))
        if (result.meta.requestStatus === 'fulfilled') {
          const payload = result.payload as GetActivePartialRunResponse
          if (payload.partialRun) {
            toast.success(
              `Restored partial run with ${payload.executedStepNodeIds.length} completed steps`
            )
          }
        }
      } else {
        // Don't reset partial run - it will be continued when "Run All Steps" is clicked
        toast.success(
          'Manual mode disabled. Click "Run All Steps" to complete remaining steps.'
        )
      }
    } catch (error) {
      toast.error('Failed to toggle manual mode. Please try again.')
      console.error('Error toggling manual mode:', error)
    }
  }

  const handleSave = async () => {
    dispatch(setSavingStatus(SavingStatus.Saving))

    const serializedWorkflow = serializeWorkflow(nodes, edges, savedViewport)
    if (!serializedWorkflow) {
      dispatch(setSavingStatus(SavingStatus.Error))
      return
    }

    try {
      await dispatch(
        createOrUpdateWorkflow({
          id,
          workflowData: serializedWorkflow,
        })
      ).unwrap()
      dispatch(setSavingStatus(SavingStatus.Saved))

      // Reset to idle after a few seconds
      setTimeout(() => {
        dispatch(setSavingStatus(SavingStatus.Idle))
      }, 3000)
    } catch (error) {
      console.error('Save failed:', error)
      dispatch(setSavingStatus(SavingStatus.Error))
    }
  }

  const handleRunWorkflow = async () => {
    if (!id) return

    // First save the workflow
    await handleSave()

    // Then run it
    const result = await dispatch(startWorkflowRun(id))

    // Handle errors from backend (formatted by errorHandler)
    if (result.meta.requestStatus === 'rejected' && result.payload) {
      toast.error(result.payload as string, 10000)
    }
  }

  // Auto-save logic
  const debouncedNodes = useDebounce(nodes, 3000)
  const debouncedEdges = useDebounce(edges, 3000)
  const debouncedViewport = useDebounce(savedViewport, 3000)

  // Track if initial load is done to avoid saving on mount
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (loadedWorkflow) {
      setIsLoaded(true)
    }
  }, [loadedWorkflow])

  useEffect(() => {
    if (!isLoaded || !id || isRunning || !hasAtLeastOneStep) return

    handleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNodes, debouncedEdges, debouncedViewport, id])

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

  // Restore partial run on initial load if manual mode is enabled
  // This only runs once when the workflow is loaded, not when toggling manual mode
  useEffect(() => {
    const restorePartialRunOnLoad = async (): Promise<void> => {
      if (!manualModeEnabled || !loadedWorkflow?.id || currentPartialRunId) {
        return
      }

      try {
        // Simply dispatch the thunk - extraReducer handles the state update
        await dispatch(getActivePartialRun(loadedWorkflow.id))
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('Failed to restore partial run on load:', errorMessage)
      }
    }

    restorePartialRunOnLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedWorkflow?.id])

  /**
   * Copies the current workflow configuration to clipboard.
   * The exported workflow is sanitized (user-specific FKs cleared) and can be
   * shared with others or pasted into another workflow canvas.
   */
  const handleCopyWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('No nodes to copy. Add some nodes first.')
      return
    }

    try {
      const exportedWorkflow = exportWorkflow(nodes, edges, savedViewport)
      const jsonString = exportWorkflowToString(exportedWorkflow)

      await navigator.clipboard.writeText(jsonString)

      toast.success(
        `Workflow copied to clipboard (${nodes.length} nodes, ${edges.length} connections)`
      )
    } catch (error) {
      console.error('Failed to copy workflow:', error)
      toast.error('Failed to copy workflow to clipboard')
    }
  }

  return (
    <div className='flex h-screen flex-col'>
      <div className='flex items-center justify-between border-b px-8 py-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Edit Workflow</h1>
          <p className='text-muted-foreground'>
            Modify your workflow and save changes.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {/* Auto-save Status Indicator */}
          <div className='flex items-center gap-2 px-2'>
            {savingStatus === SavingStatus.Saving && (
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Loader2 className='h-3 w-3 animate-spin' />
                Saving...
              </div>
            )}
            {savingStatus === SavingStatus.Saved && (
              <div className='flex items-center gap-1.5 text-xs text-green-600'>
                <Check className='h-3 w-3' />
                Saved
              </div>
            )}
            {savingStatus === SavingStatus.Error && (
              <div className='flex items-center gap-1.5 text-xs text-red-600'>
                <AlertCircle className='h-3 w-3' />
                Error saving
              </div>
            )}
          </div>

          {/* Manual Mode Toggle */}
          <div className='flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2'>
            <Switch
              id='manual-mode'
              checked={manualModeEnabled}
              onCheckedChange={handleManualModeToggle}
              disabled={isRunning}
            />
            <Label
              htmlFor='manual-mode'
              className='cursor-pointer text-xs font-medium'
            >
              Manual Mode
            </Label>
          </div>

          {/* Partial Run Status */}
          {manualModeEnabled && currentPartialRunId && (
            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='text-xs'>
                {executedStepsCount}/{stepNodes.length} steps executed
              </Badge>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => dispatch(resetPartialRun())}
                className='h-7 text-xs'
              >
                Reset
              </Button>
            </div>
          )}

          {/* Copy Workflow Button */}
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleCopyWorkflow}
                  disabled={isRunning || nodes.length === 0}
                  className='h-9 w-9'
                  aria-label='Copy workflow configuration'
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy workflow to clipboard</p>
                <p className='text-xs text-muted-foreground'>
                  Share or paste into another workflow
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
          {id && !manualModeEnabled && (
            <Button
              variant='outline'
              onClick={handleRunWorkflow}
              disabled={isRunning || manualModeEnabled}
              className='normal-case'
            >
              Run All Steps
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
      <div className='flex-1 overflow-hidden'>
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
