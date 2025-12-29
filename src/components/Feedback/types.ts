// Feedback Component Types

export type Emotion = 'love' | 'happy' | 'neutral' | 'confused' | 'sad'

export type FeedbackCategory =
  | 'bug'
  | 'idea'
  | 'ui'
  | 'performance'
  | 'docs'
  | 'other'

export type FeedbackStep = 'emotion' | 'category' | 'details' | 'thankyou'

export interface EmotionOption {
  value: Emotion
  emoji: string
  label: string
  color: {
    bg: string
    accent: string
    ring: string
  }
}

export interface CategoryOption {
  value: FeedbackCategory
  icon: string
  label: string
  description: string
}

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
  data: FeedbackData
  isSubmitting: boolean
  isCapturingScreenshot: boolean
}

// Emotion options with styling
export const EMOTION_OPTIONS: EmotionOption[] = [
  {
    value: 'love',
    emoji: '😍',
    label: 'Love it',
    color: {
      bg: 'from-pink-500/20 to-red-500/20',
      accent: '#EE183C',
      ring: 'ring-pink-500/50',
    },
  },
  {
    value: 'happy',
    emoji: '😊',
    label: 'Happy',
    color: {
      bg: 'from-green-500/20 to-emerald-500/20',
      accent: '#10B981',
      ring: 'ring-green-500/50',
    },
  },
  {
    value: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      accent: '#3B82F6',
      ring: 'ring-blue-500/50',
    },
  },
  {
    value: 'confused',
    emoji: '😕',
    label: 'Confused',
    color: {
      bg: 'from-yellow-500/20 to-orange-500/20',
      accent: '#F59E0B',
      ring: 'ring-yellow-500/50',
    },
  },
  {
    value: 'sad',
    emoji: '😢',
    label: 'Sad',
    color: {
      bg: 'from-purple-500/20 to-indigo-500/20',
      accent: '#8B5CF6',
      ring: 'ring-purple-500/50',
    },
  },
]

// Category options
export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'bug',
    icon: '🐛',
    label: 'Bug Report',
    description: "Something isn't working right",
  },
  {
    value: 'idea',
    icon: '💡',
    label: 'Feature Idea',
    description: 'Suggest a new feature',
  },
  {
    value: 'ui',
    icon: '🎨',
    label: 'UI/UX',
    description: 'Design or usability feedback',
  },
  {
    value: 'performance',
    icon: '⚡',
    label: 'Performance',
    description: 'Speed or loading issues',
  },
  {
    value: 'docs',
    icon: '📚',
    label: 'Documentation',
    description: 'Help docs or guides',
  },
  {
    value: 'other',
    icon: '💬',
    label: 'Other',
    description: 'General feedback',
  },
]
