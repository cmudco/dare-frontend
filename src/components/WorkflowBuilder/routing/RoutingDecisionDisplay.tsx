import React from 'react'

interface RoutingDecisionDisplayProps {
  /** The selected/chosen route */
  selectedRoute: string
  /** Whether the decision was made by human (vs AI) */
  isHumanValidated: boolean
  /** AI analysis/explanation text */
  aiAnalysis: string | null
  /** AI recommended route (shown if user chose differently) */
  aiRecommendation: string | null
  /** User's chosen route (for human-validated decisions) */
  userChoice: string | null
}

/**
 * Displays the routing decision result for completed routing nodes.
 *
 * Shows:
 * - The selected route with a success indicator
 * - Whether it was human or AI validated
 * - AI recommendation (if user chose differently)
 * - AI analysis/reasoning
 *
 * @example
 * ```tsx
 * {stepStatus === 'completed' && selectedRoute && (
 *   <RoutingDecisionDisplay
 *     selectedRoute={selectedRoute}
 *     isHumanValidated={isHumanValidated}
 *     aiAnalysis={aiAnalysis}
 *     aiRecommendation={aiRecommendation}
 *     userChoice={userChoice}
 *   />
 * )}
 * ```
 */
export function RoutingDecisionDisplay({
  selectedRoute,
  isHumanValidated,
  aiAnalysis,
  aiRecommendation,
  userChoice,
}: RoutingDecisionDisplayProps) {
  return (
    <div className='rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
      <div className='mb-2 flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
          <span className='text-xs font-bold text-green-600 dark:text-green-400'>
            ✓
          </span>
        </div>
        <span className='font-semibold text-green-900 dark:text-green-100'>
          {isHumanValidated ? 'User Decision' : 'AI Routing Decision'}
        </span>
      </div>
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-green-700 dark:text-green-300'>
            Selected Route:
          </span>
          <span className='rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white'>
            {selectedRoute}
          </span>
        </div>
        {/* Show AI recommendation if user chose differently */}
        {isHumanValidated &&
          userChoice &&
          aiRecommendation &&
          userChoice !== aiRecommendation && (
            <div className='rounded-md bg-blue-50/50 p-2 dark:bg-blue-900/20'>
              <p className='text-xs text-blue-700 dark:text-blue-300'>
                AI recommended:{' '}
                <span className='font-medium'>{aiRecommendation}</span>
              </p>
            </div>
          )}
        {aiAnalysis && (
          <div className='rounded-md bg-white/50 p-3 dark:bg-black/20'>
            <p className='mb-1 text-xs font-medium text-green-700 dark:text-green-300'>
              {isHumanValidated ? 'AI Analysis:' : 'AI Reasoning:'}
            </p>
            <p className='text-sm text-green-900 dark:text-green-100'>
              {aiAnalysis}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
