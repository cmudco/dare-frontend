import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { MODEL_CONFIG } from '../../config/modelConfig'
import { RotateCw } from 'lucide-react'
import { Step } from '@/redux/types/workflow'

interface WorkflowEmbeddingSettingsProps {
  step: Step
  onChange: (field: keyof Step, value: unknown) => void
}

const WorkflowEmbeddingSettings: React.FC<WorkflowEmbeddingSettingsProps> = ({
  step,
  onChange,
}) => {
  const maxContextSnippets =
    step.maxContextSnippets ?? MODEL_CONFIG.maxContextSnippets
  const documentSimilarityThreshold =
    step.documentSimilarityThreshold ?? MODEL_CONFIG.documentSimilarityThreshold

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
    onChange('maxContextSnippets', value)
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
    onChange('documentSimilarityThreshold', threshold)
  }

  const handleResetMaxContextSnippets = () => {
    onChange('maxContextSnippets', MODEL_CONFIG.maxContextSnippets)
  }

  const handleResetDocumentSimilarityThreshold = () => {
    onChange(
      'documentSimilarityThreshold',
      MODEL_CONFIG.documentSimilarityThreshold
    )
  }

  return (
    <div className='space-y-4 rounded-md p-4'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-medium'>Embedding Settings</h4>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>
              Max Context Snippets (Recommended:{' '}
              {MODEL_CONFIG.maxContextSnippets})
            </Label>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleResetMaxContextSnippets}
              aria-label='Reset Max Context Snippets'
              className='h-6 w-6'
            >
              <RotateCw className='h-3 w-3' />
            </Button>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              type='button'
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
              type='button'
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

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>
              Document Similarity Threshold
            </Label>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleResetDocumentSimilarityThreshold}
              aria-label='Reset Document Similarity Threshold'
              className='h-6 w-6'
            >
              <RotateCw className='h-3 w-3' />
            </Button>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              type='button'
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
              className='hide-number-arrows h-8 w-20 text-center font-mono text-sm focus:outline-none focus-visible:outline-none'
              aria-label='Document Similarity Threshold'
              inputMode='decimal'
            />
            <Button
              type='button'
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
  )
}

export default WorkflowEmbeddingSettings
