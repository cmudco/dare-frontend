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

/** Relative time for an ISO 8601 timestamp, e.g. "2 days ago". */
export const formatRelativeDate = (dateString: string): string =>
  formatNotificationDate(dateString)
