import { createAsyncThunk } from '@reduxjs/toolkit'
import { getWorkflowById } from './workflow'
import { type Node, type Edge } from '@xyflow/react'
import type {
  Workflow,
  Step as ApiStep,
  WorkflowRun,
  WorkflowRunStep,
} from '../types/workflow'
import type { MyFile } from '../types/files'

const toIdString = (value: unknown): string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'object') {
    const maybeId = (value as { id?: unknown }).id
    if (maybeId != null) return String(maybeId)
  }
  return String(value)
}

type LoadWorkflowResult = {
  nodes: Node[]
  edges: Edge[]
  workflow: Workflow
  currentRun: WorkflowRun | null
  viewport: { x: number; y: number; zoom: number } | null
}

export const loadWorkflowIntoBuilder = createAsyncThunk<
  LoadWorkflowResult,
  string
>('workflowBuilder/loadWorkflow', async (workflowId, { dispatch }) => {
  // Fetch the workflow
  const result = await dispatch(getWorkflowById(workflowId))
  const workflow = result.payload as Workflow

  if (!workflow) {
    throw new Error('Workflow not found')
  }

  const workflowSteps = (workflow?.steps || []) as ApiStep[]
  const savedLayout = workflow.layout ?? {}
  const getPosition = (nodeId: string, fallback: { x: number; y: number }) => {
    const saved = savedLayout[nodeId]
    if (saved) {
      return { x: saved.x, y: saved.y }
    }
    return { x: fallback.x, y: fallback.y }
  }

  // Create start node with ID "0"
  const startNode: Node = {
    id: '0',
    type: 'start',
    position: getPosition('0', { x: 100, y: 100 }),
    data: {
      title: workflow?.title || '',
      description: workflow?.description || '',
      mode: workflow?.mode === 2 ? 'parallel' : 'sequential',
      spareHandle: true,
    },
  }

  // Create step nodes with IDs "1", "2", "3"
  const stepNodes: Node[] = workflowSteps.map((step: ApiStep, idx: number) => {
    const stepData = {
      stepNumber: step.order || idx + 1,
      apiId: step.id, // Store API ID
      prompt: toIdString(step.prompt) || '',
      contentFiles: (step.files || []).map((f: MyFile | string | number) =>
        String(((f as MyFile)?.id ?? f) as string | number)
      ),
      embeddingFiles: (step.embeddings || []).map(
        (e: MyFile | string | number) =>
          String(((e as MyFile)?.id ?? e) as string | number)
      ),
      llm: toIdString(step.llm) || '',
      maxTokens: typeof step.maxTokens === 'number' ? step.maxTokens : 2048,
      temperature:
        typeof step.temperature === 'number' ? step.temperature : 0.7,
      maxContextSnippets:
        typeof step.maxContextSnippets === 'number'
          ? step.maxContextSnippets
          : 4,
      documentSimilarityThreshold:
        typeof step.documentSimilarityThreshold === 'number'
          ? step.documentSimilarityThreshold
          : 0.2,
      usePreviousStepFiles: Boolean(step.usePreviousStepFiles),
      usePreviousStepEmbeddings: Boolean(step.usePreviousStepEmbeddings),
    }

    const nodeId = (idx + 1).toString()
    return {
      id: nodeId, // "1", "2", "3"
      type: 'step',
      position: getPosition(nodeId, { x: 300 + idx * 400, y: 100 }),
      data: stepData,
    }
  })

  // Create output nodes with IDs "1o", "2o", "3o"
  let outputNodes: Node[] = workflowSteps.map((step: ApiStep, idx: number) => {
    const outputId = `${idx + 1}o`
    return {
      id: outputId, // "1o", "2o", "3o"
      type: 'chatOutput',
      position: getPosition(outputId, { x: 300 + idx * 400, y: 300 }),
      data: {
        label: `Step ${step.order || idx + 1} Output`,
        stepNumber: step.order || idx + 1,
      },
    }
  })

  // If workflow has a latest run, populate output nodes with responses
  const latestRun: WorkflowRun | null | undefined = workflow.latestRun
  const runSteps: WorkflowRunStep[] | undefined = latestRun?.steps
  if (Array.isArray(runSteps) && runSteps.length) {
    const findRunForStep = (stepNumber: number) =>
      runSteps.find((rs) => (rs.order || rs.step) === stepNumber)

    outputNodes = outputNodes.map((outNode, idx) => {
      const stepNumber = stepNodes[idx]?.data?.stepNumber
      if (!stepNumber) return outNode

      const runStep = findRunForStep(stepNumber)
      if (!runStep) return outNode

      return {
        ...outNode,
        data: {
          ...outNode.data,
          response: runStep.response,
          status: runStep.status,
        },
      }
    })
  }

  // Create edges: Start -> Steps, Steps -> Outputs
  const startToStepEdges: Edge[] = (() => {
    const isParallel = workflow?.mode === 2
    if (isParallel) {
      return stepNodes.map((step, idx) => ({
        id: `e-start-${step.id}`,
        source: '0', // Start node is always "0"
        target: step.id,
        type: 'smoothstep',
        sourceHandle: `output-${idx + 1}`,
      }))
    }

    // Sequential: only connect to the first step
    if (stepNodes.length === 0) return []
    const first = stepNodes[0]
    return [
      {
        id: `e-start-${first.id}`,
        source: '0', // Start node is always "0"
        target: first.id,
        type: 'smoothstep',
        sourceHandle: null,
      },
    ]
  })()

  const stepToOutputEdges: Edge[] = stepNodes.map((step, idx) => ({
    id: `e-${step.id}-${outputNodes[idx].id}`,
    source: step.id,
    target: outputNodes[idx].id,
    type: 'smoothstep',
  }))

  // Sequential mode: connect outputs to next steps
  const outputToStepEdges: Edge[] = []
  if (workflow?.mode !== 2 && stepNodes.length > 1) {
    for (let i = 0; i < stepNodes.length - 1; i++) {
      outputToStepEdges.push({
        id: `e-${outputNodes[i].id}-${stepNodes[i + 1].id}`,
        source: outputNodes[i].id,
        target: stepNodes[i + 1].id,
        type: 'smoothstep',
      })
    }
  }

  const allNodes = [startNode, ...stepNodes, ...outputNodes]
  const allEdges = [
    ...startToStepEdges,
    ...stepToOutputEdges,
    ...outputToStepEdges,
  ]

  return {
    nodes: allNodes,
    edges: allEdges,
    workflow,
    currentRun: latestRun || null,
    viewport: workflow.viewport ?? null,
  }
})
