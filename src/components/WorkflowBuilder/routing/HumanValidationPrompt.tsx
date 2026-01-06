import { UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HumanValidationPromptProps {
  /** AI recommended route */
  aiRecommendation: string | null
  /** AI analysis/explanation */
  aiAnalysis: string | null
  /** Callback when user clicks to make decision */
  onOpenModal: () => void
}

/**
 * Displays the human validation prompt for routing nodes waiting for user input.
 *
 * Shows:
 * - Alert that human validation is required
 * - AI recommendation with reasoning (if available)
 * - Button to open the validation modal
 *
 * @example
 * ```tsx
 * {hasPendingValidation && (
 *   <HumanValidationPrompt
 *     aiRecommendation={aiRecommendation}
 *     aiAnalysis={aiAnalysis}
 *     onOpenModal={() => setShowValidationModal(true)}
 *   />
 * )}
 * ```
 */
export function HumanValidationPrompt({
  aiRecommendation,
  aiAnalysis,
  onOpenModal,
}: HumanValidationPromptProps) {
  return (
    <div className='rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
      <div className='mb-3 flex items-start gap-3'>
        <UserCheck className='mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400' />
        <div className='flex-1'>
          <h3 className='font-semibold text-purple-900 dark:text-purple-100'>
            Human Validation Required
          </h3>
          <p className='mt-1 text-sm text-purple-700 dark:text-purple-300'>
            Choose which route the workflow should take to continue execution.
          </p>
        </div>
      </div>

      {/* AI Recommendation in Node */}
      {aiRecommendation && (
        <div className='mb-3 rounded-md border border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/20'>
          <div className='mb-1 flex items-center gap-2'>
            <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20'>
              <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                AI
              </span>
            </div>
            <span className='text-xs font-semibold text-blue-900 dark:text-blue-100'>
              AI Suggests: {aiRecommendation}
            </span>
          </div>
          {aiAnalysis && (
            <p className='ml-7 text-xs text-blue-700 dark:text-blue-300'>
              {aiAnalysis}
            </p>
          )}
        </div>
      )}

      <Button
        onClick={onOpenModal}
        size='sm'
        className='w-full bg-purple-600 hover:bg-purple-700'
      >
        Make Decision
      </Button>
    </div>
  )
}
