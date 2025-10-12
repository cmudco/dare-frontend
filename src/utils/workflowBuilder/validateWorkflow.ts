import { type Node, type Edge } from '@xyflow/react'
import { type NodeErrors } from '@/redux/types/workflowBuilder'
import type { StepNodeData } from '@/pages/Workflows/_builder/nodes/StepNode'
import type { ConditionalNodeData } from '@/pages/Workflows/_builder/nodes/ConditionalNode'

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
        title: string
        description: string
        mode: 'sequential' | 'parallel'
      }
    | undefined
  const title = startData?.title?.trim() || ''
  const description = startData?.description?.trim() || ''

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
      [field]: existingMessage ? `${existingMessage}\n${message}` : message,
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

  const conditionalNodes = nodes.filter((n) => n.type === 'conditional')
  conditionalNodes.forEach((conditionalNode) => {
    const data = (conditionalNode.data as Partial<ConditionalNodeData>) || {}
    const customPrompt = data?.customPrompt?.trim() || ''
    const routes = data.routes || []
    if (!customPrompt) {
      appendFieldError(
        conditionalNode.id,
        'customPrompt',
        'Custom evaluation prompt is required'
      )
      pushErrorMessage(`Conditional node requires a custom evaluation prompt`)
    }

    if (routes.length < 2) {
      appendFieldError(
        conditionalNode.id,
        'connections',
        'Conditional node requires at least 2 routes'
      )
      pushErrorMessage(`Conditional node requires at least 2 routes`)
    }
    routes.forEach((route, index) => {
      if (!route.name?.trim()) {
        appendFieldError(
          conditionalNode.id,
          'connections',
          `Route ${index + 1} requires a name`
        )
        pushErrorMessage(`Conditional node Route ${index + 1} requires a name`)
      }
    })
    const routeNames = routes.map((r) => r.name?.trim()).filter(Boolean)
    const uniqueRouteNames = new Set(routeNames)
    if (routeNames.length !== uniqueRouteNames.size) {
      appendFieldError(
        conditionalNode.id,
        'connections',
        'All route names must be unique'
      )
      pushErrorMessage(`Conditional node route names must be unique`)
    }
  })

  const getStepNumber = (node: Node | undefined): number | null => {
    if (!node) return null
    return (node.data as { stepNumber: number }).stepNumber
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
    const mode: 'sequential' | 'parallel' = startData?.mode || 'sequential'

    const sortedSteps = [...stepNodesRaw].sort((a, b) => {
      const aStepNum = getStepNumber(a) ?? Number.POSITIVE_INFINITY
      const bStepNum = getStepNumber(b) ?? Number.POSITIVE_INFINITY
      return aStepNum - bStepNum
    })

    if (mode === 'parallel') {
      sortedSteps.forEach((step) => {
        const hasStartConnection = hasConnection(start.id, step.id)

        const hasStepInputConnections = edges.some((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source)
          return (
            edge.target === step.id &&
            (sourceNode?.type === 'step' ||
              sourceNode?.type === 'chatOutput' ||
              sourceNode?.type === 'conditional')
          )
        })

        // Step is valid if it connects to: start or has multi-input connections
        const hasValidConnection = hasStartConnection || hasStepInputConnections

        if (!hasValidConnection) {
          const label = getStepLabel(step)
          const connectionRequirement =
            'must connect to the Start node or receive input from other steps'

          appendFieldError(
            step.id,
            'connections',
            `${label} ${connectionRequirement}.`
          )
          pushErrorMessage(
            `${label} ${connectionRequirement} in parallel mode.`
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

        // Simplified validation - only check for previous step connection
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

    // Validate conditional node connections
    conditionalNodes.forEach((conditionalNode) => {
      const incomingEdges = edges.filter(
        (edge) => edge.target === conditionalNode.id
      )
      const connectedInputs = incomingEdges
        .map((edge) => nodes.find((n) => n.id === edge.source))
        .filter((node) => node?.type === 'chatOutput')

      if (connectedInputs.length === 0) {
        appendFieldError(
          conditionalNode.id,
          'connections',
          'Conditional node must connect from exactly one output node'
        )
        pushErrorMessage(
          'Conditional node must connect from exactly one output node'
        )
      } else if (connectedInputs.length > 1) {
        appendFieldError(
          conditionalNode.id,
          'connections',
          'Conditional node can only connect from one output node'
        )
        pushErrorMessage(
          'Conditional node can only connect from one output node'
        )
      }

      const conditionalData = conditionalNode.data as ConditionalNodeData
      const routes = conditionalData?.routes || []

      if (routes.length === 0) {
        appendFieldError(
          conditionalNode.id,
          'connections',
          'Conditional node must have at least 2 routes defined'
        )
        pushErrorMessage('Conditional node must have at least 2 routes defined')
        return
      }

      // Validate output connections - must have one connection per route
      const outgoingEdges = edges.filter(
        (edge) => edge.source === conditionalNode.id
      )
      const connectedOutputs = outgoingEdges
        .map((edge) => nodes.find((n) => n.id === edge.target))
        .filter((node) => node?.type === 'step')

      // Check that each route has exactly one connection to a step node
      routes.forEach((route) => {
        const routeHandle = `output-${route.name}`
        const routeConnections = outgoingEdges.filter(
          (edge) => edge.sourceHandle === routeHandle
        )

        if (routeConnections.length === 0) {
          appendFieldError(
            conditionalNode.id,
            'connections',
            `Route "${route.name}" must be connected to a step node`
          )
          pushErrorMessage(
            `Conditional node route "${route.name}" must be connected`
          )
        } else if (routeConnections.length > 1) {
          appendFieldError(
            conditionalNode.id,
            'connections',
            `Route "${route.name}" can only connect to one step node`
          )
          pushErrorMessage(
            `Conditional node route "${route.name}" can only have one connection`
          )
        } else {
          // Verify the connection is to a step node
          const targetNode = nodes.find(
            (n) => n.id === routeConnections[0].target
          )
          if (targetNode?.type !== 'step') {
            appendFieldError(
              conditionalNode.id,
              'connections',
              `Route "${route.name}" must connect to a step node (currently connected to ${targetNode?.type || 'unknown'})`
            )
            pushErrorMessage(
              `Conditional node route "${route.name}" must connect to a step node`
            )
          }
        }
      })

      // Validate that all routes are connected
      const expectedConnections = routes.length
      if (connectedOutputs.length < expectedConnections) {
        const missingCount = expectedConnections - connectedOutputs.length
        appendFieldError(
          conditionalNode.id,
          'connections',
          `Conditional node needs ${missingCount} more connection(s). All ${expectedConnections} routes must be connected to step nodes.`
        )
        pushErrorMessage(
          `Conditional node needs all ${expectedConnections} routes connected to step nodes`
        )
      }
    })
  }

  return {
    isValid: Object.keys(nodeErrors).length === 0 && errorMessages.length === 0,
    nodeErrors,
    errorMessages,
  }
}
