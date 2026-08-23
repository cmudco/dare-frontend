import { formatDistanceToNow } from 'date-fns'

export const formatNotificationDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Unknown time'
    }
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return 'Unknown time'
  }
}

/** Short absolute date for an ISO 8601 timestamp, e.g. "Jun 2, 2026". */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Unknown date'
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Unknown date'
  }
}

/** Relative time for an ISO 8601 timestamp, e.g. "2 days ago". */
export const formatRelativeDate = (dateString: string): string =>
  formatNotificationDate(dateString)

/** Locale-aware absolute date + time for an ISO 8601 timestamp. */
export const formatDateTime = (value?: string): string | null => {
  if (!value) return null
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value))
}

/** Compact duration, e.g. "<0.1s", "3.2s", "45s", "2m 30s". */
export const formatDurationSeconds = (seconds: number): string => {
  if (seconds < 0.05) return '<0.1s'
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`
}
