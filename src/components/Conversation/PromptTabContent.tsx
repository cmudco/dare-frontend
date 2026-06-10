/**
 * PromptTabContent Component
 *
 * Displays the prompts list inside the PromptSet modal.
 * Handles prompt searching, selection, and version expansion.
 * Uses Redux directly for state management.
 */

import { useState, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid'
import { Plus } from 'lucide-react'
import { AppDispatch } from '@/redux/store'
import { formatDate, groupPrompts } from '@/utils/constants/prompts'
import { openModal, clearSelectedPrompt } from '@/redux/promptSlice'
import { setPrompt } from '@/redux/conversationSlice'
import { Prompt, PublishedPrompt } from '@/redux/types/prompt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { stripHtml } from '@/utils/textUtils'
import { updateConversation } from '@/redux/asyncThunks/conversation'
import { useAppSelector } from '@/redux/hooks'
import { getPromptsLibrary } from '@/redux/asyncThunks/promptsLibrary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

const RichTextPreview = ({ content }: { content: string }) => {
  const truncateHtml = (html: string, maxLength: number = 150): string => {
    if (!html) return ''

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    if (textContent.length <= maxLength) return html

    return html.substring(0, Math.min(html.length, maxLength * 2)) + '...'
  }

  return (
    <div
      className='prose prose-sm max-w-none overflow-hidden text-sm text-muted-foreground **:max-w-full **:overflow-hidden **:text-ellipsis focus:outline-hidden dark:prose-invert'
      dangerouslySetInnerHTML={{ __html: truncateHtml(content || '') }}
    />
  )
}

const PromptTabContent = () => {
  const dispatch = useDispatch<AppDispatch>()
  const enableSharing = useFeatureFlag('enableSharing')
  const prompts = useAppSelector((state) => state.prompt.prompts)
  const { publishedPrompts } = useAppSelector((state) => state.promptsLibrary)
  const currentUserEmail = useAppSelector((state) => state.user.user?.email)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const selectedPrompt = useAppSelector(
    (state) => state.conversation.activeConversation?.prompt
  )
  const { activeConversation } = useAppSelector((state) => state.conversation)

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

  useEffect(() => {
    dispatch(getPromptsLibrary())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedPrompt) {
      const groupedPrompts = groupPrompts(prompts)
      const group = groupedPrompts.find((g) =>
        g.versions.some((v) => v.id === selectedPrompt.id)
      )
      if (
        group &&
        group.versions.length > 1 &&
        group.versions[0].id !== selectedPrompt.id
      ) {
        setExpandedGroups((prev) => {
          const newSet = new Set(prev)
          newSet.add(group.rootPrompt.id)
          return newSet
        })
      }
    }
  }, [selectedPrompt, prompts])

  const handlePromptSelect = (prompt: Prompt) => {
    if (selectedPrompt?.id === prompt.id) {
      dispatch(clearSelectedPrompt())
      if (activeConversation) {
        dispatch(
          updateConversation({
            conversationId: activeConversation.conversationId,
            updates: { promptId: null },
          })
        )
      }
    } else {
      dispatch(setPrompt(prompt))
      if (activeConversation) {
        dispatch(
          updateConversation({
            conversationId: activeConversation.conversationId,
            updates: { promptId: prompt?.id },
          })
        )
      }
    }
  }

  const handleLibraryPromptSelect = (published: PublishedPrompt) => {
    // Convert to prompt format for selection
    const prompt: Prompt = {
      id: published.promptId,
      title: published.title,
      content: published.content,
      version: published.version,
      user: published.authorEmail,
      createdAt: published.publishedAt,
    }

    if (selectedPrompt?.id === prompt.id) {
      dispatch(clearSelectedPrompt())
      if (activeConversation) {
        dispatch(
          updateConversation({
            conversationId: activeConversation.conversationId,
            updates: { promptId: null },
          })
        )
      }
    } else {
      dispatch(setPrompt(prompt))
      if (activeConversation) {
        dispatch(
          updateConversation({
            conversationId: activeConversation.conversationId,
            updates: { promptId: prompt?.id },
          })
        )
      }
    }
  }

  const handleCreatePrompt = () => {
    navigate('/prompts')
    dispatch(openModal())
  }

  const groupedPrompts = useMemo(() => groupPrompts(prompts), [prompts])

  const filteredPrompts = useMemo(() => {
    const filtered = groupedPrompts.filter((group) => {
      const rootTitle = group.rootPrompt.title?.toLowerCase() || ''
      const latestContent = stripHtml(
        group.versions[0].content?.toLowerCase() || ''
      )
      return (
        searchQuery === '' ||
        rootTitle.includes(searchQuery.toLowerCase()) ||
        latestContent.includes(searchQuery.toLowerCase())
      )
    })

    // Sort to show selected prompt's group at the top
    if (selectedPrompt) {
      return filtered.sort((a, b) => {
        const aHasSelected = a.versions.some((v) => v.id === selectedPrompt.id)
        const bHasSelected = b.versions.some((v) => v.id === selectedPrompt.id)
        if (aHasSelected && !bHasSelected) return -1
        if (!aHasSelected && bHasSelected) return 1
        return 0
      })
    }

    return filtered
  }, [groupedPrompts, searchQuery, selectedPrompt])

  const filteredLibraryPrompts = useMemo(() => {
    // Filter out user's own prompts from library view here
    return publishedPrompts.filter((prompt) => {
      const matchesSearch =
        searchQuery === '' ||
        prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.authorEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      // Only show other users' prompts in library
      const isOtherUser = prompt.authorEmail !== currentUserEmail
      return matchesSearch && isOtherUser
    })
  }, [publishedPrompts, searchQuery, currentUserEmail])

  const toggleExpand = (rootId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(rootId)) {
        newSet.delete(rootId)
      } else {
        newSet.add(rootId)
      }
      return newSet
    })
  }

  const renderPromptCard = (
    prompt: Prompt,
    isLatest: boolean = true,
    group?: { rootPrompt: Prompt; versions: Prompt[] }
  ) => {
    const isExpanded = group ? expandedGroups.has(group.rootPrompt.id) : false

    return (
      <div
        className={`mb-3 min-w-0 cursor-pointer overflow-hidden rounded-lg border border-border p-3 text-foreground transition-colors ${
          selectedPrompt?.id === prompt.id
            ? 'bg-primary/10 text-primary'
            : 'bg-background hover:bg-accent'
        }`}
        onClick={() => handlePromptSelect(prompt)}
      >
        <div className='mb-1 flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <h4 className='truncate text-xl font-medium text-foreground'>
              {prompt.title || 'Untitled'}
            </h4>
            <span className='inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
              v{prompt.version || 1}
            </span>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {formatDate(prompt.createdAt)}
            </span>
            {isLatest && group && group.versions.length > 1 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(group.rootPrompt.id)
                }}
              >
                {isExpanded ? (
                  <ChevronUpIcon className='h-4 w-4' />
                ) : (
                  <ChevronDownIcon className='h-4 w-4' />
                )}
              </Button>
            )}
          </div>
        </div>
        <div className='max-h-[4.5em] overflow-hidden'>
          <RichTextPreview content={prompt.content || 'No content'} />
        </div>
      </div>
    )
  }

  const renderLibraryPromptCard = (published: PublishedPrompt) => {
    return (
      <div
        key={published.id}
        className={`mb-3 min-w-0 cursor-pointer overflow-hidden rounded-lg border border-border p-3 text-foreground transition-colors ${
          selectedPrompt?.id === published.promptId
            ? 'bg-primary/10 text-primary'
            : 'bg-background hover:bg-accent'
        }`}
        onClick={() => handleLibraryPromptSelect(published)}
      >
        <div className='mb-1 flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <h4 className='truncate text-xl font-medium text-foreground'>
              {published.title || 'Untitled'}
            </h4>
            <span className='inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
              v{published.version || 1}
            </span>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              by {published.authorEmail}
            </span>
          </div>
        </div>
        <div className='max-h-[4.5em] overflow-hidden'>
          <RichTextPreview content={published.content || 'No content'} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='mb-4 flex items-center gap-3'>
        <div className='relative flex-1'>
          <MagnifyingGlassIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
          <Input
            type='text'
            placeholder='Search prompts'
            className='w-full border-border bg-input pl-9'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          className='flex shrink-0 items-center rounded-xl px-3 py-1 text-white'
          onClick={handleCreatePrompt}
        >
          <Plus />
          Create Prompt
        </Button>
      </div>

      {enableSharing ? (
        <Tabs defaultValue='my-prompts' className='w-full'>
          <TabsList className='mb-4 grid w-full grid-cols-2'>
            <TabsTrigger value='my-prompts'>My Prompts</TabsTrigger>
            <TabsTrigger value='library'>
              Library ({filteredLibraryPrompts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='my-prompts'>
            <div className='max-h-[50vh] overflow-y-auto'>
              {filteredPrompts.length === 0 && (
                <div className='py-6 text-center text-muted-foreground'>
                  {prompts.length === 0
                    ? 'No prompts available'
                    : 'No matching prompts found'}
                </div>
              )}

              {filteredPrompts.map((group) => {
                const isExpanded = expandedGroups.has(group.rootPrompt.id)
                const latestVersion = group.versions[0]

                return (
                  <div key={group.rootPrompt.id}>
                    {renderPromptCard(latestVersion, true, group)}
                    {isExpanded && (
                      <div className='mb-4 space-y-2 pl-4'>
                        {group.versions.slice(1).map((version) => (
                          <div key={version.id}>
                            {renderPromptCard(version, false)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value='library'>
            <div className='max-h-[50vh] overflow-y-auto'>
              {filteredLibraryPrompts.length === 0 && (
                <div className='py-6 text-center text-muted-foreground'>
                  No published prompts from other users
                </div>
              )}

              {filteredLibraryPrompts.map((published) =>
                renderLibraryPromptCard(published)
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className='max-h-[50vh] overflow-y-auto'>
          {filteredPrompts.length === 0 && (
            <div className='py-6 text-center text-muted-foreground'>
              {prompts.length === 0
                ? 'No prompts available'
                : 'No matching prompts found'}
            </div>
          )}

          {filteredPrompts.map((group) => {
            const isExpanded = expandedGroups.has(group.rootPrompt.id)
            const latestVersion = group.versions[0]

            return (
              <div key={group.rootPrompt.id}>
                {renderPromptCard(latestVersion, true, group)}
                {isExpanded && (
                  <div className='mb-4 space-y-2 pl-4'>
                    {group.versions.slice(1).map((version) => (
                      <div key={version.id}>
                        {renderPromptCard(version, false)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default PromptTabContent
