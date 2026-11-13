import { useEffect, useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  getStraightPath,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useInternalNode,
  useNodesInitialized,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type InternalNode,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useAppSelector } from '@/redux/hooks'
import { selectResolvedMode } from '@/redux/themeSlice'
import type {
  GraphNode,
  KnowledgeGraphView,
} from '@/redux/types/knowledgeGraph'

import { entityKind, relationText } from './entityKinds'
import { forceLayout } from './forceLayout'

const ARROW_GAP = 3

const CENTER_HANDLE = {
  top: '50%',
  left: '50%',
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  opacity: 0,
  border: 0,
  pointerEvents: 'none' as const,
}

type EntityNodeData = {
  entity: GraphNode
  emphasis: 'selected' | 'path' | 'near' | 'plain' | 'dim'
  prominent: boolean
}

const EMPHASIS_CLASS: Record<EntityNodeData['emphasis'], string> = {
  selected: 'border-primary bg-primary text-primary-foreground shadow-md',
  path: 'border-primary bg-primary/15 text-foreground shadow-sm',
  near: 'border-foreground/40 bg-card text-foreground',
  plain: 'border-border bg-card text-foreground hover:border-foreground/40',
  dim: 'border-border/60 bg-card/70 text-muted-foreground opacity-40',
}

const EntityNode = ({ data }: NodeProps<Node<EntityNodeData>>) => {
  const { icon: Icon } = entityKind(data.entity.kind)
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 transition-all duration-150 ${
        data.prominent ? 'py-1.5 text-sm font-medium' : 'py-1 text-xs'
      } ${EMPHASIS_CLASS[data.emphasis]}`}
    >
      <Handle
        type='target'
        position={Position.Top}
        isConnectable={false}
        style={CENTER_HANDLE}
      />
      <Handle
        type='source'
        position={Position.Top}
        isConnectable={false}
        style={CENTER_HANDLE}
      />
      <Icon
        className={`shrink-0 ${data.prominent ? 'h-3.5 w-3.5' : 'h-3 w-3'}`}
      />
      <span className='max-w-44 truncate whitespace-nowrap'>
        {data.entity.label}
      </span>
    </div>
  )
}

const NODE_TYPES = { entity: EntityNode }

type Point = { x: number; y: number }

const borderPoint = (node: InternalNode, from: Point, toward: Point): Point => {
  const halfWidth = (node.measured.width ?? 0) / 2 + ARROW_GAP
  const halfHeight = (node.measured.height ?? 0) / 2 + ARROW_GAP
  const dx = toward.x - from.x
  const dy = toward.y - from.y
  const scale = Math.min(
    dx ? halfWidth / Math.abs(dx) : Infinity,
    dy ? halfHeight / Math.abs(dy) : Infinity,
    1
  )
  return { x: from.x + dx * scale, y: from.y + dy * scale }
}

// Handles sit at the node's center, which would hide an arrowhead under the pill.
const BorderEdge = ({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps) => {
  const from = useInternalNode(source)
  const to = useInternalNode(target)
  if (!from || !to) return null
  const sourceCenter = { x: sourceX, y: sourceY }
  const targetCenter = { x: targetX, y: targetY }
  const start = borderPoint(from, sourceCenter, targetCenter)
  const end = borderPoint(to, targetCenter, sourceCenter)
  const [path, labelX, labelY] = getStraightPath({
    sourceX: start.x,
    sourceY: start.y,
    targetX: end.x,
    targetY: end.y,
  })
  return (
    <BaseEdge
      path={path}
      markerEnd={markerEnd}
      style={style}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={labelStyle}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
    />
  )
}

const EDGE_TYPES = { border: BorderEdge }
// The layout places node centers.
const NODE_ORIGIN: [number, number] = [0.5, 0.5]

interface GraphCanvasProps {
  view: KnowledgeGraphView
  selectedId: number | null
  onSelect: (id: number | null) => void
  showLinks: boolean
  highlightedIds: number[]
}

const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

const Canvas = ({
  view,
  selectedId,
  onSelect,
  showLinks,
  highlightedIds,
}: GraphCanvasProps) => {
  const mode = useAppSelector(selectResolvedMode)
  const { fitView } = useReactFlow()

  // With only stated relationships showing, an unconnected entity is just noise.
  const shownLinks = useMemo(
    () =>
      showLinks || view.relations.length === 0
        ? view.links.filter((link) => link.strong)
        : [],
    [showLinks, view.links, view.relations.length]
  )
  const shownNodes = useMemo(() => {
    const connected = new Set<number>()
    for (const edge of [...view.relations, ...shownLinks]) {
      connected.add(edge.source)
      connected.add(edge.target)
    }
    return connected.size
      ? view.nodes.filter((node) => connected.has(node.id))
      : view.nodes
  }, [view.nodes, view.relations, shownLinks])

  const visibleLinks = useMemo(() => {
    if (selectedId == null) return shownLinks
    const shownIds = new Set(shownNodes.map((node) => node.id))
    const touching = view.links.filter(
      (link) =>
        (link.source === selectedId || link.target === selectedId) &&
        shownIds.has(link.source) &&
        shownIds.has(link.target)
    )
    return [...new Set([...shownLinks, ...touching])]
  }, [selectedId, shownLinks, shownNodes, view.links])

  const positions = useMemo(() => {
    const maxMentions = Math.max(...shownNodes.map((n) => n.mentions), 1)
    return forceLayout(
      shownNodes.map((node) => ({
        id: node.id,
        radius: 46 + (node.mentions / maxMentions) * 34 + node.label.length * 2,
      })),
      [
        ...view.relations.map((edge) => ({
          source: edge.source,
          target: edge.target,
          strength: 1.6,
        })),
        ...shownLinks.map((edge) => ({
          source: edge.source,
          target: edge.target,
          strength: Math.min(0.25 + edge.weight * 0.12, 1),
        })),
      ]
    )
  }, [shownNodes, shownLinks, view.relations])

  const neighbours = useMemo(() => {
    const near = new Set<number>()
    if (selectedId == null) return near
    for (const edge of [...view.relations, ...visibleLinks]) {
      if (edge.source === selectedId) near.add(edge.target)
      if (edge.target === selectedId) near.add(edge.source)
    }
    return near
  }, [selectedId, view.relations, visibleLinks])

  const pathSet = useMemo(() => new Set(highlightedIds), [highlightedIds])
  const pathPairs = useMemo(() => {
    const pairs = new Set<string>()
    for (let i = 1; i < highlightedIds.length; i += 1) {
      pairs.add(pairKey(highlightedIds[i - 1], highlightedIds[i]))
    }
    return pairs
  }, [highlightedIds])
  const focusing = selectedId != null || pathSet.size > 0
  const prominentCut = useMemo(() => {
    const sorted = shownNodes
      .map((node) => node.relations * 3 + node.files * 2 + node.mentions / 8)
      .sort((a, b) => b - a)
    return sorted[Math.min(11, sorted.length - 1)] ?? 0
  }, [shownNodes])

  const nodes = useMemo<Node<EntityNodeData>[]>(
    () =>
      shownNodes.map((entity) => {
        const emphasis: EntityNodeData['emphasis'] =
          entity.id === selectedId
            ? 'selected'
            : pathSet.has(entity.id)
              ? 'path'
              : neighbours.has(entity.id)
                ? 'near'
                : focusing
                  ? 'dim'
                  : 'plain'
        return {
          id: String(entity.id),
          type: 'entity',
          position: positions.get(entity.id) ?? { x: 0, y: 0 },
          data: {
            entity,
            emphasis,
            prominent:
              entity.relations * 3 + entity.files * 2 + entity.mentions / 8 >=
              prominentCut,
          },
          draggable: true,
        }
      }),
    [
      shownNodes,
      positions,
      selectedId,
      neighbours,
      pathSet,
      focusing,
      prominentCut,
    ]
  )

  const edges = useMemo<Edge[]>(() => {
    const touching = (source: number, target: number) =>
      selectedId != null && (source === selectedId || target === selectedId)
    const typed: Edge[] = view.relations.map((edge, index) => {
      const active =
        touching(edge.source, edge.target) ||
        pathPairs.has(pairKey(edge.source, edge.target))
      return {
        id: `r-${index}`,
        source: String(edge.source),
        target: String(edge.target),
        type: 'border',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: active ? 'var(--primary)' : 'var(--muted-foreground)',
        },
        label: active || !focusing ? relationText(edge.label) : undefined,
        labelStyle: { fill: 'var(--muted-foreground)', fontSize: 10 },
        labelBgStyle: { fill: 'var(--card)' },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke: active ? 'var(--primary)' : 'var(--muted-foreground)',
          strokeWidth: active ? 2 : 1.25,
          opacity: focusing && !active ? 0.15 : 0.75,
        },
      }
    })
    const links: Edge[] = visibleLinks.map((edge, index) => {
      const active =
        touching(edge.source, edge.target) ||
        pathPairs.has(pairKey(edge.source, edge.target))
      return {
        id: `l-${index}`,
        source: String(edge.source),
        target: String(edge.target),
        type: 'border',
        style: {
          stroke: active ? 'var(--primary)' : 'var(--border)',
          strokeWidth: active ? 1.75 : 1,
          strokeDasharray: '3 4',
          opacity: focusing && !active ? 0.2 : 0.9,
        },
      }
    })
    return [...links, ...typed]
  }, [view.relations, visibleLinks, selectedId, focusing, pathPairs])

  const measured = useNodesInitialized()
  useEffect(() => {
    if (measured) void fitView({ padding: 0.1, duration: 250 })
  }, [fitView, measured, shownNodes.length])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      nodeOrigin={NODE_ORIGIN}
      colorMode={mode}
      fitView
      minZoom={0.15}
      maxZoom={2}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_, node) => onSelect(Number(node.id))}
      onPaneClick={() => onSelect(null)}
      style={{ background: 'transparent' }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color='var(--border)'
      />
      <Controls showInteractive={false} position='bottom-right' />
    </ReactFlow>
  )
}

const GraphCanvas = (props: GraphCanvasProps) => (
  <ReactFlowProvider>
    <Canvas {...props} />
  </ReactFlowProvider>
)

export default GraphCanvas
