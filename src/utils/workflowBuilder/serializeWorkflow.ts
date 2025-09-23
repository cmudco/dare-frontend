import { type Node, type Edge } from '@xyflow/react'
import type { StepNodeData } from '@/pages/Workflows/_builder/nodes/StepNode'
import { validateWorkflow } from './validateWorkflow'

export interface SerializedWorkflow {
  title: string
  description: string
  mode: number
  layout?: Record<string, { x: number; y: number }>
  viewport?: { x: number; y: number; zoom: number } | null
  steps: {
    id?: number
    order: number
    prompt: number | null
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

export const serializeWorkflow = (
  nodes: Node[],
  edges: Edge[],
  viewport?: { x: number; y: number; zoom: number } | null
): SerializedWorkflow | null => {
  const validation = validateWorkflow(nodes, edges)
  if (!validation.isValid) {
    return null
  }

  const start = nodes.find((n) => n.type === 'start')
  const startData = start?.data as
    | {
        title: string
        description: string
        mode: 'sequential' | 'parallel'
      }
    | undefined

  const title = startData?.title?.trim() || ''
  const description = startData?.description?.trim() || ''
  const mode = startData?.mode === 'parallel' ? 2 : 1

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
      const aStepNum = (a.data as { stepNumber: number }).stepNumber
      const bStepNum = (b.data as { stepNumber: number }).stepNumber
      return aStepNum - bStepNum
    })
    .map((n, idx) => {
      const nodeData = n.data as Partial<StepNodeData> & {
        usePreviousStepFiles?: boolean
        usePreviousStepEmbeddings?: boolean
        apiId?: number
      }

      const stepData: SerializedWorkflow['steps'][0] = {
        order: idx + 1,
        prompt: nodeData?.prompt || null,
        files: nodeData?.contentFiles || [],
        embeddings: nodeData?.embeddingFiles || [],
        llm: nodeData?.llm || null,
        maxTokens: nodeData?.maxTokens || 2048,
        temperature: nodeData?.temperature || 0.7,
        maxContextSnippets: nodeData?.maxContextSnippets || 4,
        documentSimilarityThreshold:
          nodeData?.documentSimilarityThreshold || 0.2,
        usePreviousStepFiles: Boolean(nodeData?.usePreviousStepFiles),
        usePreviousStepEmbeddings: Boolean(nodeData?.usePreviousStepEmbeddings),
      }

      // Include API ID if this is an existing step (for updates)
      if (nodeData?.apiId) {
        stepData.id = nodeData.apiId
      }

      return stepData
    })

  const layout = nodes.reduce<Record<string, { x: number; y: number }>>(
    (acc, node) => {
      const position =
        node.position ??
        (node as { positionAbsolute?: { x: number; y: number } })
          .positionAbsolute
      if (position) {
        acc[node.id] = { x: position.x, y: position.y }
      }
      return acc
    },
    {}
  )

  return {
    title,
    description,
    mode,
    layout: Object.keys(layout).length ? layout : undefined,
    viewport: viewport ?? null,
    steps: stepNodes,
  }
}
