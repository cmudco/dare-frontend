import { useDispatch, useSelector } from 'react-redux'
import { getUserData, userLogout } from './redux/asyncThunks/user'
import { AppDispatch, RootState } from './redux/store'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/Loader'
import { useEffect } from 'react'
import { initializeTheme } from './redux/themeSlice'
import { Toaster } from '@/components/ui/toaster'
import { tokenExpirationService } from '@/services/tokenExpirationService'
import { clearOldDrafts } from './redux/conversationSlice'
import { useSocketConnection } from './hooks/useSocketConnection'
import { FeedbackWidget } from '@/components/Feedback'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { userLoading, user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  )
  const { isDarkMode } = useSelector((state: RootState) => state.theme)

  // Socket.IO connection management
  useSocketConnection()

  useEffect(() => {
    dispatch(initializeTheme())
    dispatch(clearOldDrafts(1 * 24 * 60 * 60 * 1000))

    if (!user) {
      dispatch(getUserData())
    }
  }, [dispatch, user])

  useEffect(() => {
    const handleTokenExpiration = async () => {
      try {
        await dispatch(userLogout()).unwrap()
      } catch {
        // Continue with redirect even if logout fails
      }

      const currentPath = window.location.pathname

      if (currentPath !== '/login') {
        try {
          setTimeout(() => {
            window.location.href = '/login'
          }, 50)
        } catch {
          window.location.href = '/login'
        }
      }
    }

    if (isAuthenticated && user) {
      tokenExpirationService.startMonitoring(handleTokenExpiration)
    } else {
      tokenExpirationService.stopMonitoring()
    }

    return () => {
      tokenExpirationService.stopMonitoring()
    }
  }, [isAuthenticated, user, dispatch])

  const BackgroundCircle = () => (
    <div className='pointer-events-none fixed left-0 top-0 z-[-1] h-full w-full overflow-hidden backdrop-blur'>
      {isDarkMode ? (
        <div className='bg-dark-gradient absolute left-0 top-0 h-full w-full' />
      ) : (
        <img
          src='/shapes/BgCircle.svg'
          alt='Background Circle'
          className='absolute left-0 top-0 h-auto w-full object-cover'
        />
      )}
    </div>
  )

  if (userLoading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center'>
        <BackgroundCircle />
        <div className='flex h-full items-center justify-center'>
          <Loader className='h-16 w-16 text-red-500' />
        </div>
      </div>
    )
  }

  return (
    <>
      <BackgroundCircle />
      <AppRoutes />
      <Toaster />
      <FeedbackWidget />
    </>
  )
}

export default App
