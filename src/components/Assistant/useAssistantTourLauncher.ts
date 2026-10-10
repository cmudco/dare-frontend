import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { assistantTourHandled } from '@/redux/assistantSlice'
import { closeFeedback } from '@/redux/feedbackSlice'
import {
  openConversationTour,
  openPageTour,
} from '@/redux/conversationTourSlice'
import {
  getTourPageKeyFromPath,
  tourRequestPath,
} from '@/components/ConversationTour/pageTourSteps'

/** Opens the tour the assistant asked for, visiting its page first if needed. */
export function useAssistantTourLauncher() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pendingTour = useAppSelector((state) => state.assistant.pendingTour)
  const navigatedRef = useRef(false)

  useEffect(() => {
    if (!pendingTour) {
      navigatedRef.current = false
      return
    }
    dispatch(closeFeedback())
    const path = tourRequestPath(pendingTour.page, pathname)
    if (path && !navigatedRef.current) {
      navigatedRef.current = true
      navigate(path)
      return
    }
    dispatch(assistantTourHandled())
    // Still elsewhere after navigating: the page is not available to this user.
    if (path) return
    const pageKey = getTourPageKeyFromPath(pathname)
    if (pageKey === 'conversation') dispatch(openConversationTour())
    else if (pageKey) dispatch(openPageTour(pageKey))
  }, [pendingTour, pathname, dispatch, navigate])
}
