import { createAsyncThunk } from '@reduxjs/toolkit'
import confetti from 'canvas-confetti'
import { submitFeedbackAPI } from '../../api/feedback'
import {
  FeedbackContext,
  FeedbackPayload,
  FeedbackState,
} from '../types/feedback'

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
      // Submit feedback to backend API
      await submitFeedbackAPI(payload)

      // Trigger celebration confetti
      triggerSuccessConfetti()

      return payload
    } catch (error) {
      console.error('Feedback submission failed:', error)
      return rejectWithValue('Failed to submit feedback')
    }
  }
)
