/**
 * ValidationPanel - Human-in-the-loop validation UI
 *
 * Displays when a workflow requires human decision at a routing node.
 * Shows AI analysis, recommendation, and available routes for selection.
 */

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { workflowSocketSubmitValidation } from '@/redux/middleware/workflowSocketMiddleware'
import type { PendingValidation } from '@/redux/types/workflow'

export interface ValidationPanelProps {
  validation: PendingValidation
  workflowRunId?: number
  nodeName: string
}

export function ValidationPanel({
  validation,
  workflowRunId,
  nodeName,
}: ValidationPanelProps) {
  const dispatch = useAppDispatch()
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!selectedRoute || !workflowRunId) return

    setIsSubmitting(true)
    dispatch(
      workflowSocketSubmitValidation({
        workflowRunId,
        nodeId: validation.nodeId,
        selectedRoute,
        continueExecution: true,
      })
    )
  }

  return (
    <div className='mb-4 rounded-lg border border-[#EE183C]/30 bg-gradient-to-br from-[#EE183C]/5 to-[#023572]/5 p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#EE183C] to-[#023572]'>
          <span className='text-xs font-bold text-white'>?</span>
        </div>
        <span className='font-medium text-foreground'>
          Human Validation Required
        </span>
      </div>

      <p className='mb-3 text-sm text-muted-foreground'>
        The workflow is waiting for your decision at{' '}
        <strong className='text-foreground'>{nodeName}</strong>. Please select a
        route to continue.
      </p>

      {validation.context?.aiAnalysis && (
        <div className='mb-3 rounded-md border border-muted bg-muted/30 p-3 text-sm text-muted-foreground'>
          <strong className='text-foreground'>AI Analysis:</strong>
          <p className='mt-1'>{validation.context.aiAnalysis}</p>
        </div>
      )}

      {/* AI Recommendation - show which route AI suggests */}
      {validation.aiRecommendation && (
        <div className='mb-3 rounded-md border border-[#023572]/20 bg-[#023572]/5 p-2 text-sm'>
          <strong className='text-[#023572]'>Recommended Route:</strong>{' '}
          <span className='font-medium'>{validation.aiRecommendation}</span>
        </div>
      )}

      <div className='mb-4 space-y-2'>
        {validation.routes.map((route) => (
          <button
            key={route.name}
            onClick={() => setSelectedRoute(route.name)}
            className={cn(
              'w-full rounded-lg border p-3 text-left transition-all',
              selectedRoute === route.name
                ? 'border-[#EE183C]/50 bg-gradient-to-r from-[#EE183C]/10 to-[#023572]/10'
                : 'border-border bg-white hover:border-[#023572]/30 hover:bg-[#023572]/5'
            )}
          >
            <div className='font-medium text-foreground'>{route.name}</div>
            {route.description && (
              <div className='text-xs text-muted-foreground'>
                {route.description}
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedRoute || isSubmitting}
        className='w-full bg-gradient-to-r from-[#EE183C] to-[#023572] text-white hover:from-[#c41230] hover:to-[#012a5c]'
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Submitting...
          </>
        ) : (
          'Continue Workflow'
        )}
      </Button>
    </div>
  )
}
