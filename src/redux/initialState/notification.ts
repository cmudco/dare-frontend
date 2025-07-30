import { NotificationState } from '../types/notification'

export const initialState: NotificationState = {
  notifications: [],
  stats: null,
  loading: false,
  error: null,
  unreadCount: 0,
  showNotificationPanel: false,
}
