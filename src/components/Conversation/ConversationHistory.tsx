import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  resetConversation,
  updateActiveConversation,
  updateSearchQuery,
  updateSelectedTags,
} from '../../redux/conversationSlice'
import { createConversation } from '../../redux/asyncThunks/conversation'
import { AppDispatch, RootState } from '../../redux/store'
import ConversationList from './ConversationList'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

const ConversationHistory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const searchQuery = useSelector(
    (state: RootState) => state.conversation?.searchQuery || ''
  )

  useEffect(() => {
    const handleResize = () => {}

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

  return (
    <div
      className={`transition-width flex max-w-[20vw] flex-1 flex-col border border-pink-50 bg-white bg-clip-border p-2 text-gray-700 duration-300 dark:border-slate-800 dark:bg-dark-bg dark:text-white`}
    >
      <div className='flex items-center justify-between border-pink-50 p-4'>
        <div className='flex flex-grow items-center rounded-3xl border border-gray-500 p-2 dark:border-slate-800'>
          <MagnifyingGlassIcon className='mr-2 h-5 w-5 text-gray-600 dark:text-dark-icon-unselected' />
          <input
            type='text'
            placeholder='Search'
            value={searchQuery}
            onChange={handleSearchChange}
            className='w-20 bg-transparent font-normal placeholder-gray-600 outline-none dark:text-white dark:placeholder-dark-icon-unselected'
          />
        </div>
        <Button
          onClick={handleCreateConversation}
          className='ml-2 flex h-10 w-10 min-w-5 items-center justify-center rounded-xl'
        >
          <span className='text-xl'>+</span>
        </Button>
      </div>
      <hr className='mx-1 mb-2 border-gray-200' />
      <ConversationList />
    </div>
  )
}

export default ConversationHistory
