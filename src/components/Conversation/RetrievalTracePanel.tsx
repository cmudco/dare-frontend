import React from 'react'
import {
  ArrowUp,
  CornerDownRight,
  Search,
  ShieldCheck,
  Shuffle,
  Split,
  Trophy,
} from 'lucide-react'
import {
  hopVerb,
  RetrievalTrace,
  RetrievalTraceEntry,
} from '@/redux/types/conversation'
import { StepHeader, TimelineStep } from './Timeline'

interface RetrievalTraceStagesProps {
  trace: RetrievalTrace
}

const fmtScore = (score: number): string =>
  Math.abs(score) < 1 ? score.toFixed(3) : score.toFixed(2)

const EntryRow: React.FC<{
  entry: RetrievalTraceEntry
  showMove?: boolean
}> = ({ entry, showMove }) => {
  const climbed =
    showMove && entry.prevRank !== null && entry.prevRank > entry.rank
  return (
    <div className='flex min-w-0 items-start justify-between gap-2 py-0.5 text-xs'>
      <span className='min-w-0 flex-1 truncate text-muted-foreground'>
        <span className='text-foreground'>{entry.rank}.</span> {entry.sourceRef}
      </span>
      <span className='flex shrink-0 flex-wrap items-center justify-end gap-1.5'>
        {climbed && (
          <span className='flex items-center rounded bg-muted px-1 text-emerald-600 dark:text-emerald-400'>
            <ArrowUp className='h-3 w-3' />#{entry.prevRank}
          </span>
        )}
        <span className='font-mono text-muted-foreground'>
          {fmtScore(entry.score)}
        </span>
      </span>
    </div>
  )
}

const RetrievalTraceStages: React.FC<RetrievalTraceStagesProps> = ({
  trace,
}) => {
  if (!trace) return null

  // Build the list of stages that actually ran, so the timeline rail only
  // draws nodes (and connectors) for present stages.
  const steps: {
    key: string
    icon: React.ReactNode
    content: React.ReactNode
  }[] = []

  if (trace.queryAnalysis) {
    steps.push({
      key: 'query-analysis',
      icon: <Search className='h-3.5 w-3.5' />,
      content: (
        <>
          <StepHeader title='Query analysis' />
          <div className='mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5'>
            <span className='rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary'>
              {trace.queryAnalysis.intent}
            </span>
            {trace.queryAnalysis.keywords.map((kw) => (
              <span
                key={kw}
                className='max-w-full rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all text-muted-foreground'
              >
                {kw}
              </span>
            ))}
          </div>
          {trace.queryAnalysis.rewrittenQuery && (
            <div className='mt-2'>
              <div className='text-xs font-medium text-muted-foreground'>
                Rewritten query
              </div>
              <p className='mt-0.5 max-w-full text-xs [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-foreground'>
                {trace.queryAnalysis.rewrittenQuery}
              </p>
            </div>
          )}
          {trace.queryAnalysis.hydePassage && (
            <div className='mt-2'>
              <div className='text-xs font-medium text-muted-foreground'>
                Hypothetical answer · HyDE
              </div>
              <p className='mt-0.5 max-w-full rounded border-l-2 border-border bg-muted/50 px-2 py-1 text-xs [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-muted-foreground italic'>
                {trace.queryAnalysis.hydePassage}
              </p>
            </div>
          )}
        </>
      ),
    })
  }

  steps.push({
    key: 'hybrid',
    icon: <Shuffle className='h-3.5 w-3.5' />,
    content: (
      <>
        <StepHeader title='Hybrid retrieve'>
          <span className='font-normal text-muted-foreground'>
            · BM25 + dense + RRF · {trace.hybrid.poolSize} candidates
          </span>
        </StepHeader>
        <div className='mt-1 min-w-0 overflow-hidden'>
          {trace.hybrid.topCandidates.map((e) => (
            <EntryRow key={`h-${e.rank}`} entry={e} />
          ))}
        </div>
      </>
    ),
  })

  if (trace.expand?.applied) {
    steps.push({
      key: 'expand',
      icon: <CornerDownRight className='h-3.5 w-3.5' />,
      content: (
        <>
          <StepHeader title='Graph expand'>
            <span className='font-normal text-muted-foreground'>
              {trace.expand.added.length === 0
                ? '· nothing added'
                : `· added ${trace.expand.added.length} linked ${
                    trace.expand.added.length === 1 ? 'chunk' : 'chunks'
                  }`}
            </span>
          </StepHeader>
          {trace.expand.added.length > 0 && (
            <div className='mt-1 min-w-0 overflow-hidden'>
              {trace.expand.added.map((e) => {
                const locationParts = [
                  e.pageNo != null ? `p. ${e.pageNo}` : '',
                  e.section ?? '',
                  e.via ? `${hopVerb(e.viaKind)} "${e.via}"` : '',
                ].filter(Boolean)
                const locationLine = locationParts.join(' · ')

                return (
                  <div key={`x-${e.sourceRef}-${e.chunkIndex}`}>
                    <EntryRow entry={e} />
                    {locationLine && (
                      <div className='pl-4 text-[11px] text-muted-foreground'>
                        {locationLine}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      ),
    })
  }

  if (trace.rerank.applied && trace.rerank.results.length > 0) {
    steps.push({
      key: 'rerank',
      icon: <Trophy className='h-3.5 w-3.5' />,
      content: (
        <>
          <StepHeader title='Rerank'>
            <span className='font-normal text-muted-foreground'>
              · cross-encoder re-scored
            </span>
          </StepHeader>
          <div className='mt-1 min-w-0 overflow-hidden'>
            {trace.rerank.results.map((e) => (
              <EntryRow key={`r-${e.rank}`} entry={e} showMove />
            ))}
          </div>
        </>
      ),
    })
  }

  steps.push({
    key: 'mmr',
    icon: <Split className='h-3.5 w-3.5' />,
    content: (
      <StepHeader title='MMR'>
        <span className='font-normal text-muted-foreground'>
          · {trace.mmr.reason}
        </span>
      </StepHeader>
    ),
  })

  if (trace.grounding) {
    steps.push({
      key: 'grounding',
      icon: <ShieldCheck className='h-3.5 w-3.5' />,
      content: (
        <StepHeader title='Grounding'>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              trace.grounding.answerFound
                ? 'bg-muted text-emerald-600 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {trace.grounding.answerFound ? 'answer found' : 'not in sources'}
          </span>
          <span className='font-mono font-normal [overflow-wrap:anywhere] break-words text-muted-foreground'>
            top {fmtScore(trace.grounding.topScore)} /{' '}
            {trace.grounding.threshold} threshold
          </span>
        </StepHeader>
      ),
    })
  }

  return (
    <div className='min-w-0 overflow-hidden'>
      {steps.map((step, i) => (
        <TimelineStep
          key={step.key}
          icon={step.icon}
          isLast={i === steps.length - 1}
        >
          {step.content}
        </TimelineStep>
      ))}
    </div>
  )
}

export default RetrievalTraceStages
