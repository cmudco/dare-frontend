import {
  Notification,
  NotificationDeliveryType,
  NotificationCategory,
  NotificationAction,
  NotificationStatus,
} from '@/redux/types/notification'

export const createTestNotification = (
  overrides: Partial<Notification> = {}
): Notification => {
  const now = new Date().toISOString()
  return {
    id: Math.floor(Math.random() * 10000),
    title: 'Test Notification',
    message: 'This is a test notification message',
    deliveryType: NotificationDeliveryType.PANEL,
    category: NotificationCategory.DEFAULT,
    status: NotificationStatus.UNREAD,
    effectiveStatus: NotificationStatus.UNREAD,
    actionType: NotificationAction.NONE,
    actionUrl: undefined,
    isBannerNotification: false,
    isExpired: false,
    createdAt: now,
    ...overrides,
  }
}

export const getCategoryLabel = (category: NotificationCategory): string => {
  const labels: Record<NotificationCategory, string> = {
    [NotificationCategory.DEFAULT]: 'Default',
    [NotificationCategory.DESTRUCTIVE]: 'Error',
    [NotificationCategory.SUCCESS]: 'Success',
    [NotificationCategory.WARNING]: 'Warning',
    [NotificationCategory.INFO]: 'Info',
  }
  return labels[category] || 'Unknown'
}

export const getDeliveryTypeLabel = (
  deliveryType: NotificationDeliveryType
): string => {
  const labels: Record<NotificationDeliveryType, string> = {
    [NotificationDeliveryType.PANEL]: 'Panel',
    [NotificationDeliveryType.BANNER]: 'Banner',
  }
  return labels[deliveryType] || 'Unknown'
}
