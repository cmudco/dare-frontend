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
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setManualMode,
  resetPartialRun,
  setSavingStatus,
  setShowExecutionPanel,
  setSelectedBatchRunId,
  setOutputDisplayMode,
  expandAllOutputNodes,
  collapseAllOutputNodes,
} from '@/redux/workflowBuilder'
import { SavingStatus, OutputDisplayMode } from '@/redux/types/workflowBuilder'
import { serializeWorkflow } from '@/utils/workflowBuilder/serializeWorkflow'
import { getFiles } from '@/redux/asyncThunks/file'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import {
  createOrUpdateWorkflow,
  getActivePartialRun,
  toggleManualMode,
} from '@/redux/asyncThunks/workflow'
import { clearSelectedWorkflow } from '@/redux/workflowSlice'
import { toast } from '@/utils/toast'
import type { GetActivePartialRunResponse } from '@/redux/types/workflow'
import { useDebounce } from '@/hooks/useDebounce'
import { useWorkflowSocket } from '@/hooks/useWorkflowSocket'
import { useAutoExpandOutputNodes } from '@/hooks/useAutoExpandOutputNodes'
import {
  Loader2,
  Check,
  AlertCircle,
  Copy,
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  SkipForward,
} from 'lucide-react'
import BatchFileSelectDialog from './_components/BatchFileSelectDialog'
import BatchProgressPanel from './_components/BatchProgressPanel'
import {
  exportWorkflow,
  exportWorkflowToString,
} from '@/utils/workflowBuilder/exportWorkflow'
import { WorkflowNodeType } from '@/utils/constants/workflows'
import {
  getTopologicalOrder,
  getNextExecutableNodeId,
} from '@/utils/workflowBuilder/getTopologicalOrder'
import { saveAndExecuteStep } from '@/redux/asyncThunks/workflowBuilder'
import ToastContainer from '@/components/ui/ToastContainer'

