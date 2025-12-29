// Feedback Component Exports

export { FeedbackWidget } from './FeedbackWidget'
export { FeedbackPanel } from './FeedbackPanel'

// Step components
export { EmotionStep } from './steps/EmotionStep'
export { CategoryStep } from './steps/CategoryStep'
export { DetailsStep } from './steps/DetailsStep'
export { ThankYouStep } from './steps/ThankYouStep'

// Types from local types file (for UI components)
export type { EmotionOption, CategoryOption } from './types'
export { EMOTION_OPTIONS, CATEGORY_OPTIONS } from './types'

// Re-export types from Redux slice
export type {
  Emotion,
  FeedbackCategory,
  FeedbackStep,
  FeedbackData,
  FeedbackPayload,
  FeedbackContext,
} from '@/redux/feedbackSlice'

// Animations (for customization)
export * from './animations'
