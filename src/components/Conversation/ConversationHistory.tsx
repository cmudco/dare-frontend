import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  resetConversation,
  updateActiveConversation,
  updateSearchQuery,
  updateSelectedTags,
  setHistorySidebarCollapsed,
} from '../../redux/conversationSlice'
import { createConversation } from '../../redux/asyncThunks/conversation'
import { AppDispatch, RootState } from '../../redux/store'
import ConversationList from './ConversationList'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { features } from '@/config/environment'

const ConversationHistory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isCollapsed = useSelector(
    (state: RootState) => state.conversation.historySidebarCollapsed
  )
  const searchQuery = useSelector(
    (state: RootState) => state.conversation?.searchQuery || ''
  )
  const sidecarOpen = useSelector(
    (state: RootState) => state.artifact.sidecarOpen
  )

  const setIsCollapsed = (collapsed: boolean) => {
    dispatch(setHistorySidebarCollapsed(collapsed))
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        dispatch(setHistorySidebarCollapsed(true))
      } else {
        dispatch(setHistorySidebarCollapsed(false))
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSearchQuery(e.target.value))
  }

  const handleCreateConversation = () => {
    dispatch(updateSelectedTags([]))
    dispatch(createConversation())
      .unwrap()
      .then((newConversation) => {
        dispatch(resetConversation())
        dispatch(updateActiveConversation(newConversation))
        navigate(`/conversation/${newConversation.conversationId}`)
      })
      .catch((error) => {
        console.error('Error creating conversation:', error)
      })
  }

  // Hide conversation history when artifact sidecar is open
  if (sidecarOpen && features.enableArtifacts) {
    return null
  }

  return (
    <div
      className={`relative flex h-full flex-col border border-pink-50 bg-white bg-clip-border text-gray-700 transition-all duration-300 dark:border-slate-800 dark:bg-dark-bg dark:text-white ${
        isCollapsed
          ? 'w-12 min-w-12 items-center border-l-0 p-2'
          : 'min-w-[280px] max-w-[280px] p-2'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className='mt-2 shrink-0 rounded-full border-2 border-gray-200 bg-white p-1 transition-all hover:bg-gray-100 dark:border-slate-600 dark:bg-dark-bg dark:hover:bg-slate-700'
          aria-label='Expand conversation list'
        >
          <ChevronRightIcon className='h-5 w-5 text-primary' />
        </button>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <div className='flex shrink-0 items-center gap-2 border-pink-50 p-4'>
            <button
              onClick={() => setIsCollapsed(true)}
              className='shrink-0 rounded-full border-2 border-gray-200 bg-white p-1 transition-all hover:bg-gray-100 dark:border-slate-600 dark:bg-dark-bg dark:hover:bg-slate-700'
              aria-label='Collapse conversation list'
            >
              <ChevronRightIcon className='h-5 w-5 rotate-180 text-primary' />
            </button>
            <div className='flex min-w-0 flex-1 items-center rounded-3xl border border-gray-500 p-2 dark:border-slate-800'>
              <MagnifyingGlassIcon className='mr-2 h-5 w-5 shrink-0 text-gray-600 dark:text-dark-icon-unselected' />
              <input
                type='text'
                placeholder='Search'
                value={searchQuery}
                onChange={handleSearchChange}
                className='min-w-0 flex-1 bg-transparent font-normal placeholder-gray-600 outline-none dark:text-white dark:placeholder-dark-icon-unselected'
              />
            </div>
            <Button
              onClick={handleCreateConversation}
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'
            >
              <span className='text-xl'>+</span>
            </Button>
          </div>
          <hr className='mx-1 mb-2 shrink-0 border-gray-200' />
          <div className='min-h-0 flex-1 overflow-y-auto'>
            <ConversationList />
          </div>
        </div>
      )}
    </div>
  )
}

export default ConversationHistory
