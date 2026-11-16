import type { GraphWalkStep, RetrievalTrace } from '@/redux/types/conversation'

import { chunkStepLabel, relationPhrase } from './graphPathText'
import { arrangeRoute } from './routeGraphOrder'

export interface RouteGraphNode {
  id: string
  kind: GraphWalkStep['kind']
  label: string
  fullLabel: string
  start: boolean
  cited: boolean
  faded: boolean
  x: number
  y: number
  width: number
  height: number
}

export interface RouteGraphEdge {
  from: string
  to: string
  label: string
  stated: boolean
  /** Curve between each pair, then a straight run across a lane, repeated. */
  points: [number, number][]
  /** 0 for a link between columns; 1 or -1 bows right or left inside one. */
  bulge: number
}

interface RouteLink {
  from: string
  to: string
  phrase: string
  reversed: boolean
}

const VIEW_WIDTH = 620
// A longer route widens the picture instead of stacking steps in one column.
const FULL_SIZE_COLUMNS = 5
const NODE_HEIGHT = 24
const ROW_GAP = 8
const LINK_GAP = 24
const LABELLED_GAP = 66
const MAX_COLUMNS = 7
const CHARS_PER_COLUMN_PIXEL = 0.17

const nodeId = (step: GraphWalkStep) =>
  step.kind === 'entity'
    ? `entity:${step.entityId ?? step.label}`
    : `chunk:${step.fileId}:${step.chunkIndex}`

const clip = (text: string, limit: number) =>
  text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text

