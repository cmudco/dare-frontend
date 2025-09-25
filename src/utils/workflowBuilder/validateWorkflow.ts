import { type Node, type Edge } from '@xyflow/react'
import { type NodeErrors } from '@/redux/types/workflowBuilder'
import type { StepNodeData } from '@/pages/Workflows/_builder/nodes/StepNode'
import type { AggregatorNodeData } from '@/pages/Workflows/_builder/nodes/AggregatorNode'

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

  // Validate aggregator nodes
  const aggregatorNodes = nodes.filter((n) => n.type === 'aggregator')
  aggregatorNodes.forEach((aggregatorNode) => {
    const data = (aggregatorNode.data as Partial<AggregatorNodeData>) || {}
    const customPrompt = data?.customPrompt?.trim() || ''

    if (!customPrompt) {
      appendFieldError(
        aggregatorNode.id,
        'customPrompt',
        'Custom evaluation prompt is required'
      )
      pushErrorMessage(`Aggregator requires a custom evaluation prompt`)
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

        // If aggregator nodes exist, allow step to connect to aggregator instead of start
        const hasAggregatorConnection =
          aggregatorNodes.length > 0 &&
          aggregatorNodes.some((aggregator) =>
            hasConnection(aggregator.id, step.id)
          )

        if (!hasStartConnection && !hasAggregatorConnection) {
          const label = getStepLabel(step)
          const connectionRequirement =
            aggregatorNodes.length > 0
              ? 'must connect to either the Start node or an Aggregator node'
              : 'must connect directly to the Start node'

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

    // Validate aggregator connections
    if (aggregatorNodes.length > 0) {
      aggregatorNodes.forEach((aggregatorNode) => {
        const incomingEdges = edges.filter(
          (edge) => edge.target === aggregatorNode.id
        )
        const connectedOutputs = incomingEdges
          .map((edge) => nodes.find((n) => n.id === edge.source))
          .filter((node) => node?.type === 'chatOutput')

        if (mode === 'sequential') {
          // Sequential: last step's output must connect to aggregator
          if (sortedSteps.length > 0) {
            const lastStep = sortedSteps[sortedSteps.length - 1]
            const lastStepNumber = getStepNumber(lastStep)
            const lastStepOutputs =
              lastStepNumber != null
                ? (outputsByStep.get(lastStepNumber) ?? [])
                : []

            const hasLastStepConnection = lastStepOutputs.some((output) =>
              connectedOutputs.some(
                (connectedOutput) => connectedOutput?.id === output.id
              )
            )

            if (!hasLastStepConnection && lastStepOutputs.length > 0) {
              appendFieldError(
                aggregatorNode.id,
                'connections',
                "Aggregator must connect from the last step's output in sequential mode"
              )
              pushErrorMessage(
                "Aggregator must connect from the last step's output in sequential mode"
              )
            }

            // Sequential: ensure ONLY the last step's output connects to aggregator
            const invalidConnections = connectedOutputs.filter(
              (connectedOutput) => {
                const isFromLastStep = lastStepOutputs.some(
                  (lastOutput) => lastOutput.id === connectedOutput?.id
                )
                return !isFromLastStep
              }
            )

            if (invalidConnections.length > 0) {
              appendFieldError(
                aggregatorNode.id,
                'connections',
                "Aggregator can only connect from the last step's output in sequential mode"
              )
              pushErrorMessage(
                "Aggregator can only connect from the last step's output in sequential mode"
              )
            }
          }
        } else {
          // Parallel: at least one step output must connect to aggregator
          if (connectedOutputs.length === 0) {
            appendFieldError(
              aggregatorNode.id,
              'connections',
              'Aggregator must connect from at least one step output in parallel mode'
            )
            pushErrorMessage(
              'Aggregator must connect from at least one step output in parallel mode'
            )
          }
        }

        // Validate aggregator output connections based on scoring mode
        const outgoingEdges = edges.filter(
          (edge) => edge.source === aggregatorNode.id
        )
        const connectedSteps = outgoingEdges
          .map((edge) => nodes.find((n) => n.id === edge.target))
          .filter((node) => node?.type === 'step')

        const aggregatorData =
          (aggregatorNode.data as Partial<AggregatorNodeData>) || {}
        const scoringMode = aggregatorData.scoringMode || 'quantitative'

        const expectedConnections = scoringMode === 'qualitative' ? 2 : 3
        const scoringModeLabel =
          scoringMode === 'qualitative'
            ? 'qualitative (true/false)'
            : 'quantitative (bad/average/good)'

        if (connectedSteps.length !== expectedConnections) {
          const message = `Aggregator with ${scoringModeLabel} scoring mode must connect to exactly ${expectedConnections} step nodes`
          appendFieldError(aggregatorNode.id, 'connections', message)
          pushErrorMessage(message)
        }
      })
    }
  }

  return {
    isValid: Object.keys(nodeErrors).length === 0 && errorMessages.length === 0,
    nodeErrors,
    errorMessages,
  }
}
