import { createAsyncThunk } from '@reduxjs/toolkit'
import { getWorkflowById, createOrUpdateWorkflow } from './workflow'
import { type Node, type Edge } from '@xyflow/react'
import type { Workflow, WorkflowRun } from '../types/workflow'
import { serializeWorkflow } from '@/utils/workflowBuilder/serializeWorkflow'
import { workflowSocketExecuteSingleStep } from '../middleware/workflowSocketMiddleware'
import { setShowExecutionPanel, setSavingStatus } from '../workflowBuilderSlice'
import { SavingStatus } from '../types/workflowBuilder'
import type { RootState, AppDispatch } from '../store'

type LoadWorkflowResult = {
  nodes: Node[]
  edges: Edge[]
  workflow: Workflow
  currentRun: WorkflowRun | null
  viewport: { x: number; y: number; zoom: number } | null
}

export const loadWorkflowIntoBuilder = createAsyncThunk<
  LoadWorkflowResult,
  number
>('workflowBuilder/loadWorkflow', async (workflowId, { dispatch }) => {
  // Fetch the workflow
  const result = await dispatch(getWorkflowById(workflowId))
  const workflow = result.payload as Workflow

  if (!workflow) {
    throw new Error('Workflow not found')
  }

  return {
    nodes: workflow.nodes || [],
    edges: workflow.edges || [],
    workflow,
    currentRun: workflow.latestRun || null,
    viewport: workflow.viewport ?? null,
  }
})

/**
 * Save workflow and then execute a single step.
 *
 * This ensures manual mode always uses the latest prompt/config before executing,
 * fixing the bug where fast config changes weren't saved before execution.
 */
export const saveAndExecuteStep = createAsyncThunk<
  void,
  { workflowId: number; stepNodeId: string; workflowRunId?: number },
  { state: RootState; dispatch: AppDispatch }
>(
  'workflowBuilder/saveAndExecuteStep',
  async ({ workflowId, stepNodeId, workflowRunId }, { dispatch, getState }) => {
    const state = getState()
    const { nodes, edges, savedViewport, outputDisplayMode } =
      state.workflowBuilder

    // 1. Save the workflow first
    dispatch(setSavingStatus(SavingStatus.Saving))
    const serializedWorkflow = serializeWorkflow(
      nodes,
      edges,
      savedViewport,
      outputDisplayMode
    )

    if (serializedWorkflow) {
      try {
        await dispatch(
          createOrUpdateWorkflow({
            id: workflowId,
            workflowData: serializedWorkflow,
          })
        ).unwrap()
        dispatch(setSavingStatus(SavingStatus.Saved))
        setTimeout(() => dispatch(setSavingStatus(SavingStatus.Idle)), 3000)
      } catch (error) {
        console.error('Save failed before step execution:', error)
        dispatch(setSavingStatus(SavingStatus.Error))
        throw error // Don't proceed with execution if save fails
      }
    }

    // 2. Open execution panel and execute the step
    dispatch(setShowExecutionPanel(true))
    dispatch(
      workflowSocketExecuteSingleStep({
        workflowId,
        stepNodeId,
        workflowRunId,
      })
    )
  }
)
