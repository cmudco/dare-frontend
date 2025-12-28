import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import confetti from 'canvas-confetti'

// Types
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

interface FeedbackState {
  isOpen: boolean
  currentStep: FeedbackStep
  direction: number // 1 for forward, -1 for backward
  data: FeedbackData
  isSubmitting: boolean
  isCapturingScreenshot: boolean
}

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

// Helper functions for confetti
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

const triggerSuccessConfetti = () => {
  const colors = ['#EE183C', '#10B981', '#FFD700', '#FF69B4', '#00CED1']

  confetti({
    particleCount: 50,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors,
    ticks: 200,
    gravity: 0.8,
    scalar: 1,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  })

  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { x: 0.3, y: 0.5 },
      colors,
      ticks: 150,
      gravity: 0.9,
      scalar: 0.8,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { x: 0.7, y: 0.5 },
      colors,
      ticks: 150,
      gravity: 0.9,
      scalar: 0.8,
      disableForReducedMotion: true,
    })
  }, 150)
}

// Async thunk for capturing screenshot using native Screen Capture API
export const captureScreenshot = createAsyncThunk(
  'feedback/captureScreenshot',
  async (_, { rejectWithValue }) => {
    try {
      // Check if Screen Capture API is available
      if (!navigator.mediaDevices?.getDisplayMedia) {
        return rejectWithValue('Screen capture not supported in this browser')
      }

      // Hide the feedback widget temporarily
      const feedbackWidget = document.querySelector('[data-feedback-widget]')
      if (feedbackWidget) {
        ;(feedbackWidget as HTMLElement).style.opacity = '0'
        ;(feedbackWidget as HTMLElement).style.pointerEvents = 'none'
      }

      // Small delay to ensure widget is hidden before capture dialog
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Request screen capture - user will be prompted to select screen/window/tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        } as MediaTrackConstraints,
        audio: false,
      })

      // Get the video track
      const track = stream.getVideoTracks()[0]

      // Create a video element to capture the frame
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play()
          resolve()
        }
      })

      // Small delay to ensure frame is rendered
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Create canvas and capture the frame
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        track.stop()
        throw new Error('Could not get canvas context')
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Stop the stream immediately after capture
      track.stop()
      stream.getTracks().forEach((t) => t.stop())

      // Convert to base64
      const screenshot = canvas.toDataURL('image/png', 0.8)

      // Show widget again
      if (feedbackWidget) {
        ;(feedbackWidget as HTMLElement).style.opacity = '1'
        ;(feedbackWidget as HTMLElement).style.pointerEvents = 'auto'
      }

      return screenshot
    } catch (error) {
      // Restore widget visibility on error
      const feedbackWidget = document.querySelector('[data-feedback-widget]')
      if (feedbackWidget) {
        ;(feedbackWidget as HTMLElement).style.opacity = '1'
        ;(feedbackWidget as HTMLElement).style.pointerEvents = 'auto'
      }

      // User cancelled the screen share dialog
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('User cancelled screen capture')
        return rejectWithValue('cancelled')
      }

      console.error('Screenshot capture failed:', error)
      return rejectWithValue('Failed to capture screenshot')
    }
  }
)

// Async thunk for submitting feedback
export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { feedback: FeedbackState }
    const { data } = state.feedback

    const context: FeedbackContext = {
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      browserInfo: navigator.userAgent,
    }

    const payload: FeedbackPayload = {
      ...data,
      context,
    }

    try {
      // Mock submission - log to console
      console.log('Feedback submitted:', payload)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Trigger celebration confetti
      triggerSuccessConfetti()

      return payload
    } catch (error) {
      console.error('Feedback submission failed:', error)
      return rejectWithValue('Failed to submit feedback')
    }
  }
)

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

export default feedbackSlice.reducer
