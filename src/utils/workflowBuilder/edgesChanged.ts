import type { Edge } from '@xyflow/react'

export const edgesChanged = (current: Edge[], rebuilt: Edge[]): boolean => {
  const normalize = (edges: Edge[]) =>
    edges
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        type: edge.type ?? 'smoothstep',
      }))
      .sort((a, b) => a.id.localeCompare(b.id))

  const currentNormalized = normalize(current)
  const rebuiltNormalized = normalize(rebuilt)

  return JSON.stringify(currentNormalized) !== JSON.stringify(rebuiltNormalized)
}
