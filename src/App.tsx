import { useDispatch, useSelector } from 'react-redux'
import { getUserData, userLogout } from './redux/asyncThunks/user'
import { AppDispatch, RootState } from './redux/store'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/Loader'
import { useEffect } from 'react'
import { selectResolvedMode, selectTheme } from './redux/themeSlice'
import { Toaster } from '@/components/ui/toaster'
import SharingDialog from '@/components/shared/SharingDialog'
import PageTourOverlay from '@/components/ConversationTour/PageTourOverlay'
import { tokenExpirationService } from '@/services/tokenExpirationService'
import { clearOldDrafts } from './redux/conversationSlice'
import { useSocketConnection } from './hooks/useSocketConnection'
import { fetchFeatureFlags, clearFeatureFlags } from './redux/featureFlagsSlice'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { userLoading, user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  )
  const theme = useSelector(selectTheme)
  const resolvedMode = useSelector(selectResolvedMode)

  // Socket.IO connection management
  useSocketConnection()

  useEffect(() => {
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
      dispatch(fetchFeatureFlags())
    } else {
      tokenExpirationService.stopMonitoring()
      dispatch(clearFeatureFlags())
    }

    return () => {
      tokenExpirationService.stopMonitoring()
    }
  }, [isAuthenticated, user, dispatch])

  // The decorative circle belongs to the DARE brand look; other themes
  // (and dark mode) get a plain bg-background canvas from the body.
  const BackgroundCircle = () =>
    theme === 'default' && resolvedMode === 'light' ? (
      <div className='pointer-events-none fixed top-0 left-0 z-[-1] h-full w-full overflow-hidden'>
        <img
          src='/shapes/BgCircle.svg'
          alt=''
          className='absolute top-0 left-0 h-auto w-full object-cover'
        />
      </div>
    ) : null

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
      <SharingDialog />
      <PageTourOverlay />
    </>
  )
}

export default App
