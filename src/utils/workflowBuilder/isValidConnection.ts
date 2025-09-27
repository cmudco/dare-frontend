import { type Node, type Edge, type Connection } from '@xyflow/react'

export type Mode = 'sequential' | 'parallel'

export const getStartNode = (nodes: Node[]): Node | undefined => {
  return nodes.find((n) => n.type === 'start')
}

export const getMode = (startNode?: Node): Mode => {
  if (!startNode) return 'sequential'
  return (startNode.data as { mode: Mode }).mode
}

export const getStepNumber = (node?: Node): number | undefined => {
  if (!node) return undefined
  return (node.data as { stepNumber: number }).stepNumber
}

export const isValidConnection = (
  connection: Edge | Connection,
  nodes: Node[],
  edges: Edge[]
): boolean => {
  const start = getStartNode(nodes)
  const modeValue = getMode(start)
  const sourceNode = nodes.find((n) => n.id === connection.source)
  const targetNode = nodes.find((n) => n.id === connection.target)

  if (!sourceNode || !targetNode) return false

  // Prevent connecting to self
  if (connection.source === connection.target) return false

  const sType = sourceNode.type
  const tType = targetNode.type

  // Handle aggregator connections FIRST (before other constraints)
  if (tType === 'aggregator') {
    const isAllowed = sType === 'chatOutput' || sType === 'step'
    return isAllowed
  }

  if (sType === 'aggregator') {
    return true
  }

  // Handle conditional node connections
  if (tType === 'conditional') {
    // Conditional nodes accept input only from chatOutput nodes (need step output to evaluate)
    const isAllowed = sType === 'chatOutput'
    if (!isAllowed) return false

    // Conditional nodes accept only one input connection
    const existingInputs = edges.filter((e) => e.target === connection.target)
    if (existingInputs.length >= 1) return false

    return true
  }

  if (sType === 'conditional') {
    // Conditional nodes can only connect to step nodes
    return tType === 'step'
  }

  // Allow Start <-> Step regardless of drag direction
  if (
    (sType === 'start' && tType === 'step') ||
    (sType === 'step' && tType === 'start')
  ) {
    if (modeValue === 'sequential') {
      const existing = edges.filter((e) => e.source === start?.id)
      if (existing.length >= 1) return false
    }
    return true
  }

  if (sType === 'step') {
    if (tType === 'chatOutput') return true

    // Allow step -> step connections for multi-input scenarios
    if (tType === 'step') {
      // Check if target step is already connected to start node
      const targetConnectedToStart = edges.some(
        (e) =>
          e.target === targetNode.id &&
          nodes.find((n) => n.id === e.source)?.type === 'start'
      )

      // If target step is connected to start node, don't allow step->step connections
      if (targetConnectedToStart) return false

      // Allow step -> step connections when not connected to start
      return true
    }

    return false
  }

  if (sType === 'chatOutput') {
    if (tType !== 'step') return false

    // Check if target step is already connected to start node
    const targetConnectedToStart = edges.some(
      (e) =>
        e.target === targetNode.id &&
        nodes.find((n) => n.id === e.source)?.type === 'start'
    )

    // If step is connected to start node, don't allow chatOutput connections
    if (targetConnectedToStart) return false

    // For parallel mode: allow multiple chatOutput -> step connections
    if (modeValue === 'parallel') {
      // Allow multiple chatOutput nodes to connect to the same step (multi-input)
      return true
    }

    // Sequential mode: maintain original sequential logic
    const chatOutputId = connection.source as string
    // find the step that feeds this output
    const incomingFromStep = edges.find(
      (e) =>
        e.target === chatOutputId &&
        nodes.find((n) => n.id === e.source)?.type === 'step'
    )
    if (!incomingFromStep) return false
    const sourceStep = nodes.find((n) => n.id === incomingFromStep.source)
    const targetStep = targetNode
    const srcNum = getStepNumber(sourceStep)
    const tgtNum = getStepNumber(targetStep)
    if (!Number.isFinite(srcNum) || !Number.isFinite(tgtNum)) return false

    // Allow only linking to immediate next step
    if (tgtNum !== srcNum! + 1) return false

    // Disallow multiple next links from the same output
    const alreadyHasNext = edges.some(
      (e) =>
        e.source === chatOutputId &&
        nodes.find((n) => n.id === e.target)?.type === 'step'
    )
    if (alreadyHasNext) return false

    // In sequential mode, still disallow multiple previous outputs into the same step
    const targetHasPrev = edges.some(
      (e) =>
        e.target === targetStep.id &&
        nodes.find((n) => n.id === e.source)?.type === 'chatOutput'
    )
    if (targetHasPrev) return false

    return true
  }

  return false
}
