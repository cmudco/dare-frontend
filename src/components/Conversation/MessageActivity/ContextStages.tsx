import React from 'react'
import {
  Brain,
  FileText,
  History,
  Image,
  MessagesSquare,
  ScrollText,
  Search,
  Wrench,
} from 'lucide-react'
import { RagMode } from '@/utils/constants/conversation'
import type { ContextTraceStage } from '@/redux/types/conversation'
import { StepHeader } from '../Timeline'
import { formatChars, formatMs, keptSnippetCount } from './activitySummary'
import { NaiveSnippets, SourceSnippets } from './SnippetList'

/** Same vocabulary as the retrieval-mode cards in settings. */
const MODE_LABELS: Record<string, string> = {
  [RagMode.NAIVE]: 'Fast',
  [RagMode.ADVANCED]: 'Thorough',
  [RagMode.AGENTIC]: 'Autonomous',
}

const STAGE_ICONS: Record<ContextTraceStage['kind'], React.ReactNode> = {
  prompt: <ScrollText className='h-3.5 w-3.5' />,
  referencedConversations: <MessagesSquare className='h-3.5 w-3.5' />,
  summaries: <FileText className='h-3.5 w-3.5' />,
  files: <FileText className='h-3.5 w-3.5' />,
  retrieval: <Search className='h-3.5 w-3.5' />,
  memory: <Brain className='h-3.5 w-3.5' />,
  history: <History className='h-3.5 w-3.5' />,
  media: <Image className='h-3.5 w-3.5' />,
  tools: <Wrench className='h-3.5 w-3.5' />,
}

const stageTitle = (stage: ContextTraceStage): string => {
  switch (stage.kind) {
    case 'prompt':
      return 'System prompt'
    case 'referencedConversations':
      return 'Referenced conversations'
    case 'summaries':
      return 'Conversation summaries'
    case 'files':
      return 'Files read in full'
    case 'retrieval':
      return 'Document retrieval'
    case 'memory':
      return 'Memories recalled'
    case 'history':
      return 'Conversation history'
    case 'media':
      return 'Media attached'
    case 'tools':
      return 'Tools available'
  }
}

const stageDetail = (stage: ContextTraceStage): string => {
  switch (stage.kind) {
    case 'prompt':
      return stage.chars != null ? formatChars(stage.chars) : ''
    case 'referencedConversations':
    case 'summaries':
    case 'memory':
    case 'media':
    case 'tools':
      return stage.count != null ? `${stage.count}` : ''
    case 'files':
      return `${stage.files?.length ?? 0}`
    case 'retrieval': {
      const mode = MODE_LABELS[stage.mode ?? ''] ?? stage.mode ?? ''
      if (stage.mode === RagMode.AGENTIC) {
        return `${mode} — the model searches on demand`
      }
      const kept = keptSnippetCount(stage)
      const filter =
        stage.threshold && stage.threshold > 0
          ? `≥ ${stage.threshold.toFixed(2)}`
          : `top ${stage.topK ?? ''}`
      return `${mode} · ${kept} snippet${kept === 1 ? '' : 's'} · ${filter}`
    }
    case 'history':
      return stage.turns != null
        ? `${stage.turns} turn${stage.turns === 1 ? '' : 's'}`
        : ''
  }
}

export interface ActivityStep {
  key: string
  icon: React.ReactNode
  content: React.ReactNode
}

/**
 * Context-assembly stages as timeline steps: title + settings detail on the
 * left, elapsed time on the right; files list name/size sub-rows and
 * retrieval lists the kept snippets with relative score bars.
 */
export const contextStageSteps = (
  stages: ContextTraceStage[]
): ActivityStep[] =>
  stages.map((stage) => ({
    key: `context-${stage.kind}`,
    icon: STAGE_ICONS[stage.kind],
    content: (
      <>
        <div className='flex min-w-0 items-start justify-between gap-2'>
          <StepHeader title={stageTitle(stage)}>
            <span className='font-normal text-muted-foreground'>
              {stageDetail(stage)}
            </span>
          </StepHeader>
          <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
            {formatMs(stage.ms)}
          </span>
        </div>

        {stage.kind === 'files' && stage.files && (
          <div className='mt-1.5 space-y-0.5'>
            {stage.files.map((file) => (
              <div
                key={file.name}
                className='flex items-center justify-between gap-2 text-xs text-muted-foreground'
              >
                <span className='min-w-0 truncate'>{file.name}</span>
                <span className='shrink-0 tabular-nums'>
                  {formatChars(file.chars)}
                </span>
              </div>
            ))}
          </div>
        )}

        {stage.kind === 'retrieval' &&
          stage.sources?.map((source, sourceIndex) => (
            <SourceSnippets key={sourceIndex} source={source} />
          ))}

        {stage.kind === 'retrieval' && stage.snippets && (
          <NaiveSnippets snippets={stage.snippets} />
        )}
      </>
    ),
  }))
