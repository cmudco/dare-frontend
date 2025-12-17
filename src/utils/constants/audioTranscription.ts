/**
 * Audio Transcription Constants
 *
 * Defines configuration, languages, and pricing for audio transcription services.
 */

// Common languages supported by Whisper
export const TRANSCRIPTION_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'th', name: 'Thai' },
] as const

export type LanguageCode = (typeof TRANSCRIPTION_LANGUAGES)[number]['code']

// Whisper API pricing (as of 2024)
export const WHISPER_PRICING = {
  pricePerMinute: 0.006, // $0.006 per minute
}

/**
 * Calculate transcription cost based on audio duration
 * @param durationSeconds - Audio duration in seconds
 * @returns Cost in USD
 */
export function calculateTranscriptionCost(durationSeconds: number): number {
  const durationMinutes = durationSeconds / 60
  return durationMinutes * WHISPER_PRICING.pricePerMinute
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2m 30s")
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Default transcription settings
export const DEFAULT_TRANSCRIPTION_SETTINGS = {
  language: 'auto' as LanguageCode,
}
