import { useMemo } from 'react'

import type { RetrievalTrace } from '@/redux/types/conversation'

import {
  layoutRouteGraph,
  type RouteGraphEdge,
  type RouteGraphNode,
} from './routeGraphLayout'

const BULGE = 14

const edgePath = ({ points, bulge }: RouteGraphEdge) => {
  const [start, ...rest] = points
  const parts = [`M ${start[0]} ${start[1]}`]
  rest.forEach(([x, y], index) => {
    const [fromX, fromY] = points[index]
    if (index % 2) {
      parts.push(`L ${x} ${y}`)
      return
    }
    const bend = bulge ? bulge * BULGE : Math.max((x - fromX) / 2, 12)
    const pull = bulge ? x + bend : x - bend
    parts.push(`C ${fromX + bend} ${fromY}, ${pull} ${y}, ${x} ${y}`)
  })
  return parts.join(' ')
}

const nodeClasses = (node: RouteGraphNode) => {
  if (node.kind === 'entity') {
    return node.start
      ? { box: 'fill-primary', text: 'fill-primary-foreground font-medium' }
      : { box: 'fill-muted stroke-border', text: 'fill-foreground font-medium' }
  }
  return node.cited
    ? { box: 'fill-primary/15 stroke-primary', text: 'fill-foreground' }
    : { box: 'fill-card stroke-border', text: 'fill-muted-foreground' }
}

/** The whole route as one picture: named things on the left, evidence on the right. */
const RouteGraph = ({
  trace,
  citedIds,
}: {
  trace: RetrievalTrace
  citedIds: ReadonlySet<string>
}) => {
  const layout = useMemo(
    () => layoutRouteGraph(trace, citedIds),
    [trace, citedIds]
  )
  if (!layout.nodes.length) return null
  return (
    <svg
      role='img'
      aria-label={`Route through the graph: ${layout.nodes
        .filter((node) => node.start)
        .map((node) => node.fullLabel)
        .join(', ')} to the snippets used`}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className='mt-2 block w-full'
    >
      {layout.edges.map((edge) => {
        const [endX, endY] = edge.points[edge.points.length - 1]
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <path
              d={edgePath(edge)}
              fill='none'
              strokeWidth={edge.stated ? 1.5 : 1}
              strokeDasharray={edge.stated ? undefined : '3 3'}
              className={
                edge.stated ? 'stroke-primary' : 'stroke-muted-foreground/50'
              }
            />
            {edge.label && (
              <text
                x={edge.bulge ? endX + edge.bulge * BULGE : endX - 3}
                y={endY - 5}
                textAnchor={edge.bulge > 0 ? 'start' : 'end'}
                paintOrder='stroke'
                strokeWidth={3}
                className='fill-foreground stroke-card text-[10px] italic'
              >
                {edge.label}
              </text>
            )}
          </g>
        )
      })}
      {layout.nodes.map((node) => {
        const classes = nodeClasses(node)
        return (
          <g key={node.id} opacity={node.faded ? 0.55 : 1}>
            <title>{node.fullLabel}</title>
            <rect
              x={node.x}
              y={node.y - node.height / 2}
              width={node.width}
              height={node.height}
              rx={node.kind === 'entity' ? node.height / 2 : 4}
              className={classes.box}
            />
            <text
              x={node.x + node.width / 2}
              y={node.y + 3.5}
              textAnchor='middle'
              className={`text-[10.5px] ${classes.text}`}
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default RouteGraph
