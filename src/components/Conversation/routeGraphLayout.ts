import type { GraphWalkStep, RetrievalTrace } from '@/redux/types/conversation'

import { chunkStepLabel, relationPhrase } from './graphPathText'

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
}

const VIEW_WIDTH = 620
const NODE_HEIGHT = 24
const ROW_GAP = 8
const LINK_GAP = 24
const LABELLED_GAP = 66
const MAX_COLUMNS = 5
const CHARS_PER_COLUMN_PIXEL = 0.17

const nodeId = (step: GraphWalkStep) =>
  step.kind === 'entity'
    ? `entity:${step.entityId ?? step.label}`
    : `chunk:${step.fileId}:${step.chunkIndex}`

const clip = (text: string, limit: number) =>
  text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text

/** Columns follow route depth; rows follow each node's parents to limit crossings. */
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
  const parents = new Map<string, Set<string>>()
  const edges = new Map<string, RouteGraphEdge>()
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
      if (!parents.has(id)) parents.set(id, new Set())
      parents.get(id)?.add(previous)
      const key = `${previous}>${id}`
      if (!edges.has(key)) {
        const phrase = relationPhrase(step)
        edges.set(key, {
          from: previous,
          to: id,
          label: phrase && step.relationReversed ? `← ${phrase}` : phrase,
          stated: !!phrase,
        })
      }
    })
  }
  if (!steps.size) return { nodes: [], edges: [], width: 0, height: 0 }

  const deepest = Math.min(Math.max(...depth.values()), MAX_COLUMNS - 1)
  const columns: string[][] = Array.from({ length: deepest + 1 }, () => [])
  for (const [id, step] of steps) {
    // Evidence reads best lined up at the end of the route.
    const isEnd = ![...edges.values()].some((edge) => edge.from === id)
    const column =
      isEnd && step.kind === 'chunk'
        ? deepest
        : Math.min(depth.get(id) ?? 0, deepest)
    columns[column].push(id)
  }
  const columnGap = [...edges.values()].some((edge) => edge.label)
    ? LABELLED_GAP
    : LINK_GAP
  const columnWidth =
    (VIEW_WIDTH - columnGap * deepest) / Math.max(deepest + 1, 1)
  const charLimit = Math.max(
    Math.floor(columnWidth * CHARS_PER_COLUMN_PIXEL),
    8
  )

  const row = new Map<string, number>()
  columns.forEach((ids) => {
    const ordered = [...ids].sort((a, b) => {
      const rank = (id: string) => {
        const above = [...(parents.get(id) ?? [])]
          .map((parent) => row.get(parent))
          .filter((value): value is number => value !== undefined)
        return above.length
          ? above.reduce((sum, value) => sum + value, 0) / above.length
          : 0
      }
      return rank(a) - rank(b)
    })
    ordered.forEach((id, index) => row.set(id, index))
    ids.splice(0, ids.length, ...ordered)
  })

  const tallest = Math.max(...columns.map((ids) => ids.length))
  const height = tallest * (NODE_HEIGHT + ROW_GAP) + ROW_GAP
  const nodes: RouteGraphNode[] = []
  columns.forEach((ids, columnIndex) => {
    const offset = (height - ids.length * (NODE_HEIGHT + ROW_GAP) + ROW_GAP) / 2
    ids.forEach((id, index) => {
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
        x: columnIndex * (columnWidth + columnGap),
        y: offset + index * (NODE_HEIGHT + ROW_GAP) + NODE_HEIGHT / 2,
        width: columnWidth,
        height: NODE_HEIGHT,
      })
    })
  })
  const known = new Set(nodes.map((node) => node.id))
  return {
    nodes,
    edges: [...edges.values()].filter(
      (edge) => known.has(edge.from) && known.has(edge.to)
    ),
    width: VIEW_WIDTH,
    height,
  }
}
