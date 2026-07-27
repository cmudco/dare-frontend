import React from 'react'
import type {
  ContextTraceStage,
  RetrievalTrace,
  RetrievalTraceEntry,
} from '@/redux/types/conversation'

/** The snippets a retrieval source actually kept for the prompt. */
const keptSnippets = (source: RetrievalTrace): RetrievalTraceEntry[] => {
  const entries = source.rerank.applied
    ? source.rerank.results
    : source.hybrid.topCandidates
  return entries.slice(0, source.finalSize)
}

/**
 * Calibrated rerank scores are tiny near-equal values (0.0002–0.006) — as
 * numbers they read as garbage ("0.000"), so the row shows one only when it
 * carries meaning (naive similarity scores, ~0.2–0.9). The relative bar
 * always communicates ranking.
 */
const MIN_MEANINGFUL_SCORE = 0.01

interface SnippetRowProps {
  rank: number
  refLabel: string
  preview: string
  score: number
  /** Highest score among the displayed set — bar widths are relative to it. */
  maxScore: number
}

/** One kept snippet, one compact line: rank, source, preview, relevance bar. */
const SnippetRow: React.FC<SnippetRowProps> = ({
  rank,
  refLabel,
  preview,
  score,
  maxScore,
}) => {
  const ratio = maxScore > 0 ? Math.min(1, Math.max(0, score / maxScore)) : 0
  return (
    <div className='flex items-center gap-2 py-0.5 text-xs leading-tight'>
      <span className='w-4 shrink-0 text-right font-mono text-muted-foreground'>
        {rank}.
      </span>
      <span className='max-w-[30%] shrink-0 truncate font-medium text-foreground'>
        {refLabel}
      </span>
      <span className='min-w-0 flex-1 truncate text-muted-foreground'>
        {preview}
      </span>
      <span className='h-1 w-12 shrink-0 overflow-hidden rounded-full bg-border'>
        <span
          className='block h-full rounded-full bg-primary'
          style={{ width: `${Math.max(4, Math.round(ratio * 100))}%` }}
        />
      </span>
      {score >= MIN_MEANINGFUL_SCORE && (
        <span className='w-9 shrink-0 text-right font-mono text-muted-foreground tabular-nums'>
          {score.toFixed(2)}
        </span>
      )}
    </div>
  )
}

/** Snippets an advanced retrieval source kept, with the pool→kept header. */
export const SourceSnippets: React.FC<{ source: RetrievalTrace }> = ({
  source,
}) => {
  const label = source.source === 'libraries' ? 'Shared libraries' : 'Documents'
  const kept = keptSnippets(source)
  const maxScore = Math.max(0, ...kept.map((entry) => entry.score))
  return (
    <div className='mt-1.5 space-y-0.5'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span>{label}</span>
        <span className='tabular-nums'>
          pool {source.hybrid.poolSize} → kept {source.finalSize}
        </span>
      </div>
      {kept.map((entry, index) => (
        <SnippetRow
          key={`${entry.sourceRef}-${entry.chunkIndex}`}
          rank={index + 1}
          refLabel={entry.sourceRef}
          preview={entry.preview}
          score={entry.score}
          maxScore={maxScore}
        />
      ))}
    </div>
  )
}

/** Naive mode's kept snippets (persisted rows; no pipeline trace). */
export const NaiveSnippets: React.FC<{
  snippets: NonNullable<ContextTraceStage['snippets']>
}> = ({ snippets }) => {
  const maxScore = Math.max(0, ...snippets.map((snippet) => snippet.score))
  return (
    <div className='mt-1.5 space-y-0.5'>
      {snippets.map((snippet, index) => (
        <SnippetRow
          key={index}
          rank={index + 1}
          refLabel={snippet.ref}
          preview={snippet.preview}
          score={snippet.score}
          maxScore={maxScore}
        />
      ))}
    </div>
  )
}
