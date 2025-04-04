import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { WorkflowStep } from './WorkflowStep'
import { FormTouched, FormValues, Step } from '@/redux/types/workflow'
import { FormikErrors } from 'formik'

interface WorkflowStepsProps {
  steps: Step[]
  setSteps: (steps: Step[]) => void
  errors: FormikErrors<FormValues>
  touched: FormTouched
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
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
      { prompt: null, file: null, llm: null, order: newOrder },
    ]
    setSteps(newSteps)
  }

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    newSteps.forEach((step, i) => (step.order = i + 1))
    setSteps(newSteps)
  }

  const handleMoveStep = (from: number, to: number) => {
    const newSteps = [...steps]
    const [movedStep] = newSteps.splice(from, 1)
    newSteps.splice(to, 0, movedStep)
    newSteps.forEach((step, i) => (step.order = i + 1))
    setSteps(newSteps)
  }

  const handleChangeStep = (index: number, field: string, value: unknown) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const stepErrors = errors.steps as Array<{ prompt?: string }> | undefined

  return (
    <div className='space-y-4 pt-4 border-t'>
      <div className='flex justify-between items-center'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleAddStep}
          className='flex items-center'
        >
          <Plus className='h-4 w-4 mr-1' />
          Add Step
        </Button>
      </div>

      <div className='space-y-3'>
        {steps.length === 0 ? (
          <div className='text-center py-8 border border-dashed rounded-md text-gray-500'>
            No steps added yet. Click "Add Step" to begin.
          </div>
        ) : (
          steps.map((step, index) => (
            <WorkflowStep
              key={`step-${step.id || `new-${index}`}`}
              index={index}
              step={step}
              prompts={prompts}
              files={files}
              llms={llms}
              onRemove={() => handleRemoveStep(index)}
              onMove={(dir) => {
                if (dir === 'up' && index > 0) {
                  handleMoveStep(index, index - 1)
                } else if (dir === 'down' && index < steps.length - 1) {
                  handleMoveStep(index, index + 1)
                }
              }}
              onChange={(field, value) => handleChangeStep(index, field, value)}
              error={stepErrors?.[index]}
              touched={touched.steps?.[index]}
              totalSteps={steps.length}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default WorkflowSteps
