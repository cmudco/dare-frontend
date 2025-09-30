import { createAsyncThunk } from '@reduxjs/toolkit'
import { getWorkflowById } from './workflow'
import { type Node, type Edge } from '@xyflow/react'
import type { Workflow, WorkflowRun } from '../types/workflow'

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
