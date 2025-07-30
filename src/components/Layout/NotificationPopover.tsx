import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react'

import { AppDispatch, RootState } from '@/redux/store'
import {
  fetchNotifications,
  fetchNotificationStats,
  markNotificationAsReadThunk,
  markAllAsReadThunk,
  clearAllNotificationsThunk,
} from '@/redux/asyncThunks/notification'
import { markAsRead, markAsUnread } from '@/redux/notificationSlice'
import {
  NotificationDeliveryType,
  NotificationStatus,
  NotificationCategory,
} from '@/redux/types/notification'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'
import { formatNotificationDate } from '@/utils/dateUtils'

const NotificationPopover: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notification
  )
  const { isAuthenticated } = useSelector((state: RootState) => state.user)

  const panelNotifications = notifications.filter(
    (notification) =>
      notification.deliveryType === NotificationDeliveryType.PANEL
  )

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications())
      dispatch(fetchNotificationStats())
    }
  }, [dispatch, isAuthenticated])

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: number
  ) => {
    e.stopPropagation()

    const notification = notifications.find((n) => n.id === notificationId)
    if (notification && notification.status === NotificationStatus.UNREAD) {
      dispatch(markAsRead(notificationId))
    }

    try {
      await dispatch(markNotificationAsReadThunk(notificationId)).unwrap()
    } catch {
      if (notification && notification.status === NotificationStatus.UNREAD) {
        dispatch(markAsUnread(notificationId))
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsReadThunk())
  }

  const handleClearAll = async () => {
    await dispatch(clearAllNotificationsThunk())
  }

  const getNotificationIcon = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.DESTRUCTIVE:
        return <AlertTriangle className='h-3 w-3 text-red-500' />
      case NotificationCategory.WARNING:
        return <AlertTriangle className='h-3 w-3 text-yellow-500' />
      case NotificationCategory.SUCCESS:
        return <AlertCircle className='h-3 w-3 text-green-500' />
      case NotificationCategory.INFO:
        return <Info className='h-3 w-3 text-blue-500' />
      default:
        return <Info className='h-3 w-3 text-gray-500' />
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative hover:bg-accent'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className='sr-only'>Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end'>
        <div className='flex items-center justify-between p-4 pb-2'>
          <h3 className='text-sm font-semibold'>Notifications</h3>
          {panelNotifications.length > 0 && (
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleMarkAllAsRead}
                className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
              >
                Mark all read
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleClearAll}
                className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <ScrollArea className='h-80'>
          {panelNotifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Bell className='mb-2 h-8 w-8 text-muted-foreground/50' />
              <p className='text-sm text-muted-foreground'>No notifications</p>
              <p className='mt-1 text-xs text-muted-foreground/70'>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className='py-1'>
              {panelNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    'group relative cursor-pointer px-4 py-3 transition-colors hover:bg-accent/50',
                    notification.status === NotificationStatus.UNREAD &&
                      'bg-blue-50/30 dark:bg-blue-950/10'
                  )}
                  onClick={() => {
                    if (notification.actionUrl) {
                      window.open(notification.actionUrl, '_blank')
                    }
                    if (notification.status === NotificationStatus.UNREAD) {
                      dispatch(markNotificationAsReadThunk(notification.id))
                    }
                  }}
                >
                  {notification.status === NotificationStatus.UNREAD && (
                    <div className='absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500' />
                  )}

                  <div className='flex items-start gap-3'>
                    <div className='mt-0.5 flex-shrink-0'>
                      {getNotificationIcon(notification.category)}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center justify-between gap-2'>
                        <p className='line-clamp-1 text-sm font-medium leading-tight'>
                          {notification.title}
                        </p>
                        {notification.status === NotificationStatus.UNREAD && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100'
                            onClick={(e) =>
                              handleMarkAsRead(e, notification.id)
                            }
                          >
                            <Check className='h-3 w-3' />
                          </Button>
                        )}
                      </div>

                      {notification.message !== notification.title && (
                        <p className='mb-2 line-clamp-2 text-xs text-muted-foreground'>
                          {notification.message}
                        </p>
                      )}

                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-muted-foreground/70'>
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < panelNotifications.length - 1 && (
                    <Separator className='mt-3' />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationPopover
