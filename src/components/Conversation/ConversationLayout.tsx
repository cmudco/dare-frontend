import React, { useEffect } from 'react'
import ConversationHistory from './ConversationHistory'
import ActiveConversation from './ActiveConversation'
import { useAppDispatch } from '@/redux/hooks'
import { getTags } from '@/redux/aynscThunks/tag'
import { getFiles } from '@/redux/aynscThunks/file'
import { getConversations } from '@/redux/aynscThunks/conversation'
import { getPrompts } from '@/redux/aynscThunks/prompt'
import { Conversation } from '@/redux/types/conversation'
import { updateConversation } from '@/redux/conversationSlice'
import { useParams, useLocation } from 'react-router-dom'

const ConversationLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getTags())
    dispatch(getConversations())
      .unwrap()
      .then((conversations: Conversation[]) => {
        if (!id && conversations.length > 0) {
          dispatch(updateConversation(conversations[0] || null))
        }
      })
    dispatch(getPrompts())
  }, [dispatch, location.pathname])

  return (
    <div className='flex h-full'>
      <ActiveConversation />
      <ConversationHistory />
    </div>
  )
}

export default ConversationLayout
