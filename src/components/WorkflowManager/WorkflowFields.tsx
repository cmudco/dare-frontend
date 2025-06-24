import React from 'react'
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'
import { WORKFLOW_MODES } from '../../utils/constants/workflows'
import { ListOrdered, Layers, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { Button } from '../ui/button'
import { WorkflowFieldsProps } from '@/redux/types/workflow'

const WorkflowFields: React.FC<WorkflowFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  isEditMode,
}) => (
  <>
    <DialogHeader>
      <DialogTitle className='text-left text-lg font-semibold text-gray-900 dark:text-white'>
        {isEditMode ? 'Edit Workflow' : 'Create New Workflow'}
      </DialogTitle>
      <DialogDescription className='text-sm text-gray-500 dark:text-gray-400'>
        {isEditMode
          ? 'Update your workflow details and steps below.'
          : 'Create steps first, then save your workflow.'}
      </DialogDescription>
    </DialogHeader>

    <div className='space-y-2'>
      <Label htmlFor='title'>Title</Label>
      <Input
        id='title'
        name='title'
        value={values.title}
        onChange={handleChange}
        placeholder='Enter workflow title'
        className={errors.title && touched.title ? 'border-red-500' : ''}
      />
      {errors.title && touched.title && (
        <p className='mt-1 text-xs text-red-500'>{errors.title}</p>
      )}
    </div>

    <div className='space-y-2'>
      <Label htmlFor='description'>Description</Label>
      <Textarea
        id='description'
        name='description'
        value={values.description}
        onChange={handleChange}
        placeholder='Enter your description here.'
        className={
          errors.description && touched.description ? 'border-red-500' : ''
        }
        maxLength={500}
        rows={3}
      />
      <div className='flex justify-between'>
        {errors.description && touched.description ? (
          <p className='text-xs text-red-500'>{errors.description}</p>
        ) : (
          <span />
        )}
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {values.description.length}/500
        </span>
      </div>
    </div>

    <TooltipProvider>
      <div className='space-y-2'>
        <Label htmlFor='mode'>Mode</Label>
        <Select
          value={values.mode ? values.mode.toString() : ''}
          onValueChange={(value) => setFieldValue('mode', parseInt(value))}
        >
          <SelectTrigger className='w-full bg-background dark:border-gray-700 dark:text-white'>
            <SelectValue placeholder='Select Mode' />
          </SelectTrigger>
          <SelectContent
            position='popper'
            className='z-50 bg-background dark:border-gray-700'
          >
            {WORKFLOW_MODES.map((mode) => (
              <SelectItem
                key={mode.id}
                value={mode.id.toString()}
                className='dark:text-white dark:hover:bg-white/10'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center'>
                    {mode.id === 1 ? (
                      <ListOrdered className='mr-2 h-4 w-4' />
                    ) : (
                      <Layers className='mr-2 h-4 w-4' />
                    )}
                    <span>{mode.name}</span>
                  </div>

                  <Tooltip delayDuration={100}>
                    <TooltipTrigger
                      asChild
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='ml-2 h-6 w-6 flex-shrink-0 p-0'
                      >
                        <HelpCircle className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='z-[60] rounded-md border bg-background bg-gray-900 p-2 text-white dark:border-gray-700'
                    >
                      <p className='w-[280px] text-xs'>
                        {mode.id === 1
                          ? 'Tasks execute one after another, ensuring each step completes before the next begins.'
                          : 'Tasks execute simultaneously, allowing multiple steps to run concurrently for faster processing.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.mode && touched.mode && (
          <p className='mt-1 text-xs text-red-500'>{errors.mode}</p>
        )}
      </div>
    </TooltipProvider>
  </>
)

export default WorkflowFields
