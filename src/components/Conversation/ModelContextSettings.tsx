import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
} from '../../redux/conversationSlice'
import { MODEL_CONFIG } from '../../config/modelConfig'
import { RotateCw, X, Info } from 'lucide-react'
import { updateConversation } from '@/redux/asyncThunks/conversation'
import VectorDatabaseInfoBanner from './VectorDatabaseInfoBanner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

interface ModelContextSettingsProps {
  onClose: () => void
}

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

  const [snippetInput, setSnippetInput] = React.useState(
    maxContextSnippets.toString()
  )
  const [thresholdInput, setThresholdInput] = React.useState(
    documentSimilarityThreshold.toString()
  )

  React.useEffect(() => {
    setSnippetInput(maxContextSnippets.toString())
  }, [maxContextSnippets])

  React.useEffect(() => {
    setThresholdInput(documentSimilarityThreshold.toString())
  }, [documentSimilarityThreshold])

  const handleMaxContextSnippetsChange = (value: number) => {
    dispatch(updateMaxContextSnippets(value))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { maxContextSnippets: value },
        })
      )
    }
  }

  const handleSnippetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setSnippetInput(val)
  }

  const handleSnippetInputBlur = () => {
    const num = Math.max(1, parseInt(snippetInput, 10) || 1)
    if (num !== maxContextSnippets) {
      handleMaxContextSnippetsChange(num)
    } else {
      setSnippetInput(num.toString())
    }
  }

  const handleSnippetInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const handleThresholdInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value.replace(/[^0-9.]/g, '')
    setThresholdInput(val)
  }

  const handleThresholdInputBlur = () => {
    const num = Math.max(0, Math.min(1, parseFloat(thresholdInput) || 0))
    if (num !== documentSimilarityThreshold) {
      handleDocumentSimilarityThresholdChange(num.toString())
    } else {
      setThresholdInput(num.toString())
    }
  }

  const handleThresholdInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const handleDocumentSimilarityThresholdChange = (value: string) => {
    const threshold = parseFloat(value)
    dispatch(updateDocumentSimilarityThreshold(threshold))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { documentSimilarityThreshold: threshold },
        })
      )
    }
  }

  const handleResetMaxContextSnippets = () => {
    dispatch(updateMaxContextSnippets(MODEL_CONFIG.maxContextSnippets))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { maxContextSnippets: MODEL_CONFIG.maxContextSnippets },
        })
      )
    }
  }

  const handleResetDocumentSimilarityThreshold = () => {
    dispatch(
      updateDocumentSimilarityThreshold(
        MODEL_CONFIG.documentSimilarityThreshold
      )
    )
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: {
            documentSimilarityThreshold:
              MODEL_CONFIG.documentSimilarityThreshold,
          },
        })
      )
    }
  }

  return (
    <TooltipProvider>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md font-semibold'>Vector Database Settings</h3>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            aria-label='Close Settings'
            className='h-6 w-6'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {/* Dynamic Info Banner */}
        <VectorDatabaseInfoBanner
          maxContextSnippets={maxContextSnippets}
          documentSimilarityThreshold={documentSimilarityThreshold}
        />

        <hr />
        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <h4 className='font-semibold'>
                  Max Context Snippets (Recommended:{' '}
                  {MODEL_CONFIG.maxContextSnippets})
                </h4>
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
                      <p className='text-xs text-muted-foreground'>
                        💡 {TOOLTIP_CONTENT.modelContext.maxSnippets.tip}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleResetMaxContextSnippets}
                aria-label='Reset Max Context Snippets'
              >
                <RotateCw className='h-4 w-4' />
              </Button>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                className='h-auto px-2 py-1'
                onClick={() =>
                  handleMaxContextSnippetsChange(
                    Math.max(1, maxContextSnippets - 1)
                  )
                }
              >
                -
              </Button>
              <Input
                type='number'
                min={1}
                value={snippetInput}
                onChange={handleSnippetInputChange}
                onBlur={handleSnippetInputBlur}
                onKeyDown={handleSnippetInputKeyDown}
                className='hide-number-arrows h-8 w-16 text-center font-mono text-sm focus:outline-hidden focus-visible:outline-hidden'
                aria-label='Max Context Snippets'
                inputMode='numeric'
                pattern='[0-9]*'
              />
              <Button
                variant='outline'
                className='h-auto px-2 py-1'
                onClick={() =>
                  handleMaxContextSnippetsChange(maxContextSnippets + 1)
                }
              >
                +
              </Button>
            </div>
          </div>
          <hr />
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <h4 className='font-semibold'>Document Similarity threshold</h4>
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
                      <p className='text-xs text-muted-foreground'>
                        💡{' '}
                        {TOOLTIP_CONTENT.modelContext.similarityThreshold.tip}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleResetDocumentSimilarityThreshold}
                aria-label='Reset Document Similarity Threshold'
              >
                <RotateCw className='h-4 w-4' />
              </Button>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                className='h-auto px-2 py-1'
                onClick={() =>
                  handleDocumentSimilarityThresholdChange(
                    Math.max(0, documentSimilarityThreshold - 0.1).toFixed(1)
                  )
                }
              >
                -
              </Button>
              <Input
                type='number'
                min={0}
                max={1}
                step={0.01}
                value={thresholdInput}
                onChange={handleThresholdInputChange}
                onBlur={handleThresholdInputBlur}
                onKeyDown={handleThresholdInputKeyDown}
                className='hide-number-arrows h-8 w-20 text-center font-mono text-sm focus:outline-hidden focus-visible:outline-hidden'
                aria-label='Document Similarity Threshold'
                inputMode='decimal'
              />
              <Button
                variant='outline'
                className='h-auto px-2 py-1'
                onClick={() =>
                  handleDocumentSimilarityThresholdChange(
                    Math.min(1, documentSimilarityThreshold + 0.1).toFixed(1)
                  )
                }
              >
                +
              </Button>
            </div>
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
        input.hide-number-arrows:focus,
        input.hide-number-arrows:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      </div>
    </TooltipProvider>
  )
}

export default ModelContextSettings
