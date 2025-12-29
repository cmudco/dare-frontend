import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import confetti from 'canvas-confetti'
import { captureScreenshot, submitFeedback } from './asyncThunks/feedback'
import {
  Emotion,
  FeedbackCategory,
  FeedbackStep,
  FeedbackState,
} from './types/feedback'

// Re-export types for convenience
export type {
  Emotion,
  FeedbackCategory,
  FeedbackStep,
  FeedbackData,
  FeedbackContext,
  FeedbackPayload,
  FeedbackState,
} from './types/feedback'

const initialState: FeedbackState = {
  isOpen: false,
  currentStep: 'emotion',
  direction: 1,
  data: {
    emotion: null,
    category: null,
    message: '',
    screenshot: null,
  },
  isSubmitting: false,
  isCapturingScreenshot: false,
}

const STEP_ORDER: FeedbackStep[] = [
  'emotion',
  'category',
  'details',
  'thankyou',
]

// Helper function for confetti on emotion selection
const triggerConfetti = () => {
  const colors = ['#EE183C', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x: 0.9, y: 0.8 },
    colors,
    ticks: 100,
    gravity: 1.2,
    scalar: 0.8,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  })
}

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    openFeedback: (state) => {
      state.isOpen = true
    },
    closeFeedback: () => {
      return initialState
    },
    toggleFeedback: (state) => {
      if (state.isOpen) {
        return initialState
      } else {
        state.isOpen = true
      }
    },
    nextStep: (state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep)
      if (currentIndex < STEP_ORDER.length - 1) {
        state.direction = 1
        state.currentStep = STEP_ORDER[currentIndex + 1]
      }
    },
    prevStep: (state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep)
      if (currentIndex > 0) {
        state.direction = -1
        state.currentStep = STEP_ORDER[currentIndex - 1]
      }
    },
    goToStep: (state, action: PayloadAction<FeedbackStep>) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep)
      const targetIndex = STEP_ORDER.indexOf(action.payload)
      state.direction = targetIndex > currentIndex ? 1 : -1
      state.currentStep = action.payload
    },
    setEmotion: (state, action: PayloadAction<Emotion>) => {
      state.data.emotion = action.payload

      // Trigger confetti for positive emotions (side effect handled in component)
      if (action.payload === 'love' || action.payload === 'happy') {
        triggerConfetti()
      }

      // Auto-advance to category step
      state.direction = 1
      state.currentStep = 'category'
    },
    setCategory: (state, action: PayloadAction<FeedbackCategory>) => {
      state.data.category = action.payload

      // Auto-advance to details step
      state.direction = 1
      state.currentStep = 'details'
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.data.message = action.payload
    },
    removeScreenshot: (state) => {
      state.data.screenshot = null
    },
    skipCategory: (state) => {
      state.direction = 1
      state.currentStep = 'details'
    },
  },
  extraReducers: (builder) => {
    builder
      // Screenshot capture
      .addCase(captureScreenshot.pending, (state) => {
        state.isCapturingScreenshot = true
      })
      .addCase(captureScreenshot.fulfilled, (state, action) => {
        state.isCapturingScreenshot = false
        state.data.screenshot = action.payload
      })
      .addCase(captureScreenshot.rejected, (state) => {
        state.isCapturingScreenshot = false
      })
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.isSubmitting = false
        state.direction = 1
        state.currentStep = 'thankyou'
      })
      .addCase(submitFeedback.rejected, (state) => {
        state.isSubmitting = false
      })
  },
})

export const {
  openFeedback,
  closeFeedback,
  toggleFeedback,
  nextStep,
  prevStep,
  goToStep,
  setEmotion,
  setCategory,
  setMessage,
  removeScreenshot,
  skipCategory,
} = feedbackSlice.actions

// Re-export async thunks for convenience
export { captureScreenshot, submitFeedback }

export default feedbackSlice.reducer
