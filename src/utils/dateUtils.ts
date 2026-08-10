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
