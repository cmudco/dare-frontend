import { type Node, type Edge } from '@xyflow/react'
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

const getNumberWithDefault = (value: unknown, defaultValue: number): number => {
  const coerced = toNumberOrNull(value)
  return coerced ?? defaultValue
}

export interface ValidationResult {
  isValid: boolean
  nodeErrors: Record<string, NodeErrors>
  errorMessages: string[]
}

export const validateWorkflow = (
  nodes: Node[],
  edges: Edge[]
): ValidationResult => {
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

  const nodeErrors: Record<string, NodeErrors> = {}
  const errorMessages: string[] = []

  type NodeErrorField = keyof NodeErrors | 'connections'

  const pushErrorMessage = (message: string) => {
    if (!errorMessages.includes(message)) {
      errorMessages.push(message)
    }
  }

  const appendFieldError = (
    nodeId: string,
    field: NodeErrorField,
    message: string
  ) => {
    const existingNodeErrors = nodeErrors[nodeId] || {}
    const existingMessage = existingNodeErrors[field]
    nodeErrors[nodeId] = {
      ...existingNodeErrors,
      [field]: existingMessage ? `${existingMessage} ${message}` : message,
    }
  }

  // Validate start node
  if (!start) {
    pushErrorMessage('Start node is required')
  } else {
    if (!title) {
      const sid = start?.id || '0'
      appendFieldError(sid, 'title', 'Title is required')
      pushErrorMessage('Workflow title is required')
    }
    if (!description) {
      const sid = start?.id || '0'
      appendFieldError(sid, 'description', 'Description is required')
    }
  }

  // Validate step nodes
  const stepNodesRaw = nodes.filter((n) => n.type === 'step')
  if (stepNodesRaw.length === 0) {
    pushErrorMessage('At least one step is required')
  }

  stepNodesRaw.forEach((sn, idx) => {
    const d = (sn.data as Partial<StepNodeData>) || {}
    if (!d?.prompt) {
      appendFieldError(sn.id, 'prompt', 'Please select a prompt')
      pushErrorMessage(`Step ${idx + 1} requires a prompt`)
    }
    if (!d?.llm) {
      appendFieldError(sn.id, 'llm', 'Please select an LLM')
      pushErrorMessage(`Step ${idx + 1} requires an LLM selection`)
    }
  })

  const getStepNumber = (node: Node | undefined): number | null => {
    if (!node) return null
    const data = node.data as { stepNumber?: number }
    if (typeof data?.stepNumber === 'number') return data.stepNumber
    const parsed = Number.parseInt(node.id, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  const getStepLabel = (node: Node): string => {
    const stepNumber = getStepNumber(node)
    return stepNumber != null ? `Step ${stepNumber}` : `Step ${node.id}`
  }

  const outputsByStep = new Map<number, Node[]>()
  nodes
    .filter((node) => node.type === 'chatOutput')
    .forEach((output) => {
      const stepNumber = getStepNumber(output)
      if (stepNumber != null) {
        const list = outputsByStep.get(stepNumber) ?? []
        list.push(output)
        outputsByStep.set(stepNumber, list)
      }
    })

  const edgesBySource = edges.reduce<Record<string, string[]>>((acc, edge) => {
    if (!acc[edge.source]) acc[edge.source] = []
    acc[edge.source].push(edge.target)
    return acc
  }, {})

  const hasConnection = (source: string, target: string): boolean =>
    Boolean(edgesBySource[source]?.includes(target))

  // Ensure each step is wired to its output node
  stepNodesRaw.forEach((step) => {
    const stepNumber = getStepNumber(step)
    if (stepNumber == null) return
    const stepLabel = getStepLabel(step)
    const outputsForStep = outputsByStep.get(stepNumber) ?? []
    if (!outputsForStep.length) {
      appendFieldError(
        step.id,
        'connections',
        `${stepLabel} must have an output node.`
      )
      pushErrorMessage(`${stepLabel} must have an output node.`)
      return
    }

    const hasOutputEdge = outputsForStep.some((output) =>
      hasConnection(step.id, output.id)
    )

    if (!hasOutputEdge) {
      appendFieldError(
        step.id,
        'connections',
        `${stepLabel} must connect to its output node.`
      )
      pushErrorMessage(`${stepLabel} must connect to its output node.`)
    }
  })

  if (!start) {
    stepNodesRaw.forEach((step) => {
      appendFieldError(
        step.id,
        'connections',
        'Connect this step to a Start node.'
      )
    })
  } else {
    const mode: 'sequential' | 'parallel' =
      startData?.mode === 'parallel' ? 'parallel' : 'sequential'

    const sortedSteps = [...stepNodesRaw].sort((a, b) => {
      const aStepNum = getStepNumber(a) ?? Number.POSITIVE_INFINITY
      const bStepNum = getStepNumber(b) ?? Number.POSITIVE_INFINITY
      return aStepNum - bStepNum
    })

    if (mode === 'parallel') {
      sortedSteps.forEach((step) => {
        if (!hasConnection(start.id, step.id)) {
          const label = getStepLabel(step)
          appendFieldError(
            step.id,
            'connections',
            `${label} must connect directly to the Start node.`
          )
          pushErrorMessage(
            `${label} must connect directly to the Start node in parallel mode.`
          )
        }
      })
    } else if (sortedSteps.length > 0) {
      const firstStep = sortedSteps[0]
      if (!hasConnection(start.id, firstStep.id)) {
        appendFieldError(
          firstStep.id,
          'connections',
          `${getStepLabel(firstStep)} must connect to the Start node.`
        )
        appendFieldError(
          start.id,
          'connections',
          'Start node must connect to the first step.'
        )
        pushErrorMessage(
          'Sequential workflows require the Start node to connect to the first step.'
        )
      }

      for (let i = 1; i < sortedSteps.length; i++) {
        const step = sortedSteps[i]
        const prevStep = sortedSteps[i - 1]
        const prevStepNumber = getStepNumber(prevStep)
        const prevOutputs =
          prevStepNumber != null
            ? (outputsByStep.get(prevStepNumber) ?? [])
            : []

        if (prevOutputs.length === 0) continue

        const hasPrevLink = prevOutputs.some((output) =>
          hasConnection(output.id, step.id)
        )

        if (!hasPrevLink) {
          appendFieldError(
            step.id,
            'connections',
            `${getStepLabel(step)} must connect from the previous step's output.`
          )
          pushErrorMessage(
            'Sequential workflows require each step to connect from the previous output.'
          )
        }
      }
    }

    const reachable = new Set<string>()
    const stack = [start.id]
    while (stack.length) {
      const current = stack.pop()!
      if (reachable.has(current)) continue
      reachable.add(current)
      ;(edgesBySource[current] || []).forEach((targetId) =>
        stack.push(targetId)
      )
    }

    sortedSteps.forEach((step) => {
      if (!reachable.has(step.id)) {
        const message = `${getStepLabel(step)} must connect to the Start node.`
        appendFieldError(step.id, 'connections', message)
        pushErrorMessage(message)
      }
    })
  }

  return {
    isValid: Object.keys(nodeErrors).length === 0 && errorMessages.length === 0,
    nodeErrors,
    errorMessages,
  }
}

export interface SerializedWorkflow {
  title: string
  description: string
  mode: number
  layout?: Record<string, { x: number; y: number }>
  viewport?: { x: number; y: number; zoom: number } | null
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
      // Sort by step number (which corresponds to ReactFlow ID: "1", "2", "3")
      const aStepNum =
        (a.data as { stepNumber?: number })?.stepNumber || parseInt(a.id) || 999
      const bStepNum =
        (b.data as { stepNumber?: number })?.stepNumber || parseInt(b.id) || 999
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
        prompt: normalizeIdValue(nodeData?.prompt),
        files: toNumericArray(nodeData?.contentFiles),
        embeddings: toNumericArray(nodeData?.embeddingFiles),
        llm: toNumberOrNull(nodeData?.llm),
        maxTokens: getNumberWithDefault(nodeData?.maxTokens, 2048),
        temperature: getNumberWithDefault(nodeData?.temperature, 0.7),
        maxContextSnippets: getNumberWithDefault(
          nodeData?.maxContextSnippets,
          4
        ),
        documentSimilarityThreshold: getNumberWithDefault(
          nodeData?.documentSimilarityThreshold,
          0.2
        ),
        usePreviousStepFiles: Boolean(nodeData?.usePreviousStepFiles),
        usePreviousStepEmbeddings: Boolean(nodeData?.usePreviousStepEmbeddings),
      }

      // Include API ID if this is an existing step (for updates)
      if (nodeData?.apiId) {
        stepData.id = nodeData.apiId.toString()
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
