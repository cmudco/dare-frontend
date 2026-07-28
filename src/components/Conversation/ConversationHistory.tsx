import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  resetConversation,
  updateActiveConversation,
  updateSearchQuery,
  updateSelectedTags,
  setHistorySidebarCollapsed,
  setActiveTab,
} from '../../redux/conversationSlice'
import {
  createConversation,
  fetchConversationById,
  fetchConversationMessages,
  forkConversation,
  fetchSharedConversations,
} from '../../redux/asyncThunks/conversation'
import { AppDispatch, RootState } from '../../redux/store'
import ConversationList from './ConversationList'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { ConversationTab } from '@/utils/constants/conversation'
import { fetchSharedWithMe } from '@/redux/asyncThunks/sharing'
import { ShareableEntityType, SharedItem } from '@/redux/types/sharing'
import SharedWithMeList from '../shared/SharedWithMeList'
import ForkConfirmDialog from '../shared/ForkConfirmDialog'
import { toast } from '@/utils/toast'

const ConversationHistory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const enableArtifacts = useFeatureFlag('enableArtifacts')
  const enableSharing = useFeatureFlag('enableSharing')
  const [forkConversationItem, setForkConversationItem] =
    useState<SharedItem | null>(null)
  const isCollapsed = useSelector(
    (state: RootState) => state.conversation.historySidebarCollapsed
  )
  const searchQuery = useSelector(
    (state: RootState) => state.conversation?.searchQuery || ''
  )
  const sidecarOpen = useSelector(
    (state: RootState) => state.artifact.sidecarOpen
  )
  const activeTab = useSelector(
    (state: RootState) => state.conversation.activeTab
  )
  const sharedConversations = useSelector(
    (state: RootState) => state.conversation.sharedConversations
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

  const handleTabChange = (tab: ConversationTab) => {
    dispatch(setActiveTab(tab))
    if (tab === ConversationTab.SHARED) {
      dispatch(fetchSharedConversations())
    }
    if (tab === ConversationTab.SHARED_WITH_ME) {
      dispatch(fetchSharedWithMe(ShareableEntityType.Conversation))
    }
  }

  const handleSharedConversationClick = async (item: SharedItem) => {
    try {
      const conversation = await dispatch(
        fetchConversationById(item.objectId)
      ).unwrap()
      await dispatch(fetchConversationMessages(item.objectId)).unwrap()
      dispatch(updateActiveConversation(conversation))
      navigate(`/conversation/${item.objectId}`)
    } catch (error) {
      toast.error(
        (error as Error).message || 'Failed to open shared conversation.'
      )
    }
  }

  const handleConfirmFork = async () => {
    if (!forkConversationItem) {
      return
    }

    try {
      await dispatch(
        fetchConversationMessages(forkConversationItem.objectId)
      ).unwrap()
      const forkedConversation = await dispatch(
        forkConversation(forkConversationItem.objectId)
      ).unwrap()
      setForkConversationItem(null)
      dispatch(updateActiveConversation(forkedConversation))
      navigate(`/conversation/${forkedConversation.conversationId}`)
    } catch (error) {
      setForkConversationItem(null)
      toast.error(
        (error as Error).message || 'Failed to fork shared conversation.'
      )
    }
  }

  // Hide conversation history when artifact sidecar is open
  if (sidecarOpen && enableArtifacts) {
    return null
  }

  return (
    <div
      data-tour='conversation-history'
      className={`relative flex h-full flex-col border border-border bg-sidebar bg-clip-border text-sidebar-foreground transition-all duration-300 ${
        isCollapsed
          ? 'w-12 min-w-12 items-center border-l-0 p-2'
          : 'max-w-[280px] min-w-[280px] p-2'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className='mt-2 shrink-0 rounded-full border-2 border-border bg-background p-1 transition-all hover:bg-accent'
          aria-label='Expand conversation list'
        >
          <ChevronRightIcon className='h-5 w-5 rotate-180 text-primary' />
        </button>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <div className='flex shrink-0 items-center gap-2 border-pink-50 p-4'>
            <button
              onClick={() => setIsCollapsed(true)}
              className='shrink-0 rounded-full border-2 border-border bg-background p-1 transition-all hover:bg-accent'
              aria-label='Collapse conversation list'
            >
              <ChevronRightIcon className='h-5 w-5 text-primary' />
            </button>
            <div className='flex min-w-0 flex-1 items-center rounded-3xl border border-border p-2'>
              <MagnifyingGlassIcon className='mr-2 h-5 w-5 shrink-0 text-muted-foreground' />
              <input
                type='text'
                placeholder='Search'
                value={searchQuery}
                onChange={handleSearchChange}
                className='min-w-0 flex-1 bg-transparent font-normal text-foreground outline-hidden placeholder:text-muted-foreground'
              />
            </div>
            {activeTab === ConversationTab.MINE && (
              <Button
                data-tour='new-conversation'
                onClick={handleCreateConversation}
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'
              >
                <span className='text-xl'>+</span>
              </Button>
            )}
          </div>
          <hr className='mx-1 mb-2 shrink-0 border-border' />
          {/* Tab switcher */}
          {enableSharing && (
            <div className='mx-1 mb-2 flex shrink-0 rounded-lg bg-muted p-0.5'>
              <button
                onClick={() => handleTabChange(ConversationTab.MINE)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  activeTab === ConversationTab.MINE
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mine
              </button>
              <button
                onClick={() => handleTabChange(ConversationTab.SHARED)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  activeTab === ConversationTab.SHARED
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Library
              </button>
              <button
                onClick={() => handleTabChange(ConversationTab.SHARED_WITH_ME)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  activeTab === ConversationTab.SHARED_WITH_ME
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Shared
              </button>
            </div>
          )}
          <div className='min-h-0 flex-1 overflow-y-auto'>
            {activeTab === ConversationTab.SHARED_WITH_ME ? (
              <SharedWithMeList
                entityType={ShareableEntityType.Conversation}
                onItemClick={handleSharedConversationClick}
                onForkClick={setForkConversationItem}
              />
            ) : (
              <ConversationList
                isSharedTab={activeTab === ConversationTab.SHARED}
                sharedConversations={sharedConversations}
              />
            )}
          </div>
          <ForkConfirmDialog
            isOpen={!!forkConversationItem}
            title={forkConversationItem?.entityTitle || 'Untitled Conversation'}
            entityType='conversation'
            copiedItems={[
              'Conversation settings and messages',
              'Referenced prompts and context configuration',
              'Conversation structure for continued work in your account',
            ]}
            infoNote="Files are not copied. You'll need to attach your own files after forking."
            onConfirm={handleConfirmFork}
            onCancel={() => setForkConversationItem(null)}
          />
        </div>
      )}
    </div>
  )
}

export default ConversationHistory
