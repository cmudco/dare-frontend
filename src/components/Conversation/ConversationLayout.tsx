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

const ConversationLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  useConversationTourAutoTrigger()

  // Loaded once per visit; switching chats reads these from the store.
  useEffect(() => {
    dispatch(getFiles())
    dispatch(getFolders())
    dispatch(getTags())
    dispatch(getConversations())
    dispatch(fetchConversationSummaries())
    dispatch(getPrompts())
    dispatch(getAgents())
  }, [dispatch])

  return (
    <div className='flex h-full min-h-0 overflow-hidden'>
      <ActiveConversation />
      <ConversationHistory />
      <ConversationTourOverlay />
    </div>
  )
}

export default ConversationLayout
