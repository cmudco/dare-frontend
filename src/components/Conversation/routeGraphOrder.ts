export interface RouteLink {
  from: string
  to: string
}

const LANE_GAP = 6
const SWEEPS = 8
const SETTLE_ROUNDS = 6

const isLane = (id: string) => id.startsWith('lane:')

const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length

const add = (map: Map<string, string[]>, key: string, value: string) => {
  const list = map.get(key)
  if (list) list.push(value)
  else map.set(key, [value])
}

/** Closest non-decreasing fit, so rows keep their order and spacing. */
const nonDecreasing = (values: number[]) => {
  const blocks: { sum: number; count: number }[] = []
  for (const value of values) {
    let block = { sum: value, count: 1 }
    let last = blocks[blocks.length - 1]
    while (last && last.sum / last.count > block.sum / block.count) {
      block = { sum: last.sum + block.sum, count: last.count + block.count }
      blocks.pop()
      last = blocks[blocks.length - 1]
    }
    blocks.push(block)
  }
  return blocks.flatMap((block) =>
    Array<number>(block.count).fill(block.sum / block.count)
  )
}

/**
 * Orders each column to cut line crossings and places rows beside what they
 * connect to. A link that skips columns gets a lane in each one it passes, so
 * its line runs through empty space instead of behind boxes. Every link must
 * go from an earlier column to a later one.
 */
export const arrangeRoute = (
  columns: string[][],
  links: RouteLink[],
  nodeHeight: number,
  rowGap: number
) => {
  let order = columns.map((ids) => [...ids])
  const columnOf = new Map<string, number>()
  order.forEach((ids, column) => ids.forEach((id) => columnOf.set(id, column)))
  const left = new Map<string, string[]>()
  const right = new Map<string, string[]>()
  const lanes = links.map((link, index) => {
    const ids: string[] = []
    let previous = link.from
    const end = columnOf.get(link.to) ?? 0
    for (
      let column = (columnOf.get(link.from) ?? 0) + 1;
      column < end;
      column++
    ) {
      const id = `lane:${index}:${column}`
      order[column].push(id)
      ids.push(id)
      add(right, previous, id)
      add(left, id, previous)
      previous = id
    }
    add(right, previous, link.to)
    add(left, link.to, previous)
    return ids
  })

  const position = new Map<string, number>()
  const index = () =>
    order.forEach((ids) => ids.forEach((id, row) => position.set(id, row)))
  const crossings = () => {
    let total = 0
    for (const ids of order) {
      const segments = ids.flatMap((id) =>
        (left.get(id) ?? []).map((near) => [
          position.get(near) ?? 0,
          position.get(id) ?? 0,
        ])
      )
      segments.forEach((a, i) =>
        segments.slice(i + 1).forEach((b) => {
          if ((a[0] - b[0]) * (a[1] - b[1]) < 0) total += 1
        })
      )
    }
    return total
  }
  const sortBy = (ids: string[], side: Map<string, string[]>) => {
    const key = new Map(
      ids.map((id, row) => {
        const near = side.get(id) ?? []
        return [
          id,
          near.length ? mean(near.map((n) => position.get(n) ?? 0)) : row,
        ]
      })
    )
    ids.sort((a, b) => (key.get(a) ?? 0) - (key.get(b) ?? 0))
    ids.forEach((id, row) => position.set(id, row))
  }

  index()
  let best = order.map((ids) => [...ids])
  let fewest = crossings()
  const keepIfBetter = () => {
    const count = crossings()
    if (count >= fewest) return false
    fewest = count
    best = order.map((ids) => [...ids])
    return true
  }
  for (let sweep = 0; sweep < SWEEPS && fewest > 0; sweep++) {
    if (sweep % 2 === 0) order.slice(1).forEach((ids) => sortBy(ids, left))
    else [...order.slice(0, -1)].reverse().forEach((ids) => sortBy(ids, right))
    keepIfBetter()
  }
  order = best.map((ids) => [...ids])
  index()
  // Barycentre sorting leaves neighbour swaps that still remove a crossing.
  for (let improved = fewest > 0; improved; ) {
    improved = false
    for (const ids of order) {
      for (let row = 0; row + 1 < ids.length && fewest > 0; row++) {
        const swap = () => {
          ;[ids[row], ids[row + 1]] = [ids[row + 1], ids[row]]
          position.set(ids[row], row)
          position.set(ids[row + 1], row + 1)
        }
        swap()
        if (keepIfBetter()) improved = true
        else swap()
      }
    }
  }

  const size = (id: string) => (isLane(id) ? 0 : nodeHeight)
  const y = new Map<string, number>()
  const offsets = order.map((ids) => {
    let at = 0
    return ids.map((id, row) => {
      if (row) {
        const above = ids[row - 1]
        const gap = isLane(id) && isLane(above) ? LANE_GAP : rowGap
        at += (size(id) + size(above)) / 2 + gap
      }
      return at
    })
  })
  order.forEach((ids, column) => {
    const middle = (offsets[column][ids.length - 1] ?? 0) / 2
    ids.forEach((id, row) => y.set(id, offsets[column][row] - middle))
  })
  const settle = (column: number) => {
    const ids = order[column]
    const wanted = ids.map((id) => {
      const near = [...(left.get(id) ?? []), ...(right.get(id) ?? [])]
      return near.length
        ? mean(near.map((n) => y.get(n) ?? 0))
        : (y.get(id) ?? 0)
    })
    const fitted = nonDecreasing(
      wanted.map((value, row) => value - offsets[column][row])
    )
    ids.forEach((id, row) => y.set(id, fitted[row] + offsets[column][row]))
  }
  for (let round = 0; round < SETTLE_ROUNDS; round++) {
    const sequence = order.map((_, column) => column)
    if (round % 2) sequence.reverse()
    sequence.forEach(settle)
  }

  const ids = order.flat()
  const top = Math.min(...ids.map((id) => (y.get(id) ?? 0) - size(id) / 2))
  const bottom = Math.max(...ids.map((id) => (y.get(id) ?? 0) + size(id) / 2))
  ids.forEach((id) => y.set(id, (y.get(id) ?? 0) - top + rowGap / 2))
  return { y, lanes, height: bottom - top + rowGap }
}
