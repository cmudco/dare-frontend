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
  return new Map(points.map(({ id, x, y }) => [id, { x, y }]))
}
