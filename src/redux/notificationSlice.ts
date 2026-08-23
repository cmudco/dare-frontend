import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/notification'
import {
  fetchNotifications,
  fetchNotificationStats,
  createNotificationThunk,
  updateNotificationThunk,
  deleteNotificationThunk,
  markAllAsReadThunk,
  clearAllNotificationsThunk,
  markNotificationAsReadThunk,
  markNotificationAsUnreadThunk,
  archiveNotificationThunk,
} from './asyncThunks/notification'
import type { Notification, NotificationStats } from './types/notification'
import {
  NotificationStatus,
  NotificationDeliveryType,
} from './types/notification'

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    ...initialState,
  },
  reducers: {
    toggleNotificationPanel(state) {
      state.showNotificationPanel = !state.showNotificationPanel
    },

    setNotificationPanelVisibility(state, action: PayloadAction<boolean>) {
      state.showNotificationPanel = action.payload
    },

    updateUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload)
      if (
        action.payload.effectiveStatus === NotificationStatus.UNREAD &&
        action.payload.deliveryType === NotificationDeliveryType.PANEL
      ) {
        state.unreadCount += 1
      }
    },

    updateNotificationInList(state, action: PayloadAction<Notification>) {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload.id
      )
      if (index !== -1) {
        const oldStatus = state.notifications[index].effectiveStatus
        const newStatus = action.payload.effectiveStatus
        const isPanel =
          action.payload.deliveryType === NotificationDeliveryType.PANEL

        if (
          isPanel &&
          oldStatus === NotificationStatus.UNREAD &&
          newStatus !== NotificationStatus.UNREAD
        ) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        } else if (
          isPanel &&
          oldStatus !== NotificationStatus.UNREAD &&
          newStatus === NotificationStatus.UNREAD
        ) {
          state.unreadCount += 1
        }

        state.notifications[index] = action.payload
      }
    },

    removeNotification(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      if (
        notification &&
        notification.status === NotificationStatus.UNREAD &&
        notification.deliveryType === NotificationDeliveryType.PANEL
      ) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },

    clearNotifications(state) {
      state.notifications = []
      state.unreadCount = 0
    },

    clearError(state) {
      state.error = null
    },
    markAsRead(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      if (
        notification &&
        notification.effectiveStatus === NotificationStatus.UNREAD
      ) {
        notification.status = NotificationStatus.READ
        notification.effectiveStatus = NotificationStatus.READ
        if (notification.deliveryType === NotificationDeliveryType.PANEL) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    },

    markAsUnread(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      if (
        notification &&
        notification.effectiveStatus === NotificationStatus.READ
      ) {
        notification.status = NotificationStatus.UNREAD
        notification.effectiveStatus = NotificationStatus.UNREAD
        if (notification.deliveryType === NotificationDeliveryType.PANEL) {
          state.unreadCount += 1
        }
      }
    },

    archiveNotification(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      if (notification && notification.status !== NotificationStatus.ARCHIVED) {
        const wasUnread = notification.status === NotificationStatus.UNREAD
        notification.status = NotificationStatus.ARCHIVED
        if (
          wasUnread &&
          notification.deliveryType === NotificationDeliveryType.PANEL
        ) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    },

    deleteNotification(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      if (
        notification &&
        notification.status === NotificationStatus.UNREAD &&
        notification.deliveryType === NotificationDeliveryType.PANEL
      ) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        status: NotificationStatus.READ,
        effectiveStatus: NotificationStatus.READ,
      }))
      state.unreadCount = 0
    },

    clearAllNotifications(state) {
      state.notifications = []
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = action.payload.filter(
          (n) =>
            n.effectiveStatus === NotificationStatus.UNREAD &&
            n.deliveryType === NotificationDeliveryType.PANEL
        ).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch notifications'
      })

    builder
      .addCase(fetchNotificationStats.pending, (state) => {
        state.error = null
      })
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload as NotificationStats
        state.unreadCount = action.payload.unreadNotifications
      })
      .addCase(fetchNotificationStats.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch notification stats'
      })

    builder
      .addCase(createNotificationThunk.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload)
        if (action.payload.status === NotificationStatus.UNREAD) {
          state.unreadCount += 1
        }
      })
      .addCase(createNotificationThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to create notification'
      })

    builder
      .addCase(updateNotificationThunk.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id
        )
        if (index !== -1) {
          const oldStatus = state.notifications[index].status
          const newStatus = action.payload.status

          if (
            oldStatus === NotificationStatus.UNREAD &&
            newStatus !== NotificationStatus.UNREAD
          ) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          } else if (
            oldStatus !== NotificationStatus.UNREAD &&
            newStatus === NotificationStatus.UNREAD
          ) {
            state.unreadCount += 1
          }

          state.notifications[index] = action.payload
        }
      })
      .addCase(updateNotificationThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update notification'
      })

    builder
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload
        )
        if (notification && notification.status === NotificationStatus.UNREAD) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        )
      })
      .addCase(deleteNotificationThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete notification'
      })

    builder
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          status: NotificationStatus.READ,
          effectiveStatus: NotificationStatus.READ,
        }))
        state.unreadCount = 0
      })
      .addCase(markAllAsReadThunk.rejected, (state, action) => {
        state.error =
          action.payload || 'Failed to mark all notifications as read'
      })

    builder
      .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
        state.notifications = state.notifications.filter(
          (n) => n.deliveryType === NotificationDeliveryType.BANNER
        )
        state.unreadCount = 0
      })
      .addCase(clearAllNotificationsThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to clear all notifications'
      })

    builder
      .addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id
        )
        if (index !== -1) {
          const oldStatus = state.notifications[index].effectiveStatus
          const isPanel =
            state.notifications[index].deliveryType ===
            NotificationDeliveryType.PANEL

          state.notifications[index] = action.payload

          if (
            oldStatus === NotificationStatus.UNREAD &&
            action.payload.effectiveStatus === NotificationStatus.READ &&
            isPanel
          ) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
      })
      .addCase(markNotificationAsReadThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark notification as read'
      })

    builder.addCase(
      markNotificationAsUnreadThunk.fulfilled,
      (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id
        )
        if (index !== -1) {
          state.notifications[index] = action.payload
          if (action.payload.effectiveStatus === NotificationStatus.UNREAD) {
            state.unreadCount += 1
          }
        }
      }
    )

    builder.addCase(archiveNotificationThunk.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload.id
      )
      if (index !== -1) {
        const previousStatus = state.notifications[index].effectiveStatus
        state.notifications[index] = action.payload
        if (
          action.payload.effectiveStatus === NotificationStatus.ARCHIVED &&
          previousStatus === NotificationStatus.UNREAD
        ) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    })
  },
})

export const {
  toggleNotificationPanel,
  setNotificationPanelVisibility,
  updateUnreadCount,
  addNotification,
  updateNotificationInList,
  removeNotification,
  clearNotifications,
  clearError,
  markAsRead,
  markAsUnread,
  archiveNotification,
  deleteNotification,
  markAllAsRead,
  clearAllNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer
