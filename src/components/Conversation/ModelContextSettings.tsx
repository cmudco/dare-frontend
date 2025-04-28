import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
} from '../../redux/conversationSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { MODEL_CONFIG } from '../../config/modelConfig'
import { RotateCw, X } from 'lucide-react'
import { updateConversation } from '@/redux/aynscThunks/conversation'

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

  React.useEffect(() => {
    setSnippetInput(maxContextSnippets.toString())
  }, [maxContextSnippets])

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
      <hr />
      <div className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <h4 className='font-semibold'>
              Max Context Snippets (Recommended:{' '}
              {MODEL_CONFIG.maxContextSnippets})
            </h4>
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
              className='hide-number-arrows h-8 w-16 text-center font-mono text-sm focus:outline-none focus-visible:outline-none'
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
            <h4 className='font-semibold'>Document Similarity threshold</h4>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleResetDocumentSimilarityThreshold}
              aria-label='Reset Document Similarity Threshold'
            >
              <RotateCw className='h-4 w-4' />
            </Button>
          </div>
          <Select
            onValueChange={handleDocumentSimilarityThresholdChange}
            value={documentSimilarityThreshold.toString()}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select similarity threshold' />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='0.2'>Low (similarity score ≥ .20)</SelectItem>
              <SelectItem value='0.5'>
                Medium (similarity score ≥ .50)
              </SelectItem>
              <SelectItem value='0.8'>High (similarity score ≥ .80)</SelectItem>
            </SelectContent>
          </Select>
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
  )
}

export default ModelContextSettings
