export type Emotion = 'love' | 'happy' | 'neutral' | 'confused' | 'sad'
export type FeedbackCategory =
  | 'bug'
  | 'idea'
  | 'ui'
  | 'performance'
  | 'docs'
  | 'other'
export type FeedbackStep = 'emotion' | 'category' | 'details' | 'thankyou'

export interface FeedbackData {
  emotion: Emotion | null
  category: FeedbackCategory | null
  message: string
  screenshot: string | null
}

export interface FeedbackContext {
  page: string
  conversationId?: string
  userId?: string
  timestamp: string
  browserInfo: string
}

export interface FeedbackPayload extends FeedbackData {
  context: FeedbackContext
}

export interface FeedbackState {
  isOpen: boolean
  currentStep: FeedbackStep
  direction: number // 1 for forward, -1 for backward
  data: FeedbackData
  isSubmitting: boolean
  isCapturingScreenshot: boolean
}
