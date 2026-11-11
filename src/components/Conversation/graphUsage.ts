import type {
  RetrievalTrace,
  RetrievalTraceEntry,
} from '@/redux/types/conversation'

export interface GraphUsage {
  helped: boolean
  title: string
  summary: string
  /** Absent on traces saved before each snippet recorded where it came from. */
  score: { search: number; graph: number; onlyGraph: number } | null
  showRoute: boolean
  connections: string[]
}

const joinNames = (names: string[]) =>
  names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

/** Older traces have no origin, so any routed snippet counts for them. */
export const addedByGraph = (trace: RetrievalTrace): number => {
  const final = trace.finalEvidence ?? []
  return final.some((entry) => entry.origin)
    ? final.filter((entry) => entry.origin && entry.origin !== 'search').length
    : throughGraph(trace).length
}

const throughGraph = (trace: RetrievalTrace): RetrievalTraceEntry[] =>
  (trace.finalEvidence ?? []).filter((entry) => !!entry.path?.length)

/** What happened with the graph on this retrieval, in plain words. */
export const graphUsageOf = (trace: RetrievalTrace): GraphUsage | null => {
  if (trace.source === 'libraries') return null
  const walk = trace.expand?.walk
  const final = trace.finalEvidence ?? []
  const reached = throughGraph(trace)
  const originKnown = final.some((entry) => entry.origin)
  const fromGraph = final.filter(
    (entry) => entry.origin && entry.origin !== 'search'
  )
  const onlyGraph = final.filter((entry) => entry.origin === 'graph_only')
  const score = originKnown
    ? {
        search: final.length - fromGraph.length,
        graph: fromGraph.length,
        onlyGraph: onlyGraph.length,
      }
    : null
  const connections = (walk?.connections ?? []).map((item) => {
    if (item.together) {
      return `${item.from} and ${item.to} appear together in ${plural(item.together, 'chunk')}.`
    }
    return item.via.length
      ? `${item.from} and ${item.to} never appear in the same chunk. They share only names they each appear beside: ${joinNames(item.via)}.`
      : `Nothing in these files connects ${item.from} and ${item.to}.`
  })
  const facts = trace.expand?.storedFacts ?? 0
  if (facts) {
    connections.unshift(
      `The model was given ${plural(facts, 'stored connection')} about the names in your question.`
    )
  }
  const base = { score, connections }
  if (walk?.error) {
    return {
      ...base,
      helped: false,
      title: 'Graph walk failed',
      summary: 'The graph walk failed, so this answer uses search alone.',
      showRoute: false,
    }
  }
  if (walk) {
    const names = walk.queryEntities.map((item) => item.entity)
    const start = names.length
      ? `Started from ${joinNames(names)}`
      : 'Started from the chunks search found'
    const added = originKnown ? fromGraph.length : reached.length
    if (!added) {
      return {
        ...base,
        helped: false,
        title: 'Graph added nothing',
        summary: `${start} and walked the graph, but nothing it reached made the final list. This answer uses search results.`,
        showRoute: reached.length > 0,
      }
    }
    return {
      ...base,
      helped: true,
      title: 'How the graph was used',
      summary: `${start} and followed links between names, adding ${plural(added, 'snippet')} to the answer's evidence.`,
      showRoute: true,
    }
  }
  const why = trace.queryAnalysisError
    ? 'The question could not be analyzed, so the graph walk was not tried.'
    : trace.queryAnalysis?.route === 'direct'
      ? 'The question looked answerable from a single chunk, so the graph walk was not used.'
      : ''
  const oneStep = final.filter((entry) => entry.via).length
  if (oneStep) {
    return {
      ...base,
      helped: true,
      title: 'How the graph was used',
      summary:
        `Followed shared names one step, which brought in ${oneStep} of the ${plural(final.length, 'snippet')} used. ${why}`.trim(),
      showRoute: false,
    }
  }
  if (facts) {
    return {
      ...base,
      helped: true,
      title: 'How the graph was used',
      summary: why,
      showRoute: false,
    }
  }
  return why
    ? {
        ...base,
        helped: false,
        title: 'Search only',
        summary: why,
        showRoute: false,
      }
    : null
}
