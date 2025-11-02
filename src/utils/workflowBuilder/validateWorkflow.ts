import { type Node, type Edge } from '@xyflow/react'
import { type NodeErrors } from '@/redux/types/workflowBuilder'
import type { StepNodeData } from '@/pages/Workflows/_builder/nodes/StepNode'
import type { ConditionalNodeData } from '@/pages/Workflows/_builder/nodes/ConditionalNode'
import type { StructuredOutputNodeData } from '@/pages/Workflows/_builder/nodes/StructuredOutputNode'
import { ROUTE_HANDLE_PREFIX } from '@/utils/constants/workflowBuilder'

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
    const routes = data.routes || []

    // Validate prompt
    if (!data?.prompt) {
      appendFieldError(conditionalNode.id, 'prompt', 'Please select a prompt')
      pushErrorMessage(`Conditional node requires a prompt`)
    }

    // Validate LLM
    if (!data?.llm) {
      appendFieldError(conditionalNode.id, 'llm', 'Please select an LLM')
      pushErrorMessage(`Conditional node requires an LLM selection`)
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

  // Ensure each step is wired to its output node (skip if using Structured Output)
  stepNodesRaw.forEach((step) => {
    const stepData = (step.data as Partial<StepNodeData>) || {}
    if (stepData.useStructuredOutputNode) {
      return
    }
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
    // Validate that all steps are reachable from start node via edge traversal
    // This replaces mode-specific validation - edges determine execution flow
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

    stepNodesRaw.forEach((step) => {
      if (!reachable.has(step.id)) {
        const message = `${getStepLabel(step)} must be reachable from the Start node.`
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

      // Validate output connections - ensure connections are valid; not all routes must be connected
      const outgoingEdges = edges.filter(
        (edge) => edge.source === conditionalNode.id
      )
      // Note: Collecting of connectedOutputs removed to avoid unused variable; we validate per-route and overall count instead

      // Check that each route has at most one connection to a step node
      routes.forEach((route) => {
        const routeHandle = `${ROUTE_HANDLE_PREFIX}${route.name}`
        const routeConnections = outgoingEdges.filter(
          (edge) => edge.sourceHandle === routeHandle
        )

        if (routeConnections.length > 1) {
          appendFieldError(
            conditionalNode.id,
            'connections',
            `Route "${route.name}" can only connect to one step node`
          )
          pushErrorMessage(
            `Conditional node route "${route.name}" can only have one connection`
          )
        } else if (routeConnections.length === 1) {
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

      // Require at least one route connected overall (so the node leads somewhere)
      const totalRouteConnections = outgoingEdges.filter(
        (e) => e.sourceHandle && e.sourceHandle.startsWith(ROUTE_HANDLE_PREFIX)
      ).length
      if (totalRouteConnections === 0) {
        appendFieldError(
          conditionalNode.id,
          'connections',
          'Conditional node must have at least one route connected to a step node'
        )
        pushErrorMessage(
          'Conditional node must have at least one connected route'
        )
      }
    })

    // Validate Structured Output usage on steps
    const stepsUsingStructured = stepNodesRaw.filter(
      (s) => ((s.data as Partial<StepNodeData>) || {}).useStructuredOutputNode
    )

    stepsUsingStructured.forEach((step) => {
      const stepLabel = getStepLabel(step)
      // Find the structured output node connected to this step
      const incomingFromStructured = edges.filter((e) => {
        if (e.target !== step.id) return false
        const src = nodes.find((n) => n.id === e.source)
        return src?.type === 'structuredOutput'
      })

      if (incomingFromStructured.length === 0) {
        appendFieldError(
          step.id,
          'connections',
          `${stepLabel} is set to use a Structured Output node but none is connected.`
        )
        pushErrorMessage(
          `${stepLabel} requires a Structured Output node connection`
        )
        return
      }
      if (incomingFromStructured.length > 1) {
        appendFieldError(
          step.id,
          'connections',
          `${stepLabel} can only be connected to one Structured Output node.`
        )
        pushErrorMessage(
          `${stepLabel} must connect to exactly one Structured Output node`
        )
        return
      }

      const structuredNode = nodes.find(
        (n) => n.id === incomingFromStructured[0].source
      )
      const structuredData =
        (structuredNode?.data as Partial<StructuredOutputNodeData>) || {}
      const routes = structuredData.routes || []

      // Validate prompt and LLM on Structured Output node
      if (structuredNode && !structuredData.prompt) {
        appendFieldError(structuredNode.id, 'prompt', 'Please select a prompt')
        pushErrorMessage(`Structured Output node requires a prompt`)
      }

      if (structuredNode && !structuredData.llm) {
        appendFieldError(structuredNode.id, 'llm', 'Please select an LLM')
        pushErrorMessage(`Structured Output node requires an LLM selection`)
      }

      // Validate routes
      if (routes.length < 2) {
        appendFieldError(
          step.id,
          'connections',
          `${stepLabel} Structured Output requires at least 2 routes.`
        )
        pushErrorMessage(
          `${stepLabel} Structured Output requires at least 2 routes.`
        )
      }
      const routeNames = routes
        .map((r) => (r.name || '').trim())
        .filter(Boolean)
      const uniqueRouteNames = new Set(routeNames)
      if (routeNames.length !== uniqueRouteNames.size) {
        appendFieldError(
          step.id,
          'connections',
          `${stepLabel} Structured Output route names must be unique.`
        )
        pushErrorMessage(
          `${stepLabel} Structured Output route names must be unique.`
        )
      }

      const outgoing = edges.filter((e) => e.source === step.id)
      // Note: Previous aggregate of connectedStepsFromRoutes removed; per-route and total connections validated below

      routes.forEach((route) => {
        const handle = `${ROUTE_HANDLE_PREFIX}${route.name}`
        const conns = outgoing.filter((e) => e.sourceHandle === handle)
        if (conns.length > 1) {
          appendFieldError(
            step.id,
            'connections',
            `${stepLabel} route "${route.name}" can connect to only one step.`
          )
          pushErrorMessage(
            `${stepLabel} route "${route.name}" can connect to only one step.`
          )
        } else if (conns.length === 1) {
          const tgt = nodes.find((n) => n.id === conns[0].target)
          if (tgt?.type !== 'step') {
            appendFieldError(
              step.id,
              'connections',
              `${stepLabel} route "${route.name}" must connect to a step node.`
            )
            pushErrorMessage(
              `${stepLabel} route "${route.name}" must connect to a step node.`
            )
          }
        }
      })

      // Require at least one route connected overall
      const totalRouteConnections = outgoing.filter(
        (e) => e.sourceHandle && e.sourceHandle.startsWith(ROUTE_HANDLE_PREFIX)
      ).length
      if (totalRouteConnections === 0) {
        appendFieldError(
          step.id,
          'connections',
          `${stepLabel} requires at least one connected route.`
        )
        pushErrorMessage(`${stepLabel} must have at least one connected route.`)
      }
    })
  }

  return {
    isValid: Object.keys(nodeErrors).length === 0 && errorMessages.length === 0,
    nodeErrors,
    errorMessages,
  }
}