const WorkflowEditPage = () => {
  const navigate = useNavigate()
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? Number(idParam) : undefined
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((s) => s.workflowBuilder.builder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.builder.edges)
  const savedViewport = useAppSelector(
    (s) => s.workflowBuilder.builder.savedViewport
  )
  const hasAtLeastOneStep = nodes.some((n) => n.type === WorkflowNodeType.Step)
  const isRunning = useAppSelector((s) => s.workflowBuilder.execution.isRunning)
  const manualModeEnabled = useAppSelector(
    (s) => s.workflowBuilder.execution.manualModeEnabled
  )
  const executedStepNodeIds = useAppSelector(
    (s) => s.workflowBuilder.execution.executedStepNodeIds
  )
  const currentPartialRunId = useAppSelector(
    (s) => s.workflowBuilder.execution.currentPartialRunId
  )
  const savingStatus = useAppSelector(
    (s) => s.workflowBuilder.builder.savingStatus
  )

  const stepNodes = nodes.filter((n) => n.type === WorkflowNodeType.Step)
  const executedStepsCount = stepNodes.filter((n) =>
    executedStepNodeIds.includes(n.id)
  ).length
  const loadedWorkflow = useAppSelector(
    (s) => s.workflowBuilder.builder.loadedWorkflow
  )
  const history = useAppSelector((s) => s.workflowBuilder.builder.history)
  const currentRun = useAppSelector(
    (s) => s.workflowBuilder.execution.currentRun
  )
  const outputDisplayMode = useAppSelector(
    (s) => s.workflowBuilder.builder.outputDisplayMode
  )
  const batchRun = useAppSelector((s) => s.workflowBuilder.batch.batchRun)
  const hasExecutionData = currentRun !== null
  const hasBatchExecutionData = batchRun.fileStatuses.length > 0
  const canViewExecutionPanel =
    hasExecutionData ||
    isRunning ||
    (hasBatchExecutionData && batchRun.latestRunIsBatch)
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  // Auto-expand output nodes when execution completes
  useAutoExpandOutputNodes()

  // Compute next executable step for manual mode
  const topologicalOrder = useMemo(
    () => getTopologicalOrder(nodes, edges),
    [nodes, edges]
  )
  const nextStepNodeId = useMemo(
    () => getNextExecutableNodeId(topologicalOrder, executedStepNodeIds, nodes),
    [topologicalOrder, executedStepNodeIds, nodes]
  )

  // Socket-based workflow execution
  // This auto-subscribes to get execution state when connected
  const workflowId = idParam ? parseInt(idParam, 10) : undefined
  const { isConnected, startExecution, startBatchExecution } =
    useWorkflowSocket({
      workflowId,
    })

  // Undo/Redo handlers that call the exposed window functions
  const handleUndo = useCallback(() => {
    // @ts-expect-error - exposed by WorkflowBuilder
    if (window.__workflowUndo) window.__workflowUndo()
  }, [])

  const handleRedo = useCallback(() => {
    // @ts-expect-error - exposed by WorkflowBuilder
    if (window.__workflowRedo) window.__workflowRedo()
  }, [])

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

  const handleOutputDisplayModeToggle = (checked: boolean) => {
    const newMode = checked ? OutputDisplayMode.Nodes : OutputDisplayMode.Panel
    dispatch(setOutputDisplayMode(newMode))
    dispatch(checked ? expandAllOutputNodes() : collapseAllOutputNodes())
  }

  const handleSave = useCallback(async () => {
    dispatch(setSavingStatus(SavingStatus.Saving))

    const serializedWorkflow = serializeWorkflow(
      nodes,
      edges,
      savedViewport,
      outputDisplayMode
    )
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
  }, [dispatch, nodes, edges, savedViewport, outputDisplayMode, id])

  const handleRunWorkflow = async () => {
    if (!id) return

    // Check socket connection
    if (!isConnected) {
      toast.error('WebSocket not connected. Please wait and try again.')
      return
    }

    // First save the workflow
    await handleSave()

    // Then start execution via socket (handles creation, subscription, and execution atomically)
    startExecution({ workflowId: id })
  }

  const handleRunNextStep = () => {
    if (!id || !nextStepNodeId || isRunning) return

    if (!isConnected) {
      toast.error('WebSocket not connected. Please wait and try again.')
      return
    }

    dispatch(
      saveAndExecuteStep({
        workflowId: id,
        stepNodeId: nextStepNodeId,
        workflowRunId: currentPartialRunId || undefined,
      })
    )
  }

  const handleBatchRun = async (fileIds: number[]) => {
    if (!id) return

    if (!isConnected) {
      toast.error('WebSocket not connected. Please wait and try again.')
      return
    }

    await handleSave()
    startBatchExecution({ workflowId: id, fileIds })
  }

  const handleViewExecution = () => {
    if (batchRun.latestRunIsBatch && batchRun.selectedRunId === null) {
      const latestBatchRun = [...batchRun.fileStatuses]
        .reverse()
        .find((status) => status.workflowRunId)
      if (latestBatchRun?.workflowRunId) {
        dispatch(setSelectedBatchRunId(latestBatchRun.workflowRunId))
      }
    }
    dispatch(setShowExecutionPanel(true))
  }

  // Auto-save logic
  const debouncedNodes = useDebounce(nodes, 3000)
  const debouncedEdges = useDebounce(edges, 3000)
  const debouncedViewport = useDebounce(savedViewport, 3000)

  // Track if initial load is done to avoid saving on mount
  const [isLoaded, setIsLoaded] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)

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

  // Clear any previous workflow state when component mounts
  useEffect(() => {
    if (id) {
      dispatch(clearSelectedWorkflow())
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
    <div className='relative h-screen w-screen overflow-hidden bg-gray-50'>
      <ToastContainer />
      {/* Full canvas workflow builder */}
      <ReactFlowProvider key={id}>
        <WorkflowBuilder key={id} workflowId={id} disableEditing={isRunning} />
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
          {/* Auto-save Status Indicator - leftmost to avoid jitter */}
          <div className='flex min-w-[90px] items-center gap-2 border-r border-border pr-3'>
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
            {savingStatus === SavingStatus.Idle && (
              <div className='text-xs text-muted-foreground'>Auto-save on</div>
            )}
          </div>

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
                    disabled={!canUndo || isRunning}
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
                    disabled={!canRedo || isRunning}
                    className='h-8 w-8'
                  >
                    <Redo2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Cmd/Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Manual Mode Toggle */}
          <div className='flex items-center gap-2 border-r border-border pr-3'>
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
              Manual
            </Label>
          </div>

          {/* Partial Run Status */}
          {manualModeEnabled && currentPartialRunId && (
            <div className='flex items-center gap-2 border-r border-border pr-3'>
              <Badge variant='secondary' className='text-xs'>
                {executedStepsCount}/{stepNodes.length} steps
              </Badge>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => dispatch(resetPartialRun())}
                className='h-6 px-2 text-xs'
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
                  variant='ghost'
                  size='icon'
                  onClick={handleCopyWorkflow}
                  disabled={isRunning || nodes.length === 0}
                  className='h-8 w-8'
                  aria-label='Copy workflow configuration'
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy workflow to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size='sm'
                    onClick={handleSave}
                    className='normal-case'
                    disabled={isRunning || !hasAtLeastOneStep}
                  >
                    Save
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

          {/* Output Display Mode Toggle */}
          {id && (
            <div className='flex items-center gap-2 border-r border-border pr-3'>
              <Switch
                id='output-mode'
                checked={outputDisplayMode === OutputDisplayMode.Nodes}
                onCheckedChange={handleOutputDisplayModeToggle}
              />
              <Label
                htmlFor='output-mode'
                className='cursor-pointer text-xs font-medium'
              >
                Node Output
              </Label>
            </div>
          )}

          {/* Peek Execution Button - shows latest run or current execution */}
          {id && canViewExecutionPanel && (
            <TooltipProvider>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleViewExecution}
                    className='h-8 w-8'
                    aria-label={
                      isRunning ? 'View execution' : 'View latest execution'
                    }
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRunning ? 'View execution' : 'View latest run'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {id && manualModeEnabled && (
            <TooltipProvider>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleRunNextStep}
                      disabled={isRunning || !nextStepNodeId}
                      className='gap-1.5 normal-case'
                    >
                      <SkipForward className='h-3.5 w-3.5' />
                      Run Next Step
                    </Button>
                  </span>
                </TooltipTrigger>
                {!nextStepNodeId && !isRunning && (
                  <TooltipContent>
                    <p>All steps have been executed</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {id && !manualModeEnabled && (
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setBatchDialogOpen(true)}
                disabled={isRunning}
                className='normal-case'
              >
                Run Batch
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={handleRunWorkflow}
                disabled={isRunning || manualModeEnabled}
                className='normal-case'
              >
                Run All
              </Button>
            </div>
          )}
        </div>
      </div>

      <BatchFileSelectDialog
        isOpen={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        onConfirm={handleBatchRun}
        isRunning={isRunning}
      />
      <BatchProgressPanel />
    </div>
  )
}

export default WorkflowEditPage
