import React, { useEffect } from 'react'
import ConversationHistory from './ConversationHistory'
import ActiveConversation from './ActiveConversation'
import ConversationTourOverlay from '@/components/ConversationTour'
import { useConversationTourAutoTrigger } from '@/components/ConversationTour/useConversationTour'
import { useAppDispatch } from '@/redux/hooks'
import { getTags } from '@/redux/asyncThunks/tag'
import { getFiles, getFolders } from '@/redux/asyncThunks/file'
import {
  fetchConversationSummaries,
  getConversations,
} from '@/redux/asyncThunks/conversation'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getAgents } from '@/redux/asyncThunks/agent'
import { Conversation } from '@/redux/types/conversation'
import { updateActiveConversation } from '@/redux/conversationSlice'
import { useParams, useLocation } from 'react-router-dom'

const ConversationLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  useConversationTourAutoTrigger()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getFolders())
    dispatch(getTags())
    dispatch(getConversations())
      .unwrap()
      .then((conversations: Conversation[]) => {
        if (!id && conversations.length > 0) {
          dispatch(updateActiveConversation(conversations[0] || null))
        }
      })
    dispatch(fetchConversationSummaries())
    dispatch(getPrompts())
    dispatch(getAgents())
  }, [dispatch, id, location.pathname])

  return (
    <div className='flex h-full min-h-0 overflow-hidden'>
      <ActiveConversation />
      <ConversationHistory />
      <ConversationTourOverlay />
    </div>
  )
}

export default ConversationLayout
