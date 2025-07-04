import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, MessageSquare, Search, Settings, X } from 'lucide-react'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  updateReferencedConversations,
  updateReferencedConversationHistoryLimit,
} from '@/redux/conversationSlice'
import type { Conversation } from '@/redux/types/conversation'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Popover as SettingsPopover,
  PopoverContent as SettingsPopoverContent,
  PopoverTrigger as SettingsPopoverTrigger,
} from '../ui/popover'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'

const ConversationReferenceSelect: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations
  )
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const referencedConversations = useSelector(
    (state: RootState) => state.conversation.referencedConversations
  )
  const referencedConversationHistoryLimit = useSelector(
    (state: RootState) => state.conversation.referencedConversationHistoryLimit
  )

  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter out the active conversation and filter by search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesSearch = (conversation.title || 'New Chat')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const isNotActiveConversation =
        !activeConversation ||
        conversation.conversationId !== activeConversation.conversationId
      return matchesSearch && isNotActiveConversation
    })
  }, [conversations, searchQuery, activeConversation])

  const handleToggleConversation = (conversation: Conversation) => {
    const isAlreadyReferenced = referencedConversations.some(
      (c) => c.conversationId === conversation.conversationId
    )

    const newReferencedConversations = isAlreadyReferenced
      ? referencedConversations.filter(
          (c) => c.conversationId !== conversation.conversationId
        )
      : [...referencedConversations, conversation]

    dispatch(updateReferencedConversations(newReferencedConversations))
  }

  const clearAllReferences = () => {
    dispatch(updateReferencedConversations([]))
  }

  const handleHistoryLimitChange = (values: number[]) => {
    dispatch(updateReferencedConversationHistoryLimit(values[0]))
  }

  const getConversationTitle = (conversation: Conversation) => {
    return conversation.title || 'New Chat'
  }

  const selectedCount = referencedConversations.length

  return (
    <div className='flex items-center gap-1'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            className='dark:bg-dark-chat-history relative flex h-10 border-gray-200 bg-white px-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-dark-icon-unselected dark:text-white dark:hover:bg-dark-icon-unselected'
          >
            <MessageSquare className='h-4 w-4' />
            {selectedCount > 0 && (
              <Badge
                variant='secondary'
                className='ml-2 h-5 min-w-[20px] px-1.5 text-xs'
              >
                {selectedCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-96 border border-border bg-popover p-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-foreground'>
                Reference Conversations
              </h3>
              <div className='flex items-center gap-2'>
                {selectedCount > 0 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={clearAllReferences}
                    className='text-xs'
                  >
                    Clear All
                  </Button>
                )}
                <SettingsPopover
                  open={settingsOpen}
                  onOpenChange={setSettingsOpen}
                >
                  <SettingsPopoverTrigger asChild>
                    <Button variant='ghost' size='sm' className='p-2'>
                      <Settings className='h-4 w-4' />
                    </Button>
                  </SettingsPopoverTrigger>
                  <SettingsPopoverContent className='w-80 border border-border bg-popover p-4'>
                    <div className='space-y-4'>
                      <h4 className='font-medium text-foreground'>
                        Reference Settings
                      </h4>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <label className='text-sm font-medium text-foreground'>
                            History Limit per Conversation
                          </label>
                          <span className='text-sm text-muted-foreground'>
                            {referencedConversationHistoryLimit} messages
                          </span>
                        </div>

                        <Slider
                          value={[referencedConversationHistoryLimit]}
                          min={1}
                          max={20}
                          step={1}
                          onValueChange={handleHistoryLimitChange}
                          className='my-4 cursor-pointer'
                        />

                        <div className='flex justify-between px-1 text-xs text-muted-foreground'>
                          <span>1</span>
                          <span>10</span>
                          <span>20</span>
                        </div>

                        <p className='text-xs text-muted-foreground'>
                          Controls how many recent messages to include from each
                          referenced conversation.
                        </p>
                      </div>
                    </div>
                  </SettingsPopoverContent>
                </SettingsPopover>
              </div>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search conversations...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            {selectedCount > 0 && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>
                  Referenced ({selectedCount}):
                </p>
                <div className='flex flex-wrap gap-1'>
                  {referencedConversations.map((conversation) => (
                    <Badge
                      key={conversation.conversationId}
                      variant='secondary'
                      className='flex items-center gap-1 px-2 py-1'
                    >
                      <span className='max-w-[120px] truncate text-xs'>
                        {getConversationTitle(conversation)}
                      </span>
                      <button
                        onClick={() => handleToggleConversation(conversation)}
                        className='ml-1 hover:text-destructive'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className='max-h-[300px] space-y-1 overflow-y-auto'>
              {filteredConversations.map((conversation) => {
                const isReferenced = referencedConversations.some(
                  (c) => c.conversationId === conversation.conversationId
                )
                return (
                  <div
                    key={conversation.conversationId}
                    onClick={() => handleToggleConversation(conversation)}
                    className='flex cursor-pointer items-center rounded-md p-2 hover:bg-muted'
                  >
                    <div
                      className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                        isReferenced
                          ? 'border-primary bg-primary'
                          : 'border-input hover:border-muted-foreground'
                      }`}
                    >
                      {isReferenced && (
                        <Check className='h-3 w-3 text-primary-foreground' />
                      )}
                    </div>
                    <MessageSquare className='mr-2 h-4 w-4 text-muted-foreground' />
                    <div className='flex-1'>
                      <span
                        className={`text-sm ${
                          isReferenced
                            ? 'font-medium text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {getConversationTitle(conversation)}
                      </span>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
              {filteredConversations.length === 0 && (
                <p className='py-4 text-center text-muted-foreground'>
                  {searchQuery
                    ? 'No conversations match your search.'
                    : 'No other conversations available.'}
                </p>
              )}
            </div>

            <div className='border-t pt-2'>
              <p className='text-xs text-muted-foreground'>
                Referenced conversations will provide context to help the AI
                understand your conversation history.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ConversationReferenceSelect
