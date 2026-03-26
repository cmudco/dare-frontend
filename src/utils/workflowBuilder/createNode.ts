import { type Node, type Edge } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { WorkflowNodeType } from '@/utils/constants/workflows'

interface NodeCreationResult {
  nodes: Node[]
  edges: Edge[]
  shouldShowToast?: { type: 'error' | 'info'; message: string }
}

export const createNode = (
  type: string,
  position: { x: number; y: number },
  nodes: Node[],
  edges: Edge[]
): NodeCreationResult => {
  const hasStart = nodes.some((n) => n.type === WorkflowNodeType.Start)

  if (
    !hasStart &&
    type !== WorkflowNodeType.Start &&
    type !== WorkflowNodeType.Notes
  ) {
    return {
      nodes,
      edges,
      shouldShowToast: { type: 'error', message: 'Add a Start node first.' },
    }
  }

  if (type === WorkflowNodeType.Step) {
    // Auto-create step + output node pair
    const stepCount =
      nodes.filter((n) => n.type === WorkflowNodeType.Step).length + 1
    const stepId = nanoid() // UUID for React Flow (guaranteed unique)
    const outputId = nanoid() // UUID for output node (guaranteed unique)

    const stepNode: Node = {
      id: stepId,
      type: 'step',
      position,
      data: {
        label: `Step ${stepCount}`,
        apiId: null, // Will be set after save
      },
    }

    const outputNode: Node = {
      id: outputId,
      type: 'chatOutput',
      position: { x: position.x + 400, y: position.y }, // Keep same Y as step for now
      data: {
        label: `Step ${stepCount} Output`,
      },
    }

    // Create edge connecting step to output
    const stepToOutputEdge: Edge = {
      id: `e-${stepId}-${outputId}`,
      source: stepId,
      target: outputId,
      type: 'smoothstep',
    }

    const nextNodes = [...nodes, stepNode, outputNode]
    const nextEdges = [...edges, stepToOutputEdge]

    return { nodes: nextNodes, edges: nextEdges }
  } else if (type === WorkflowNodeType.StructuredOutput) {
    const structuredOutputId = nanoid() // UUID for React Flow (guaranteed unique)

    const stepCount = nodes.filter(
      (n) => n.type === WorkflowNodeType.Step
    ).length
    const existingStructuredOutputCount = nodes.filter(
      (n) => n.type === WorkflowNodeType.StructuredOutput
    ).length
    const structuredOutputLabel = stepCount + existingStructuredOutputCount + 1

    const structuredOutputNode: Node = {
      id: structuredOutputId,
      type: 'structuredOutput',
      position,
      data: {
        label: `Router ${structuredOutputLabel}`,
        routes: [
          { name: '1', description: 'First route' },
          { name: '2', description: 'Second route' },
        ],
      },
    }

    return { nodes: [...nodes, structuredOutputNode], edges }
  } else if (type === WorkflowNodeType.File) {
    const fileCount =
      nodes.filter((n) => n.type === WorkflowNodeType.File).length + 1
    const fileNodeId = nanoid()

    const fileNode: Node = {
      id: fileNodeId,
      type: 'file',
      position,
      data: {
        label: `File ${fileCount}`,
        files: [],
        retrievalMode: 'embeddings',
        similarityThreshold: 0.5,
        maxResults: 10,
        querySource: 'previous_step',
        textInput: '',
        includeMetadata: true,
      },
    }

    return { nodes: [...nodes, fileNode], edges }
  } else if (type === WorkflowNodeType.Notes) {
    const notesId = nanoid()

    const notesNode: Node = {
      id: notesId,
      type: 'notes',
      position,
      data: {
        content: '',
      },
      connectable: false,
      deletable: true,
    }

    return { nodes: [...nodes, notesNode], edges }
  } else {
    // Handle start node and other node types with UUID
    const nodeId = nanoid() // UUID for React Flow (guaranteed unique)

    const newNode: Node = {
      id: nodeId,
      type,
      position,
      data:
        type === WorkflowNodeType.Start
          ? {
              title: '',
              description: '',
              mode: 'sequential',
              spareHandle: true,
            }
          : { label: type },
    }

    return { nodes: [...nodes, newNode], edges }
  }
}
