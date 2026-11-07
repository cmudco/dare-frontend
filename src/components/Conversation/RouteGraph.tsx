import { useMemo } from 'react'

import type { RetrievalTrace } from '@/redux/types/conversation'

import { layoutRouteGraph, type RouteGraphNode } from './routeGraphLayout'

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
  const byId = new Map(layout.nodes.map((node) => [node.id, node]))
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
        const from = byId.get(edge.from)
        const to = byId.get(edge.to)
        if (!from || !to) return null
        const startX = from.x + from.width
        const endX = to.x
        const bend = Math.max((endX - startX) / 2, 12)
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <path
              d={`M ${startX} ${from.y} C ${startX + bend} ${from.y}, ${endX - bend} ${to.y}, ${endX} ${to.y}`}
              fill='none'
              strokeWidth={edge.stated ? 1.5 : 1}
              strokeDasharray={edge.stated ? undefined : '3 3'}
              className={
                edge.stated ? 'stroke-primary' : 'stroke-muted-foreground/50'
              }
            />
            {edge.label && (
              <text
                x={endX - 3}
                y={to.y - 5}
                textAnchor='end'
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
