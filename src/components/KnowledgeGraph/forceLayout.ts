export interface LayoutNode {
  id: number
  radius: number
}

export interface LayoutEdge {
  source: number
  target: number
  strength: number
}

export type Positions = Map<number, { x: number; y: number }>

const ITERATIONS = 420
const REPULSION = 15000
const SPRING_LENGTH = 130
const SPRING = 0.035
const CENTER_PULL = 0.024
const COOLING = 0.992
const ROUTED_EDGE_STRENGTH = 1.5
const CLEARANCE_ROUNDS = 20
const NODE_WIDTH_SHARE = 0.8
const NODE_HALF_HEIGHT = 18
const LINE_MARGIN = 8
const SEARCH_DISTANCES = [40, 70, 100, 140, 180, 220, 280, 340]
const SEARCH_ANGLES = 24

/** A small deterministic force layout, so a graph always opens the same way. */
export const forceLayout = (
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): Positions => {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const points = nodes.map((node, index) => ({
    id: node.id,
    radius: node.radius,
    x: Math.cos(index * golden) * 34 * Math.sqrt(index + 1),
    y: Math.sin(index * golden) * 34 * Math.sqrt(index + 1),
    vx: 0,
    vy: 0,
  }))
  const byId = new Map(points.map((point) => [point.id, point]))
  let heat = 1

  for (let step = 0; step < ITERATIONS; step += 1) {
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]
      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j]
        const dx = a.x - b.x || 0.01
        const dy = a.y - b.y || 0.01
        const distanceSquared = Math.max(dx * dx + dy * dy, 64)
        const distance = Math.sqrt(distanceSquared)
        const overlap = a.radius + b.radius + 26 - distance
        const force =
          REPULSION / distanceSquared + (overlap > 0 ? overlap * 1.4 : 0)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }
    }
    for (const edge of edges) {
      const a = byId.get(edge.source)
      const b = byId.get(edge.target)
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const force = (distance - SPRING_LENGTH) * SPRING * edge.strength
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }
    for (const point of points) {
      point.vx += -point.x * CENTER_PULL
      point.vy += -point.y * CENTER_PULL
      point.x += point.vx * 0.5 * heat
      point.y += point.vy * 0.5 * heat
      point.vx *= 0.55
      point.vy *= 0.55
    }
    heat *= COOLING
  }
  clearEdges(
    points,
    edges.filter((edge) => edge.strength >= ROUTED_EDGE_STRENGTH),
    byId
  )
  return new Map(points.map(({ id, x, y }) => [id, { x, y }]))
}

type Point = { id: number; radius: number; x: number; y: number }
type Line = { a: Point; b: Point }

const halfWidth = (point: Point) => point.radius * NODE_WIDTH_SHARE

const lineCrosses = (point: Point, { a, b }: Line) => {
  const halfX = halfWidth(point) + LINE_MARGIN
  const halfY = NODE_HALF_HEIGHT + LINE_MARGIN
  let enter = 0
  let leave = 1
  const clip = (start: number, delta: number, low: number, high: number) => {
    if (delta === 0) return start >= low && start <= high
    const first = (low - start) / delta
    const second = (high - start) / delta
    enter = Math.max(enter, Math.min(first, second))
    leave = Math.min(leave, Math.max(first, second))
    return enter <= leave
  }
  return (
    clip(a.x, b.x - a.x, point.x - halfX, point.x + halfX) &&
    clip(a.y, b.y - a.y, point.y - halfY, point.y + halfY)
  )
}

const nodesOverlap = (a: Point, b: Point) =>
  Math.abs(a.x - b.x) < halfWidth(a) + halfWidth(b) &&
  Math.abs(a.y - b.y) < NODE_HALF_HEIGHT * 2 + LINE_MARGIN

/** A line running behind a node reads as that node's relationship, so move the node. */
const clearEdges = (
  points: Point[],
  edges: LayoutEdge[],
  byId: Map<number, Point>
) => {
  const lines = edges.flatMap((edge) => {
    const a = byId.get(edge.source)
    const b = byId.get(edge.target)
    return a && b ? [{ a, b }] : []
  })
  const conflicts = (point: Point) => {
    let count = 0
    for (const other of points) {
      if (other !== point && nodesOverlap(point, other)) count += 1
    }
    for (const line of lines) {
      const own = line.a === point || line.b === point
      if (!own && lineCrosses(point, line)) count += 1
      if (own) {
        for (const other of points) {
          if (other !== line.a && other !== line.b && lineCrosses(other, line))
            count += 1
        }
      }
    }
    return count
  }

  for (let round = 0; round < CLEARANCE_ROUNDS; round += 1) {
    let changed = false
    for (const point of points) {
      let best = conflicts(point)
      if (best === 0) continue
      const home = { x: point.x, y: point.y }
      let target = home
      for (const distance of SEARCH_DISTANCES) {
        for (let step = 0; step < SEARCH_ANGLES; step += 1) {
          const angle = (step / SEARCH_ANGLES) * Math.PI * 2
          point.x = home.x + Math.cos(angle) * distance
          point.y = home.y + Math.sin(angle) * distance
          const score = conflicts(point)
          if (score < best) {
            best = score
            target = { x: point.x, y: point.y }
          }
        }
      }
      point.x = target.x
      point.y = target.y
      changed = changed || target !== home
    }
    if (!changed) return
  }
}
