import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getNotifications,
  getNotificationStats,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAllAsRead,
  clearAllNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  archiveNotification,
} from '@/api/notifications'
import {
  Notification,
  NotificationStats,
  CreateNotificationData,
  NotificationQueryParams,
} from '@/redux/types/notification'
export const fetchNotifications = createAsyncThunk<
  Notification[],
  NotificationQueryParams | void,
  { rejectValue: string }
>('notification/fetchNotifications', async (params, thunkAPI) => {
  try {
    const response = await getNotifications(params || undefined)
    return response.results
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
export const fetchNotificationStats = createAsyncThunk<
  NotificationStats,
  void,
  { rejectValue: string }
>('notification/fetchNotificationStats', async (_, thunkAPI) => {
  try {
    const stats = await getNotificationStats()
    return stats
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
export const fetchNotification = createAsyncThunk<
  Notification,
  number,
  { rejectValue: string }
>('notification/fetchNotification', async (id, thunkAPI) => {
  try {
    const notification = await getNotification(id)
    return notification
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
export const createNotificationThunk = createAsyncThunk<
  Notification,
  CreateNotificationData,
  { rejectValue: string }
>('notification/createNotification', async (data, thunkAPI) => {
  try {
    const notification = await createNotification(data)
    return notification
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const updateNotificationThunk = createAsyncThunk<
  Notification,
  { id: number; status: string },
  { rejectValue: string }
>('notification/updateNotification', async ({ id, status }, thunkAPI) => {
  try {
    const notification = await updateNotification(id, { status })
    return notification
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const deleteNotificationThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('notification/deleteNotification', async (id, thunkAPI) => {
  try {
    await deleteNotification(id)
    return id
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const markAllAsReadThunk = createAsyncThunk<
  { message: string; updated_count: number },
  void,
  { rejectValue: string }
>('notification/markAllAsRead', async (_, thunkAPI) => {
  try {
    const result = await markAllAsRead()
    return result
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const clearAllNotificationsThunk = createAsyncThunk<
  { message: string; cleared_count: number },
  void,
  { rejectValue: string }
>('notification/clearAllNotifications', async (_, thunkAPI) => {
  try {
    const result = await clearAllNotifications()
    return result
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const markNotificationAsReadThunk = createAsyncThunk<
  Notification,
  number,
  { rejectValue: string }
>('notification/markNotificationAsRead', async (id, thunkAPI) => {
  try {
    const response = await markNotificationAsRead(id)
    return response.notification
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const markNotificationAsUnreadThunk = createAsyncThunk<
  Notification,
  number,
  { rejectValue: string }
>('notification/markNotificationAsUnread', async (id, thunkAPI) => {
  try {
    const response = await markNotificationAsUnread(id)
    return response.notification
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
export const archiveNotificationThunk = createAsyncThunk<
  Notification,
  number,
  { rejectValue: string }
>('notification/archiveNotification', async (id, thunkAPI) => {
  try {
    const response = await archiveNotification(id)
    return response.notification
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