/** Columns follow route depth; rows are ordered and placed to keep lines apart. */
export const layoutRouteGraph = (
  trace: RetrievalTrace,
  citedIds: ReadonlySet<string>
) => {
  const citations = new Map(
    (trace.finalEvidence ?? []).map((entry) => [
      `${entry.sourceRef}|${entry.chunkIndex}`,
      entry.citationId ?? '',
    ])
  )
  // Files in one set often share a long prefix, so the section tells chunks apart.
  const sections = new Map(
    (trace.finalEvidence ?? []).map((entry) => [
      `${entry.sourceRef}|${entry.chunkIndex}`,
      entry.section ?? '',
    ])
  )
  const depth = new Map<string, number>()
  const steps = new Map<string, GraphWalkStep>()
  const edges = new Map<string, RouteLink>()
  const starts = new Set<string>()
  for (const entry of trace.finalEvidence ?? []) {
    const path = entry.path ?? []
    path.forEach((step, index) => {
      const id = nodeId(step)
      steps.set(id, steps.get(id) ?? step)
      depth.set(id, Math.min(depth.get(id) ?? index, index))
      if (index === 0) {
        starts.add(id)
        return
      }
      const previous = nodeId(path[index - 1])
      if (previous === id) return
      const key = `${previous}>${id}`
      if (!edges.has(key)) {
        edges.set(key, {
          from: previous,
          to: id,
          phrase: relationPhrase(step),
          reversed: !!step.relationReversed,
        })
      }
    })
  }
  if (!steps.size) return { nodes: [], edges: [], width: 0, height: 0 }

  const deepest = Math.min(Math.max(...depth.values()), MAX_COLUMNS - 1)
  const columnOf = new Map<string, number>()
  for (const [id, step] of steps) {
    // Evidence reads best lined up at the end of the route.
    const isEnd = ![...edges.values()].some((edge) => edge.from === id)
    columnOf.set(
      id,
      isEnd && step.kind === 'chunk'
        ? deepest
        : Math.min(depth.get(id) ?? 0, deepest)
    )
  }
  // A step reached again later in another route would link sideways or
  // backwards; moving it right keeps every line running left to right.
  for (let pass = 0, moved = true; moved && pass < steps.size; pass++) {
    moved = false
    for (const edge of edges.values()) {
      const from = columnOf.get(edge.from) ?? 0
      if (
        !starts.has(edge.to) &&
        from < deepest &&
        (columnOf.get(edge.to) ?? 0) <= from
      ) {
        columnOf.set(edge.to, from + 1)
        moved = true
      }
    }
  }
  const columns: string[][] = Array.from({ length: deepest + 1 }, () => [])
  for (const [id, column] of columnOf) columns[column].push(id)
  const columnGap = [...edges.values()].some((edge) => edge.phrase)
    ? LABELLED_GAP
    : LINK_GAP
  const width =
    (VIEW_WIDTH * Math.max(deepest + 1, FULL_SIZE_COLUMNS)) / FULL_SIZE_COLUMNS
  const columnWidth = (width - columnGap * deepest) / (deepest + 1)
  const charLimit = Math.max(
    Math.floor(columnWidth * CHARS_PER_COLUMN_PIXEL),
    8
  )

  // Drawn left to right, whichever way the route ran.
  const links = [...edges.values()].map((link) => {
    const flipped =
      (columnOf.get(link.from) ?? 0) > (columnOf.get(link.to) ?? 0)
    return {
      ...link,
      flipped,
      left: flipped ? link.to : link.from,
      right: flipped ? link.from : link.to,
    }
  })
  const across = links.filter(
    (link) => columnOf.get(link.left) !== columnOf.get(link.right)
  )
  const arranged = arrangeRoute(
    columns,
    across.map((link) => ({ from: link.left, to: link.right })),
    NODE_HEIGHT,
    ROW_GAP
  )
  const columnX = (column: number) => column * (columnWidth + columnGap)
  const nodes: RouteGraphNode[] = []
  columns.forEach((ids, columnIndex) => {
    ids.forEach((id) => {
      const step = steps.get(id) as GraphWalkStep
      const citation =
        step.kind === 'chunk'
          ? (citations.get(`${step.label}|${step.chunkIndex}`) ?? '')
          : ''
      const base = step.kind === 'chunk' ? chunkStepLabel(step) : step.label
      const short =
        step.kind === 'chunk'
          ? sections.get(`${step.label}|${step.chunkIndex}`) ||
            base.replace(/, p\. \d+$/, '')
          : base
      const fullLabel = citation ? `[${citation}] ${base}` : base
      nodes.push({
        id,
        kind: step.kind,
        label: clip(citation ? `[${citation}] ${short}` : short, charLimit),
        fullLabel,
        start: starts.has(id) && step.kind === 'entity',
        cited: !!citation && citedIds.has(citation),
        faded: step.kind === 'chunk' && !citedIds.has(citation),
        x: columnX(columnIndex),
        y: arranged.y.get(id) ?? 0,
        width: columnWidth,
        height: NODE_HEIGHT,
      })
    })
  })
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const routed = links.flatMap((link): RouteGraphEdge[] => {
    const left = byId.get(link.left)
    const right = byId.get(link.right)
    if (!left || !right) return []
    const shared = {
      from: link.from,
      to: link.to,
      label:
        link.phrase && link.reversed !== link.flipped
          ? `← ${link.phrase}`
          : link.phrase,
      stated: !!link.phrase,
    }
    const lanes = arranged.lanes[across.indexOf(link)]
    if (!lanes) {
      // A link inside one column bows into the gap beside it.
      const bulge = left.x + left.width < width ? 1 : -1
      const x = bulge > 0 ? left.x + left.width : left.x
      return [
        {
          ...shared,
          bulge,
          points: [
            [x, left.y],
            [x, right.y],
          ],
        },
      ]
    }
    const firstLane = (columnOf.get(link.left) ?? 0) + 1
    const through = lanes.flatMap((id, index): [number, number][] => {
      const x = columnX(firstLane + index)
      const y = arranged.y.get(id) ?? 0
      return [
        [x, y],
        [x + columnWidth, y],
      ]
    })
    return [
      {
        ...shared,
        bulge: 0,
        points: [[left.x + left.width, left.y], ...through, [right.x, right.y]],
      },
    ]
  })
  return {
    nodes,
    edges: routed,
    width,
    height: arranged.height,
  }
}
