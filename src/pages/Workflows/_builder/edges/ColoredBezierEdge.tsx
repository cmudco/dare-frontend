import { type EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react'

import { HANDLE_COLOR_HEX } from '@/utils/constants/workflowBuilder'

const DEFAULT_EDGE_COLOR = 'var(--muted-foreground)'

export default function ColoredBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  sourceHandleId,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Derive color from source handle ID
  // Start node uses output-1..output-5 with colored handles
  let edgeColor = DEFAULT_EDGE_COLOR
  if (sourceHandleId) {
    const outputMatch = sourceHandleId.match(/^output-(\d+)$/)
    if (outputMatch) {
      const index = parseInt(outputMatch[1], 10) - 1
      const colors = Object.values(HANDLE_COLOR_HEX)
      edgeColor = colors[index % colors.length]
    }
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        stroke: edgeColor,
        strokeOpacity: selected ? 1 : 0.6,
        strokeWidth: selected ? 3 : 2,
      }}
    />
  )
}
