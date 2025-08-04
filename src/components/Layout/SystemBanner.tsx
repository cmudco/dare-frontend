import React, { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import {
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { AppDispatch, RootState } from '@/redux/store'
import { markNotificationAsReadThunk } from '@/redux/asyncThunks/notification'
import {
  NotificationDeliveryType,
  NotificationStatus,
  NotificationCategory,
} from '@/redux/types/notification'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface SystemBannerProps {
  className?: string
}

const SystemBanner: React.FC<SystemBannerProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { notifications } = useSelector(
    (state: RootState) => state.notification
  )
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [dismissedBannerIds, setDismissedBannerIds] = useState<Set<number>>(
    new Set()
  )

  const bannerNotifications = notifications.filter(
    (notification) =>
      notification.deliveryType === NotificationDeliveryType.BANNER &&
      notification.effectiveStatus === NotificationStatus.UNREAD &&
      !notification.isExpired &&
      !dismissedBannerIds.has(notification.id)
  )

  const bannerNotification = bannerNotifications[currentBannerIndex]

  useEffect(() => {
    if (
      currentBannerIndex >= bannerNotifications.length &&
      bannerNotifications.length > 0
    ) {
      setCurrentBannerIndex(0)
    }
  }, [bannerNotifications.length, currentBannerIndex])

  useEffect(() => {
    const currentBannerIds = new Set(
      notifications
        .filter(
          (n) =>
            n.deliveryType === NotificationDeliveryType.BANNER &&
            n.effectiveStatus === NotificationStatus.UNREAD &&
            !n.isExpired
        )
        .map((n) => n.id)
    )

    setDismissedBannerIds((prev) => {
      const newDismissedIds = new Set<number>()
      prev.forEach((id) => {
        if (currentBannerIds.has(id)) {
          newDismissedIds.add(id)
        }
      })
      return newDismissedIds
    })
  }, [notifications])

  if (!bannerNotification || bannerNotifications.length === 0) {
    return null
  }

  const hasMultipleBanners = bannerNotifications.length > 1

  const goToPreviousBanner = () => {
    setCurrentBannerIndex((prev) =>
      prev > 0 ? prev - 1 : bannerNotifications.length - 1
    )
  }

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) =>
      prev < bannerNotifications.length - 1 ? prev + 1 : 0
    )
  }

  const getIcon = () => {
    switch (bannerNotification.category) {
      case NotificationCategory.DESTRUCTIVE:
        return <AlertCircle className='h-4 w-4' />
      case NotificationCategory.WARNING:
        return <AlertTriangle className='h-4 w-4' />
      case NotificationCategory.SUCCESS:
        return <AlertCircle className='h-4 w-4' />
      case NotificationCategory.INFO:
        return <Info className='h-4 w-4' />
      default:
        return <Info className='h-4 w-4' />
    }
  }

  const getBannerVariant = () => {
    switch (bannerNotification.category) {
      case NotificationCategory.DESTRUCTIVE:
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getBannerClasses = () => {
    const baseClasses = 'border-l-4 rounded-none shadow-sm'

    switch (bannerNotification.category) {
      case NotificationCategory.DESTRUCTIVE:
        return cn(
          baseClasses,
          'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
        )
      case NotificationCategory.WARNING:
        return cn(
          baseClasses,
          'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-200'
        )
      case NotificationCategory.SUCCESS:
        return cn(
          baseClasses,
          'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-200'
        )
      case NotificationCategory.INFO:
        return cn(
          baseClasses,
          'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200'
        )
      default:
        return cn(baseClasses, 'border-gray-500 bg-gray-50 dark:bg-gray-950/20')
    }
  }

  const handleDismiss = () => {
    setDismissedBannerIds((prev) => new Set(prev).add(bannerNotification.id))
    dispatch(markNotificationAsReadThunk(bannerNotification.id))

    if (bannerNotifications.length > 1) {
      if (currentBannerIndex >= bannerNotifications.length - 1) {
        setCurrentBannerIndex(Math.max(0, currentBannerIndex - 1))
      }
    }
  }

  const handleClick = () => {
    if (bannerNotification.actionUrl) {
      window.open(bannerNotification.actionUrl, '_blank')
    }
    dispatch(markNotificationAsReadThunk(bannerNotification.id))
  }

  return (
    <Alert
      variant={getBannerVariant()}
      className={cn(getBannerClasses(), className)}
    >
      <div className='flex w-full items-center'>
        {getIcon()}

        {hasMultipleBanners && (
          <Button
            variant='ghost'
            size='sm'
            className='ml-2 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10'
            onClick={goToPreviousBanner}
            aria-label='Previous banner'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
        )}

        <div
          className={cn(
            'flex-1 cursor-pointer',
            bannerNotification.actionUrl && 'hover:underline'
          )}
          onClick={handleClick}
        >
          <AlertDescription className='ml-2'>
            <span className='font-medium'>{bannerNotification.title}</span>
            {bannerNotification.message !== bannerNotification.title && (
              <span className='ml-2'>{bannerNotification.message}</span>
            )}
          </AlertDescription>
        </div>

        {hasMultipleBanners && (
          <span className='mx-2 text-xs opacity-70'>
            {currentBannerIndex + 1} / {bannerNotifications.length}
          </span>
        )}

        {hasMultipleBanners && (
          <Button
            variant='ghost'
            size='sm'
            className='ml-1 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10'
            onClick={goToNextBanner}
            aria-label='Next banner'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        )}

        <Button
          variant='ghost'
          size='sm'
          className='ml-2 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10'
          onClick={handleDismiss}
          aria-label='Dismiss notification'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </Alert>
  )
}

export default SystemBanner
