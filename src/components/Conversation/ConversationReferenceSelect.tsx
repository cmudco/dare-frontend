import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Check,
  FileText,
  Fingerprint,
  MessageSquare,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  updateReferencedConversations,
  updateReferencedConversationHistoryLimit,
  updateReferencedSummaries,
  updateMemoryEnabled,
} from '@/redux/conversationSlice'
import {
  fetchConversationSummaries,
  updateConversation,
} from '@/redux/asyncThunks/conversation'
import type { Conversation } from '@/redux/types/conversation'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Popover as SettingsPopover,
  PopoverContent as SettingsPopoverContent,
  PopoverTrigger as SettingsPopoverTrigger,
} from '../ui/popover'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import ConversationSummarySelect from './ConversationSummarySelect'

const ConversationReferenceSelect: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const enableMemory = useFeatureFlag('enableMemory')
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
  const referencedSummaries = useSelector(
    (state: RootState) => state.conversation.referencedSummaries
  )

  const memoryEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.memoryEnabled ?? state.conversation.memoryEnabled
  )

  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('references')

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

  const removeSummary = (summaryId: number) => {
    dispatch(
      updateReferencedSummaries(
        referencedSummaries.filter((s) => s.id !== summaryId)
      )
    )
  }

  const clearAllSummaries = () => {
    dispatch(updateReferencedSummaries([]))
  }

  const handleHistoryLimitChange = (values: number[]) => {
    dispatch(updateReferencedConversationHistoryLimit(values[0]))
  }

  const handleMemoryToggle = (checked: boolean) => {
    dispatch(updateMemoryEnabled(checked))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { memoryEnabled: checked },
        })
      )
    }
  }

  const getConversationTitle = (conversation: Conversation) => {
    return conversation.title || 'New Chat'
  }

  const selectedCount =
    referencedConversations.length + referencedSummaries.length
  const searchPlaceholder =
    activeTab === 'references'
      ? 'Search conversations...'
      : 'Search summaries...'

  useEffect(() => {
    if (!open || activeTab !== 'summaries') {
      return
    }
    dispatch(fetchConversationSummaries())
  }, [activeTab, dispatch, open])

  return (
    <div data-tour='reference-select' className='flex items-center gap-1'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='ghost' className='h-9 w-9 p-0 hover:bg-accent'>
            <MessageSquare className='h-5 w-5 text-muted-foreground transition-colors hover:text-foreground' />
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
        <PopoverContent className='w-[min(430px,calc(100vw-2rem))] border border-border bg-popover p-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-foreground'>
                Conversation Context
              </h3>
              <div className='flex items-center gap-2'>
                {enableMemory && (
                  <div className='flex items-center gap-1.5'>
                    <Fingerprint className='h-3.5 w-3.5 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>
                      Memory
                    </span>
                    <Switch
                      checked={memoryEnabled}
                      onCheckedChange={handleMemoryToggle}
                      aria-label='Use memory in this conversation'
                    />
                  </div>
                )}
                {activeTab === 'references' &&
                  referencedConversations.length > 0 && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearAllReferences}
                      className='text-xs'
                    >
                      Clear All
                    </Button>
                  )}
                {activeTab === 'summaries' &&
                  referencedSummaries.length > 0 && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearAllSummaries}
                      className='text-xs'
                    >
                      Clear All
                    </Button>
                  )}
                {activeTab === 'references' && (
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
                            Controls how many recent messages to include from
                            each referenced conversation.
                          </p>
                        </div>
                      </div>
                    </SettingsPopoverContent>
                  </SettingsPopover>
                )}
              </div>
            </div>

            {/* What the switch above actually turns on. Memory is the one
                control here that both reads and writes, so it says so. */}
            {enableMemory && (
              <div className='rounded-xl border border-border bg-muted/40 px-3 py-2.5'>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {memoryEnabled ? (
                    <>
                      DARE brings what it knows about you into this
                      conversation, can search your past conversations when it
                      needs to, and reads each finished reply for anything worth
                      keeping.
                    </>
                  ) : (
                    <>
                      Memory is off for this conversation: nothing is recalled,
                      and nothing new is remembered.
                    </>
                  )}{' '}
                  <Link
                    to='/memory'
                    onClick={() => setOpen(false)}
                    className='font-medium text-foreground underline underline-offset-2 hover:text-dare'
                  >
                    See what it remembers
                  </Link>
                </p>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2 rounded-xl border border-border bg-muted p-1'>
                <TabsTrigger
                  value='references'
                  className='gap-2 rounded-lg text-xs'
                >
                  <MessageSquare className='h-4 w-4' />
                  Reference Conversations
                </TabsTrigger>
                <TabsTrigger
                  value='summaries'
                  className='gap-2 rounded-lg text-xs'
                >
                  <FileText className='h-4 w-4' />
                  Conversation Summaries
                </TabsTrigger>
              </TabsList>

              <div className='relative mt-4'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='rounded-xl pl-10'
                />
              </div>

              <TabsContent value='references' className='mt-4 space-y-4'>
                {selectedCount > 0 && (
                  <div className='rounded-2xl border border-border bg-muted p-3'>
                    <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                      Referenced ({selectedCount})
                    </p>
                    <div className='mt-2 flex flex-wrap gap-1.5'>
                      {referencedConversations.map((conversation) => (
                        <Badge
                          key={conversation.conversationId}
                          variant='secondary'
                          className='flex max-w-[190px] min-w-0 items-center gap-1 px-2 py-1'
                        >
                          <span className='max-w-[145px] min-w-0 truncate text-xs'>
                            {getConversationTitle(conversation)}
                          </span>
                          <button
                            onClick={() =>
                              handleToggleConversation(conversation)
                            }
                            className='ml-1 hover:text-destructive'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className='max-h-[320px] space-y-2 overflow-y-auto pr-1'>
                  {filteredConversations.map((conversation) => {
                    const isReferenced = referencedConversations.some(
                      (item) =>
                        item.conversationId === conversation.conversationId
                    )
                    return (
                      <div
                        key={conversation.conversationId}
                        onClick={() => handleToggleConversation(conversation)}
                        className={`flex cursor-pointer items-center rounded-2xl border px-3 py-3 transition-colors ${
                          isReferenced
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-border bg-card hover:bg-accent'
                        }`}
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
                        <MessageSquare className='mr-3 h-4 w-4 text-muted-foreground' />
                        <div className='min-w-0 flex-1'>
                          <span
                            className={`block truncate pr-2 text-sm ${
                              isReferenced
                                ? 'font-semibold text-primary'
                                : 'text-foreground'
                            }`}
                          >
                            {getConversationTitle(conversation)}
                          </span>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {new Date(
                              conversation.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {filteredConversations.length === 0 && (
                    <p className='py-6 text-center text-sm text-muted-foreground'>
                      {searchQuery
                        ? 'No conversations match your search.'
                        : 'No other conversations available.'}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='summaries' className='mt-4 space-y-4'>
                {referencedSummaries.length > 0 && (
                  <div className='rounded-2xl border border-primary/40 bg-primary/10 p-3'>
                    <p className='text-xs font-semibold tracking-wide text-primary uppercase'>
                      Selected ({referencedSummaries.length})
                    </p>
                    <div className='mt-2 flex flex-wrap gap-1.5'>
                      {referencedSummaries.map((summary) => (
                        <Badge
                          key={summary.id}
                          variant='secondary'
                          className='flex max-w-[190px] min-w-0 items-center gap-1 px-2 py-1'
                        >
                          <span className='max-w-[145px] min-w-0 truncate text-xs'>
                            {summary.conversationTitle || 'New Chat'}
                          </span>
                          <button
                            onClick={() => removeSummary(summary.id)}
                            className='ml-1 hover:text-destructive'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <ConversationSummarySelect searchQuery={searchQuery} />
              </TabsContent>
            </Tabs>

            <div className='border-t border-border pt-3'>
              <p className='text-xs text-muted-foreground'>
                {activeTab === 'references'
                  ? 'Referenced conversations provide extra context for the current chat.'
                  : 'Conversation summaries refresh after every 5 completed assistant responses in a conversation.'}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ConversationReferenceSelect
