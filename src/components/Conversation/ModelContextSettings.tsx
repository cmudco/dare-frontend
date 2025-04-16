import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
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

interface ModelContextSettingsProps {
  onClose: () => void
}

const ModelContextSettings: React.FC<ModelContextSettingsProps> = ({
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const maxContextSnippets = useSelector(
    (state: RootState) =>
      state.conversation.maxContextSnippets ?? MODEL_CONFIG.maxContextSnippets
  )
  const documentSimilarityThreshold = useSelector(
    (state: RootState) =>
      state.conversation.documentSimilarityThreshold ??
      MODEL_CONFIG.documentSimilarityThreshold
  )

  const handleMaxContextSnippetsChange = (value: number) => {
    dispatch(updateMaxContextSnippets(value))
  }

  const handleDocumentSimilarityThresholdChange = (value: string) => {
    const threshold = parseFloat(value)
    dispatch(updateDocumentSimilarityThreshold(threshold))
  }

  const handleResetMaxContextSnippets = () => {
    dispatch(updateMaxContextSnippets(MODEL_CONFIG.maxContextSnippets))
  }

  const handleResetDocumentSimilarityThreshold = () => {
    dispatch(
      updateDocumentSimilarityThreshold(
        MODEL_CONFIG.documentSimilarityThreshold
      )
    )
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
            <span className='min-w-[30px] rounded-md border border-input bg-transparent px-2 py-1 text-center font-mono text-sm'>
              {maxContextSnippets}
            </span>
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
    </div>
  )
}

export default ModelContextSettings
