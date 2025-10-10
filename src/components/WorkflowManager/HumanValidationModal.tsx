import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { PendingValidation } from '@/redux/types/workflow'

interface HumanValidationModalProps {
  isOpen: boolean
  onClose: () => void
  validation: PendingValidation | null
  onSubmit: (nodeId: string, chosenRoute: string) => Promise<void>
  loading?: boolean
}

export const HumanValidationModal: React.FC<HumanValidationModalProps> = ({
  isOpen,
  onClose,
  validation,
  onSubmit,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!validation) return null

  const handleSubmit = async () => {
    if (!selectedRoute) return

    setSubmitting(true)
    try {
      await onSubmit(validation.nodeId, selectedRoute)
      setSelectedRoute(null)
      onClose()
    } catch (error) {
      console.error('Failed to submit validation:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-purple-600' />
            Human Validation Required
          </DialogTitle>
          <DialogDescription>
            The workflow is paused and waiting for your decision. Please choose
            one of the available routes to continue.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Step Information */}
          <div className='rounded-lg border border-border bg-muted/50 p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-medium text-muted-foreground'>
                Step {validation.stepNumber}
              </span>
              <Badge
                variant='outline'
                className='border-purple-200 bg-purple-50 text-purple-700'
              >
                Awaiting Decision
              </Badge>
            </div>
            {validation.customPrompt && (
              <p className='text-sm text-foreground'>
                {validation.customPrompt}
              </p>
            )}
          </div>

          {/* AI Recommendation Section */}
          {validation.aiRecommendation && (
            <div className='rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
              <div className='mb-2 flex items-center gap-2'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20'>
                  <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                    AI
                  </span>
                </div>
                <span className='font-semibold text-blue-900 dark:text-blue-100'>
                  AI Recommendation
                </span>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-blue-700 dark:text-blue-300'>
                    Suggested Route:
                  </span>
                  <Badge className='bg-blue-600 hover:bg-blue-700'>
                    {validation.aiRecommendation}
                  </Badge>
                </div>
                {validation.aiAnalysis && (
                  <div className='mt-2 rounded-md bg-white/50 p-3 dark:bg-black/20'>
                    <p className='mb-1 text-xs font-medium text-blue-700 dark:text-blue-300'>
                      AI's Reasoning:
                    </p>
                    <p className='text-sm text-blue-900 dark:text-blue-100'>
                      {validation.aiAnalysis}
                    </p>
                  </div>
                )}
              </div>
              <p className='mt-3 text-xs text-blue-600 dark:text-blue-400'>
                This is a suggestion. You have the final decision on which route
                to take.
              </p>
            </div>
          )}

          {/* Route Options */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-foreground'>
              Choose a route to continue:
            </label>
            <div className='space-y-2'>
              {validation.availableRoutes.map((route) => {
                const isAiRecommended =
                  validation.aiRecommendation === route.name
                const isSelected = selectedRoute === route.name

                return (
                  <button
                    key={route.name}
                    onClick={() => setSelectedRoute(route.name)}
                    disabled={submitting}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : isAiRecommended
                          ? 'border-blue-300 bg-blue-50/50 hover:border-primary/50 dark:border-blue-700 dark:bg-blue-900/10'
                          : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                    } ${submitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-foreground'>
                            {route.name}
                          </span>
                          {isSelected && (
                            <CheckCircle className='h-4 w-4 text-primary' />
                          )}
                          {isAiRecommended && !isSelected && (
                            <Badge
                              variant='outline'
                              className='border-blue-400 bg-blue-100 text-xs text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                            >
                              AI Suggests
                            </Badge>
                          )}
                        </div>
                        {route.description && (
                          <p className='mt-1 text-sm text-muted-foreground'>
                            {route.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Status */}
          {validation.currentResponse && (
            <div className='rounded-lg border border-border bg-background p-3'>
              <p className='text-xs text-muted-foreground'>
                {validation.currentResponse}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedRoute || submitting}
            className='min-w-[120px]'
          >
            {submitting ? (
              <>
                <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></span>
                Submitting...
              </>
            ) : (
              'Continue Workflow'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
