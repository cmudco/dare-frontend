export enum NotificationDeliveryType {
  PANEL = 'panel',
  BANNER = 'banner',
}

export enum NotificationCategory {
  DEFAULT = 'default',
  DESTRUCTIVE = 'destructive',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum NotificationAction {
  NONE = 'none',
  NAVIGATE = 'navigate',
  DISMISS = 'dismiss',
  ACKNOWLEDGE = 'acknowledge',
}

export interface Notification {
  id: number
  title: string
  message: string
  deliveryType: NotificationDeliveryType
  category: NotificationCategory
  status: NotificationStatus
  effectiveStatus: NotificationStatus
  actionType: NotificationAction
  actionUrl?: string
  isBannerNotification: boolean
  isExpired: boolean
  createdAt: string
  readAt?: string
  effectiveReadAt?: string
}

export interface NotificationStats {
  totalNotifications: number
  unreadNotifications: number
  readNotifications: number
  archivedNotifications: number
  systemNotifications: number
  userNotifications: number
  notificationsByDeliveryType: Record<string, number>
  notificationsByCategory: Record<string, number>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface NotificationState {
  notifications: Notification[]
  stats: NotificationStats | null
  loading: boolean
  error: string | null
  unreadCount: number
  showNotificationPanel: boolean
}

export interface CreateNotificationData {
  user?: number
  title: string
  message: string
  deliveryType?: NotificationDeliveryType
  category?: NotificationCategory
  actionType?: NotificationAction
  actionUrl?: string
  expiresAt?: string
}
