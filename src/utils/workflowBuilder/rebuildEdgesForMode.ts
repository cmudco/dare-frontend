import type { Edge, Node } from '@xyflow/react'

const getStepNumber = (node?: Node): number | null => {
  if (!node) return null
  return (node.data as { stepNumber: number }).stepNumber
}

const sortNodesByStep = (nodes: Node[]): Node[] => {
  return [...nodes].sort((a, b) => {
    const aNum = getStepNumber(a) ?? Number.POSITIVE_INFINITY
    const bNum = getStepNumber(b) ?? Number.POSITIVE_INFINITY
    return aNum - bNum
  })
}

const normalizeEdges = (edges: Edge[]): Edge[] =>
  [...edges]
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      type: edge.type ?? 'smoothstep',
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

export const rebuildEdgesForMode = (
  startId: string,
  mode: 'sequential' | 'parallel',
  nodes: Node[]
): Edge[] => {
  const stepNodes = sortNodesByStep(nodes.filter((n) => n.type === 'step'))

  const outputsByStep = new Map<number, Node[]>()
  nodes
    .filter((n) => n.type === 'chatOutput')
    .forEach((output) => {
      const num = getStepNumber(output)
      if (num == null) return
      const existing = outputsByStep.get(num) ?? []
      existing.push(output)
      outputsByStep.set(num, existing)
    })

  const nextEdges: Edge[] = []

  stepNodes.forEach((step) => {
    const stepNum = getStepNumber(step)
    if (stepNum == null) return
    const relatedOutputs = outputsByStep.get(stepNum) ?? []
    if (!relatedOutputs.length) return
    const sortedOutputs = [...relatedOutputs].sort((a, b) =>
      a.id.localeCompare(b.id)
    )
    sortedOutputs.forEach((output) => {
      nextEdges.push({
        id: `e-${step.id}-${output.id}`,
        source: step.id,
        target: output.id,
        type: 'smoothstep',
      })
    })
  })

  if (mode === 'parallel') {
    stepNodes.forEach((step, index) => {
      nextEdges.push({
        id: `e-${startId}-${step.id}`,
        source: startId,
        target: step.id,
        type: 'smoothstep',
        sourceHandle: `output-${index + 1}`,
      })
    })
    return normalizeEdges(nextEdges)
  }

  if (stepNodes.length > 0) {
    nextEdges.push({
      id: `e-${startId}-${stepNodes[0].id}`,
      source: startId,
      target: stepNodes[0].id,
      type: 'smoothstep',
    })
  }

  for (let i = 0; i < stepNodes.length - 1; i++) {
    const current = stepNodes[i]
    const next = stepNodes[i + 1]
    const currentNum = getStepNumber(current)
    if (currentNum == null) continue
    const relatedOutputs = outputsByStep.get(currentNum)
    if (!relatedOutputs || relatedOutputs.length === 0) continue
    const primaryOutput = [...relatedOutputs].sort((a, b) =>
      a.id.localeCompare(b.id)
    )[0]
    if (!primaryOutput) continue
    nextEdges.push({
      id: `e-${primaryOutput.id}-${next.id}`,
      source: primaryOutput.id,
      target: next.id,
      type: 'smoothstep',
    })
  }

  return normalizeEdges(nextEdges)
}
