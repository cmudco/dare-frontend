import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  Notification,
  NotificationStats,
  CreateNotificationData,
  PaginatedResponse,
} from '@/redux/types/notification'

export const getNotifications = async (params?: {
  status?: string
  type?: string

  exclude_expired?: boolean
}): Promise<PaginatedResponse<Notification>> => {
  const queryParams = new URLSearchParams()
  if (params?.status) queryParams.append('status', params.status)
  if (params?.type) queryParams.append('type', params.type)

  if (params?.exclude_expired !== undefined) {
    queryParams.append('exclude_expired', params.exclude_expired.toString())
  }

  const url = `api/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return await baseRequest<PaginatedResponse<Notification>>({
    url,
    method: METHOD.GET,
    includeAuthToken: true,
  })
}

export const getNotificationStats = async (): Promise<NotificationStats> => {
  return await baseRequest<NotificationStats>({
    url: 'api/notifications/stats/',
    method: METHOD.GET,
    includeAuthToken: true,
  })
}

export const getNotification = async (id: number): Promise<Notification> => {
  return await baseRequest<Notification>({
    url: `api/notifications/${id}/`,
    method: METHOD.GET,
    includeAuthToken: true,
  })
}

export const createNotification = async (
  data: CreateNotificationData
): Promise<Notification> => {
  return await baseRequest<Notification>({
    url: 'api/notifications/',
    method: METHOD.POST,
    data,
    includeAuthToken: true,
  })
}

export const updateNotification = async (
  id: number,
  data: { status: string }
): Promise<Notification> => {
  return await baseRequest<Notification>({
    url: `api/notifications/${id}/`,
    method: METHOD.PUT,
    data,
    includeAuthToken: true,
  })
}

export const deleteNotification = async (id: number): Promise<void> => {
  return await baseRequest<void>({
    url: `api/notifications/${id}/`,
    method: METHOD.DELETE,
    includeAuthToken: true,
  })
}

export const markAllAsRead = async (): Promise<{
  message: string
  updated_count: number
}> => {
  return await baseRequest<{ message: string; updated_count: number }>({
    url: 'api/notifications/mark-all-read/',
    method: METHOD.POST,
    includeAuthToken: true,
  })
}

export const clearAllNotifications = async (): Promise<{
  message: string
  cleared_count: number
}> => {
  return await baseRequest<{ message: string; cleared_count: number }>({
    url: 'api/notifications/clear-all/',
    method: METHOD.DELETE,
    includeAuthToken: true,
  })
}

export const markNotificationAsRead = async (
  id: number
): Promise<{ message: string; notification: Notification }> => {
  return await baseRequest<{ message: string; notification: Notification }>({
    url: `api/notifications/${id}/mark-read/`,
    method: METHOD.POST,
    includeAuthToken: true,
  })
}

export const markNotificationAsUnread = async (
  id: number
): Promise<{ message: string; notification: Notification }> => {
  return await baseRequest<{ message: string; notification: Notification }>({
    url: `api/notifications/${id}/mark-unread/`,
    method: METHOD.POST,
    includeAuthToken: true,
  })
}

export const archiveNotification = async (
  id: number
): Promise<{ message: string; notification: Notification }> => {
  return await baseRequest<{ message: string; notification: Notification }>({
    url: `api/notifications/${id}/archive/`,
    method: METHOD.POST,
    includeAuthToken: true,
  })
}
