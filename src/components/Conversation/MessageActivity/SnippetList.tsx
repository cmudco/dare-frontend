import React from 'react'
import {
  hopVerb,
  type ContextTraceStage,
  type RetrievalTrace,
  type RetrievalTraceEntry,
} from '@/redux/types/conversation'

/**
 * Hide numeric labels that round to zero; relative bars still show ranking.
 * These relevance scores are not probabilities of answer correctness.
 */
const MIN_MEANINGFUL_SCORE = 0.01

interface SnippetRowProps {
  rank: number
  citationId?: string | null
  refLabel: string
  preview: string
  score: number
  /** Highest score among the displayed set — bar widths are relative to it. */
  maxScore: number
  /** "p. 212 · 7.3 Open addressing" when the backend knows it. */
  location?: string
  via?: string | null
  viaKind?: string | null
}

/** One kept snippet, one compact line: rank, source, preview, relevance bar. */
const SnippetRow: React.FC<SnippetRowProps> = ({
  rank,
  citationId,
  refLabel,
  preview,
  score,
  maxScore,
  location,
  via,
  viaKind,
}) => {
  const ratio = maxScore > 0 ? Math.min(1, Math.max(0, score / maxScore)) : 0
  return (
    <div className='py-0.5 text-xs leading-tight'>
      <div className='flex items-center gap-2'>
        <span className='min-w-4 shrink-0 text-right font-mono text-muted-foreground'>
          {citationId ? `[${citationId}]` : `${rank}.`}
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
      {(location || via) && (
        <div className='ml-6 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground'>
          {location && <span>{location}</span>}
          {via && (
            <span className='rounded-full bg-primary/10 px-1.5 text-primary'>
              {hopVerb(viaKind)} "{via}"
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const locationOf = (entry: RetrievalTraceEntry): string | undefined => {
  const parts = [
    entry.pageNo != null ? `p. ${entry.pageNo}` : '',
    entry.section ?? '',
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : undefined
}

/** Snippets an advanced retrieval source kept, with the pool→kept header. */
export const SourceSnippets: React.FC<{ source: RetrievalTrace }> = ({
  source,
}) => {
  const label = source.source === 'libraries' ? 'Shared libraries' : 'Documents'
  const kept = source.finalEvidence ?? []
  const maxScore = Math.max(0, ...kept.map((entry) => entry.score))
  return (
    <div className='mt-1.5 space-y-0.5'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span>{label}</span>
        <span className='tabular-nums'>
          pool {source.hybrid.poolSize} → kept {source.finalSize}
        </span>
      </div>
      {source.finalEvidence === undefined && (
        <p className='text-xs text-muted-foreground'>
          Final evidence was not recorded for this older response.
        </p>
      )}
      {kept.map((entry, index) => (
        <SnippetRow
          key={`${entry.sourceRef}-${entry.chunkIndex}`}
          rank={index + 1}
          citationId={entry.citationId}
          refLabel={entry.sourceRef}
          preview={entry.preview}
          score={entry.score}
          maxScore={maxScore}
          location={locationOf(entry)}
          via={entry.via}
          viaKind={entry.viaKind}
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
