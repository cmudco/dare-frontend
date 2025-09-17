import { type Node } from '@xyflow/react'
import { type NodeErrors } from '@/redux/types/workflowBuilder'
import type { StepNodeData } from '@/pages/Workflows/_builder/nodes/StepNode'

const normalizeIdValue = (value: unknown): string | null => {
  if (value == null || value === '') return null
  if (typeof value === 'object') {
    const maybeId =
      (value as { id?: unknown; value?: unknown }).id ??
      (value as { value?: unknown }).value
    if (maybeId == null || maybeId === '') return null
    return String(maybeId)
  }
  return String(value)
}

const toNumberOrNull = (value: unknown): number | null => {
  const normalized = normalizeIdValue(value)
  if (normalized == null) return null
  const asNumber = Number(normalized)
  return Number.isNaN(asNumber) ? null : asNumber
}

const toNumericArray = (values: unknown[] | undefined): number[] => {
  if (!Array.isArray(values)) return []
  return values
    .map((value) => toNumberOrNull(value))
    .filter((value): value is number => value != null)
}

export interface ValidationResult {
  isValid: boolean
  nodeErrors: Record<string, NodeErrors>
  errorMessages: string[]
}

export const validateWorkflow = (nodes: Node[]): ValidationResult => {
  const start = nodes.find((n) => n.type === 'start')
  const startData = start?.data as
    | {
        title?: string
        description?: string
      }
    | undefined
  const title = (startData?.title || '').trim()
  const description = (startData?.description || '').trim()

  const nodeErrors: Record<string, NodeErrors> = {}
  const errorMessages: string[] = []

  // Validate start node
  if (!start) {
    errorMessages.push('Start node is required')
  } else {
    if (!title) {
      const sid = start?.id || '1'
      nodeErrors[sid] = {
        ...(nodeErrors[sid] || {}),
        title: 'Title is required',
      }
      errorMessages.push('Workflow title is required')
    }
    if (!description) {
      const sid = start?.id || '1'
      nodeErrors[sid] = {
        ...(nodeErrors[sid] || {}),
        description: 'Description is required',
      }
    }
  }

  // Validate step nodes
  const stepNodesRaw = nodes.filter((n) => n.type === 'step')
  if (stepNodesRaw.length === 0) {
    errorMessages.push('At least one step is required')
  }

  stepNodesRaw.forEach((sn, idx) => {
    const d = (sn.data as Partial<StepNodeData>) || {}
    if (!d?.prompt) {
      nodeErrors[sn.id] = {
        ...(nodeErrors[sn.id] || {}),
        prompt: 'Please select a prompt',
      }
      errorMessages.push(`Step ${idx + 1} requires a prompt`)
    }
    if (!d?.llm) {
      nodeErrors[sn.id] = {
        ...(nodeErrors[sn.id] || {}),
        llm: 'Please select an LLM',
      }
      errorMessages.push(`Step ${idx + 1} requires an LLM selection`)
    }
  })

  return {
    isValid: Object.keys(nodeErrors).length === 0 && errorMessages.length === 0,
    nodeErrors,
    errorMessages
  }
}

export interface SerializedWorkflow {
  title: string
  description: string
  mode: number
  layout?: Record<string, { x: number; y: number }>
  steps: {
    id?: string
    order: number
    prompt: string | null
    files?: number[]
    embeddings?: number[]
    llm?: number | null
    maxTokens?: number | null
    temperature?: number | null
    maxContextSnippets?: number | null
    documentSimilarityThreshold?: number | null
    usePreviousStepFiles?: boolean
    usePreviousStepEmbeddings?: boolean
  }[]
}

export const serializeWorkflow = (nodes: Node[], edges: any[]): SerializedWorkflow | null => {
  const start = nodes.find((n) => n.type === 'start')
  const startData = start?.data as
    | {
        title?: string
        description?: string
        mode?: 'sequential' | 'parallel'
      }
    | undefined

  const title = (startData?.title || '').trim()
  const description = (startData?.description || '').trim()
  const mode = startData?.mode === 'parallel' ? 2 : 1 // WorkflowMode.Parallel : WorkflowMode.Serial

  if (!title) return null

  // Build step sequence following edges from start
  const edgesBySource = edges.reduce<Record<string, string[]>>((acc, e) => {
    if (!acc[e.source]) acc[e.source] = []
    acc[e.source].push(e.target)
    return acc
  }, {})

  const visited = new Set<string>()
  const sequence: string[] = []

  const traverse = (nodeId: string) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    const node = nodes.find((n) => n.id === nodeId)
    if (node?.type === 'step') {
      sequence.push(nodeId)
    }
    edgesBySource[nodeId]?.forEach(traverse)
  }

  if (start) traverse(start.id)

  // Build step nodes with proper order and required fields
  const stepNodes = nodes
    .filter((n) => n.type === 'step')
    .sort((a, b) => {
      const aIdx = sequence.indexOf(a.id)
      const bIdx = sequence.indexOf(b.id)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })
    .map((n, idx) => {
      const nodeData = n.data as Partial<StepNodeData> & {
        usePreviousStepFiles?: boolean
        usePreviousStepEmbeddings?: boolean
        id?: string
      }

      const stepData: SerializedWorkflow['steps'][0] = {
        order: idx + 1,
        prompt: normalizeIdValue(nodeData?.prompt),
        files: toNumericArray(nodeData?.contentFiles),
        embeddings: toNumericArray(nodeData?.embeddingFiles),
        llm: toNumberOrNull(nodeData?.llm),
        maxTokens: nodeData?.maxTokens ?? null,
        temperature: nodeData?.temperature ?? null,
        maxContextSnippets: nodeData?.maxContextSnippets ?? null,
        documentSimilarityThreshold:
          nodeData?.documentSimilarityThreshold ?? null,
        usePreviousStepFiles: Boolean(nodeData?.usePreviousStepFiles),
        usePreviousStepEmbeddings: Boolean(
          nodeData?.usePreviousStepEmbeddings
        ),
      }

      // Include step ID if this is an existing step (for updates)
      if (nodeData?.id) {
        stepData.id = nodeData.id
      }

      return stepData
    })

  return {
    title,
    description,
    mode,
    steps: stepNodes,
  }
}