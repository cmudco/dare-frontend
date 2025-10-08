import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../redux/store'
import { resetError } from '../redux/userSlice'
import { ReactNode } from 'react'
import { updateActiveConversation } from '@/redux/conversationSlice'
import { resetBuilder } from '@/redux/workflowBuilderSlice'

interface RouteListenerProps {
  children: ReactNode
}

const RouteListener: React.FC<RouteListenerProps> = ({ children }) => {
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const previousLocationRef = useRef<string>('')

  useEffect(() => {
    const previousPath = previousLocationRef.current
    const currentPath = location.pathname

    // Reset workflow builder when leaving workflow routes
    if (
      (previousPath.includes('/workflows/create') ||
        (previousPath.includes('/workflows/') &&
          previousPath.includes('/edit'))) &&
      !(
        currentPath.includes('/workflows/create') ||
        (currentPath.includes('/workflows/') && currentPath.includes('/edit'))
      )
    ) {
      dispatch(resetBuilder())
    }

    previousLocationRef.current = currentPath

    dispatch(resetError())
    if (
      !location.pathname.startsWith('/conversation/') ||
      location.pathname === '/conversation'
    ) {
      dispatch(updateActiveConversation(null))
    }
  }, [location, dispatch])

  return <>{children}</>
}

export default RouteListener
