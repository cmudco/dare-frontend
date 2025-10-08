// LEGACY COMPONENT - COMMENTED OUT TO PREVENT BUILD ERRORS
/*
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { Step, WorkflowStepsProps } from '@/redux/types/workflow'
import { FormikErrors, FormikTouched } from 'formik'
import { MODEL_CONFIG } from '@/config/modelConfig'
import { WorkflowCreateStep } from './WorkflowCreateStep'

const WorkflowAddSteps: React.FC<WorkflowStepsProps> = ({
  steps,
  setSteps,
  errors,
  touched,
}) => {
  const prompts = useSelector((state: RootState) => state.prompt.prompts)
  const files = useSelector((state: RootState) => state.files.files)
  const llms = useSelector(
    (state: RootState) => state.conversation.availableModels
  )

  const handleAddStep = () => {
    const newOrder =
      steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 1
    const newSteps = [
      ...steps,
      {
        prompt: null,
        files: [],
        embeddings: [],
        llm: null,
        order: newOrder,
        maxTokens: MODEL_CONFIG.maxTokens,
        temperature: MODEL_CONFIG.temperature,
        maxContextSnippets: MODEL_CONFIG.maxContextSnippets,
        documentSimilarityThreshold: MODEL_CONFIG.documentSimilarityThreshold,
      },
    ]
    setSteps(newSteps)
  }

  const handleStepChange = (
    index: number,
    field: keyof Step,
    value: unknown
  ) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const handleStepRemove = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      order: i + 1,
    }))
    setSteps(reorderedSteps)
  }

  const handleStepReorder = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) {
      return
    }

    const newSteps = [...steps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, movedStep)
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      order: i + 1,
    }))
    setSteps(reorderedSteps)
  }

  const stepErrors = errors.steps as FormikErrors<Step>[] | undefined
  const stepTouched = touched.steps as FormikTouched<Step>[] | undefined

  return (
    <div className='space-y-4 border-t pt-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-md font-medium text-foreground'>Steps</h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleAddStep}
          className='flex items-center gap-1.5'
        >
          <Plus className='h-4 w-4' />
          Add Step
        </Button>
      </div>

      <div className='space-y-3'>
        {steps.length === 0 ? (
          <div className='rounded-md border border-dashed border-border bg-muted py-10 text-center text-sm text-muted-foreground'>
            No steps added. Click "Add Step" to get started.
          </div>
        ) : (
          steps.map((step, index) => (
            <WorkflowCreateStep
              key={step.id || `new-step-${index}`}
              index={index}
              step={step}
              prompts={prompts}
              files={files}
              llms={llms}
              totalSteps={steps.length}
              onStepChange={handleStepChange}
              onStepRemove={handleStepRemove}
              onStepReorder={handleStepReorder}
              error={stepErrors?.[index]}
              touched={stepTouched?.[index]}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default WorkflowAddSteps
*/

// Export empty component to prevent import errors
const WorkflowAddSteps = () => null
export default WorkflowAddSteps
