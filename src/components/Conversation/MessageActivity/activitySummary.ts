import { addedByGraph } from '@/components/Conversation/graphUsage'
import type {
  ContextTrace,
  ContextTraceStage,
  RetrievalTrace,
} from '@/redux/types/conversation'

export const formatMs = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`

export const formatChars = (chars: number): string =>
  chars >= 1000 ? `${Math.round(chars / 1000)}k chars` : `${chars} chars`

/**
 * The searches behind a retrieval stage. In Autonomous mode the model runs
 * them as tool calls, so the stage has none of its own.
 */
export const stageSources = (
  stage: ContextTraceStage,
  toolSearches: RetrievalTrace[]
): RetrievalTrace[] => (stage.sources?.length ? stage.sources : toolSearches)

/** Kept snippets across advanced sources AND the naive snippet list. */
export const keptSnippetCount = (
  stage: ContextTraceStage,
  toolSearches: RetrievalTrace[] = []
): number => {
  const fromSources = stageSources(stage, toolSearches).reduce(
    (total, source) => total + source.finalSize,
    0
  )
  return fromSources + (stage.snippets?.length ?? 0)
}

/** Short facts for the panel's summary line ("4 snippets · 2 files · …"). */
export const contextSummaryPieces = (
  trace: ContextTrace,
  toolSearches: RetrievalTrace[]
): string[] => {
  const pieces: string[] = []
  for (const stage of trace.stages) {
    if (stage.kind === 'retrieval') {
      const kept = keptSnippetCount(stage, toolSearches)
      if (kept) pieces.push(`${kept} snippet${kept === 1 ? '' : 's'}`)
      const linked = stageSources(stage, toolSearches).reduce(
        (total, source) => total + addedByGraph(source),
        0
      )
      if (linked) pieces.push(`${linked} added by the graph`)
    }
    if (stage.kind === 'files' && stage.files?.length) {
      pieces.push(
        `${stage.files.length} file${stage.files.length === 1 ? '' : 's'}`
      )
    }
    if (stage.kind === 'memory' && stage.count) {
      pieces.push(`${stage.count} memor${stage.count === 1 ? 'y' : 'ies'}`)
    }
    if (stage.kind === 'history' && stage.turns) {
      pieces.push(`${stage.turns} turn${stage.turns === 1 ? '' : 's'}`)
    }
  }
  return pieces
}
