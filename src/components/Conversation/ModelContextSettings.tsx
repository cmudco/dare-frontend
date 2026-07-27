import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
  updateRagMode,
} from '../../redux/conversationSlice'
import { MODEL_CONFIG } from '../../config/modelConfig'
import { Check, DatabaseZap, Info, RotateCcw, X } from 'lucide-react'
import { updateConversation } from '@/redux/asyncThunks/conversation'
import { RagMode } from '@/redux/types/conversation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'
import RagModeSelector from './RagModeSelector'

interface ModelContextSettingsProps {
  onClose: () => void
}

const MIN_SNIPPETS = 1
const MAX_SNIPPETS = 20
const SAVE_DEBOUNCE_MS = 600

/** Same vocabulary as the mode cards. */
const MODE_LABELS: Record<RagMode, string> = {
  [RagMode.NAIVE]: 'Fast',
  [RagMode.ADVANCED]: 'Thorough',
  [RagMode.AGENTIC]: 'Autonomous',
}

type SettingsUpdates = Partial<{
  maxContextSnippets: number
  documentSimilarityThreshold: number
  ragMode: RagMode
}>

const ModelContextSettings: React.FC<ModelContextSettingsProps> = ({
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const maxContextSnippets =
    activeConversation?.maxContextSnippets ?? MODEL_CONFIG.maxContextSnippets
  const documentSimilarityThreshold =
    activeConversation?.documentSimilarityThreshold ??
    MODEL_CONFIG.documentSimilarityThreshold
  const ragMode = activeConversation?.ragMode ?? RagMode.ADVANCED

  const [snippetInput, setSnippetInput] = React.useState(
    maxContextSnippets.toString()
  )
  const [showSaved, setShowSaved] = React.useState(false)

  React.useEffect(() => {
    setSnippetInput(maxContextSnippets.toString())
  }, [maxContextSnippets])

  // One debounced PATCH per burst of changes: rapid +/+/+ clicks or slider
  // drags merge into a single updateConversation call.
  const pendingRef = React.useRef<SettingsUpdates>({})
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout>>()
  const savedTimerRef = React.useRef<ReturnType<typeof setTimeout>>()

  const flushSave = React.useCallback(() => {
    const updates = pendingRef.current
    pendingRef.current = {}
    if (!activeConversation || Object.keys(updates).length === 0) return
    dispatch(
      updateConversation({
        conversationId: activeConversation.conversationId,
        updates,
      })
    ).then(() => {
      setShowSaved(true)
      clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setShowSaved(false), 1600)
    })
  }, [activeConversation, dispatch])

  const queueSave = React.useCallback(
    (updates: SettingsUpdates) => {
      pendingRef.current = { ...pendingRef.current, ...updates }
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
    },
    [flushSave]
  )

  // Unsaved changes must not die with the panel: flush on unmount.
  React.useEffect(
    () => () => {
      clearTimeout(saveTimerRef.current)
      clearTimeout(savedTimerRef.current)
      flushSave()
    },
    [flushSave]
  )

  const setSnippets = (value: number) => {
    const clamped = Math.min(MAX_SNIPPETS, Math.max(MIN_SNIPPETS, value))
    dispatch(updateMaxContextSnippets(clamped))
    queueSave({ maxContextSnippets: clamped })
  }

  const setThreshold = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value))
    dispatch(updateDocumentSimilarityThreshold(clamped))
    queueSave({ documentSimilarityThreshold: clamped })
  }

  const setMode = (value: RagMode) => {
    dispatch(updateRagMode(value))
    queueSave({ ragMode: value })
  }

  const handleSnippetInputBlur = () => {
    const parsed = parseInt(snippetInput, 10)
    if (Number.isNaN(parsed)) {
      setSnippetInput(maxContextSnippets.toString())
      return
    }
    setSnippets(parsed)
  }

  const isTopK = documentSimilarityThreshold === 0
  const summaryDetail =
    ragMode === RagMode.AGENTIC
      ? 'Searches on demand and refines across rounds'
      : isTopK
        ? `Top ${maxContextSnippets} snippets by score · no similarity filter`
        : `Up to ${maxContextSnippets} snippets · similarity ≥ ${documentSimilarityThreshold.toFixed(2)}`

  const snippetsAtDefault =
    maxContextSnippets === MODEL_CONFIG.maxContextSnippets
  const thresholdAtDefault =
    documentSimilarityThreshold === MODEL_CONFIG.documentSimilarityThreshold

  return (
    <TooltipProvider>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md font-semibold'>Vector database settings</h3>
          <div className='flex items-center gap-2'>
            <span
              className={`flex items-center gap-1 text-xs text-green-600 transition-opacity duration-300 dark:text-green-400 ${showSaved ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={!showSaved}
            >
              <Check className='h-3.5 w-3.5' />
              Saved
            </span>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              aria-label='Close settings'
              className='h-6 w-6'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Live summary of what retrieval will do with the current values */}
        <div className='flex items-center gap-3 rounded-lg border border-border/60 bg-muted/50 p-3'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-xs ring-1 ring-border/60'>
            <DatabaseZap className='h-4 w-4' />
          </span>
          <div className='min-w-0 leading-tight'>
            <p className='font-medium text-foreground'>
              {MODE_LABELS[ragMode]} retrieval
            </p>
            <p className='mt-1 text-xs leading-snug text-muted-foreground'>
              {summaryDetail}
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <h4 className='font-semibold'>Retrieval mode</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-sm'>
                  <p className='text-sm'>
                    Fast uses dense lookup. Thorough adds query analysis, hybrid
                    retrieval, rerank, grounding, and trace data. Autonomous
                    lets the model search your documents itself — issuing and
                    refining retrieval queries as tool calls across rounds.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RagModeSelector value={ragMode} onChange={setMode} />
          </div>

          <hr />

          <div className='space-y-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <h4 className='font-semibold'>Context snippets</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm'>
                    <div className='space-y-2'>
                      <p className='font-semibold'>
                        {TOOLTIP_CONTENT.modelContext.maxSnippets.title}
                      </p>
                      <p className='text-sm'>
                        {TOOLTIP_CONTENT.modelContext.maxSnippets.description}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={() => setSnippets(maxContextSnippets - 1)}
                  disabled={maxContextSnippets <= MIN_SNIPPETS}
                  aria-label='Fewer snippets'
                >
                  -
                </Button>
                <Input
                  type='number'
                  min={MIN_SNIPPETS}
                  max={MAX_SNIPPETS}
                  value={snippetInput}
                  onChange={(e) =>
                    setSnippetInput(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  onBlur={handleSnippetInputBlur}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.target as HTMLInputElement).blur()
                  }
                  className='hide-number-arrows h-8 w-14 text-center font-mono text-sm'
                  aria-label='Max context snippets'
                  inputMode='numeric'
                />
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={() => setSnippets(maxContextSnippets + 1)}
                  disabled={maxContextSnippets >= MAX_SNIPPETS}
                  aria-label='More snippets'
                >
                  +
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setSnippets(MODEL_CONFIG.maxContextSnippets)}
                  disabled={snippetsAtDefault}
                  aria-label='Reset context snippets to default'
                >
                  <RotateCcw className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Recommended: {MODEL_CONFIG.maxContextSnippets} — more snippets add
              context but slow the turn and cost more.
            </p>
          </div>

          <hr />

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <h4 className='font-semibold'>Similarity threshold</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm'>
                    <div className='space-y-2'>
                      <p className='font-semibold'>
                        {TOOLTIP_CONTENT.modelContext.similarityThreshold.title}
                      </p>
                      <p className='text-sm'>
                        {
                          TOOLTIP_CONTENT.modelContext.similarityThreshold
                            .description
                        }
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='flex items-center gap-1'>
                <span className='font-mono text-sm text-muted-foreground tabular-nums'>
                  {isTopK
                    ? 'Off — top-K'
                    : documentSimilarityThreshold.toFixed(2)}
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() =>
                    setThreshold(MODEL_CONFIG.documentSimilarityThreshold)
                  }
                  disabled={thresholdAtDefault}
                  aria-label='Reset similarity threshold to default'
                >
                  <RotateCcw className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
            <Slider
              value={[documentSimilarityThreshold]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([value]) => setThreshold(value)}
              aria-label='Similarity threshold'
            />
            <p className='text-xs text-muted-foreground'>
              Snippets scoring below this are dropped. Slide to 0 to keep the
              top {maxContextSnippets} regardless of score.
            </p>
          </div>
        </div>

        <style>{`
        input.hide-number-arrows::-webkit-outer-spin-button,
        input.hide-number-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.hide-number-arrows[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
      </div>
    </TooltipProvider>
  )
}

export default ModelContextSettings
