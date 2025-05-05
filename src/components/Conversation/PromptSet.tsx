import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { GoCommandPalette } from 'react-icons/go'
import { formatDate, groupPrompts } from '../../utils/constants/prompts'
import { openModal, clearSelectedPrompt } from '@/redux/promptSlice'
import { useNavigate } from 'react-router-dom'
import { setPrompt } from '@/redux/conversationSlice'
import { Prompt } from '@/redux/types/prompt'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Plus } from 'lucide-react'
import { stripHtml } from '../../utils/textUtils'
import { updateConversation } from '@/redux/aynscThunks/conversation'

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
      className='prose prose-sm w-full max-w-full text-sm text-gray-600 dark:prose-invert focus:outline-none'
      dangerouslySetInnerHTML={{ __html: truncateHtml(content || '') }}
    />
  )
}

const PromptSet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const prompts = useSelector((state: RootState) => state.prompt.prompts)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { prompt: selectedPrompt, activeConversation } = useSelector(
    (state: RootState) => ({
      prompt: state.conversation.activeConversation?.prompt,
      activeConversation: state.conversation.activeConversation,
    })
  )
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

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

  const handleCreatePrompt = () => {
    navigate('/prompts')
    dispatch(openModal())
  }

  const groupedPrompts = React.useMemo(() => groupPrompts(prompts), [prompts])

  const filteredPrompts = groupedPrompts.filter((group) => {
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

  const toggleExpand = (rootId: string) => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' className='h-9 w-9 p-0 hover:bg-gray-200'>
          <GoCommandPalette className='h-5 w-5 text-gray-600' />
        </Button>
      </DialogTrigger>

      <DialogContent className='w-[90vw] max-w-2xl rounded-lg bg-white p-6 shadow-md [&>button]:hidden'>
        <div className='mb-4 flex items-center justify-between'>
          <DialogTitle className='text-lg font-bold text-black'>
            Select Prompt
          </DialogTitle>
          <Button
            className='flex items-center rounded-xl px-3 py-1 text-white'
            onClick={handleCreatePrompt}
          >
            <Plus />
            Create Prompt
          </Button>
        </div>

        <div className='relative mb-2'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
          <Input
            type='text'
            placeholder='Search prompts'
            className='w-full bg-white pl-9'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <hr className='mx-1 mb-4 border-gray-200' />

        <div className='max-h-[50vh] overflow-y-auto'>
          {filteredPrompts.length === 0 && (
            <div className='py-6 text-center text-gray-500'>
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
                <div
                  className={`mb-3 rounded-lg border border-gray-100 p-3 text-black transition-colors ${
                    selectedPrompt?.id === latestVersion.id
                      ? 'bg-red-200'
                      : 'bg-muted text-foreground hover:bg-pink-50'
                  }`}
                  onClick={() => handlePromptSelect(latestVersion)}
                >
                  <div className='mb-1 flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                      <h4 className='text-xl font-medium text-gray-800'>
                        {latestVersion.title || 'Untitled'}
                      </h4>
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                        v{latestVersion.version || 1}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>
                        {formatDate(latestVersion.createdAt)}
                      </span>
                      {group.versions.length > 1 && (
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
                    <RichTextPreview
                      content={latestVersion.content || 'No content'}
                    />
                  </div>
                </div>
                {isExpanded && (
                  <div className='mb-4 space-y-2 pl-4'>
                    {group.versions.slice(1).map((version) => (
                      <div
                        key={version.id}
                        className={`mb-3 rounded-lg border border-gray-100 p-3 text-black transition-colors ${
                          selectedPrompt?.id === version.id
                            ? 'bg-red-200'
                            : 'bg-muted text-foreground hover:bg-pink-50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePromptSelect(version)
                        }}
                      >
                        <div className='mb-1 flex items-start justify-between'>
                          <div className='flex items-center gap-2'>
                            <h4 className='text-xl font-medium text-gray-800'>
                              {version.title || 'Untitled'}
                            </h4>
                            <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                              v{version.version || 1}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-gray-500'>
                              {formatDate(version.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className='max-h-[4.5em] overflow-hidden'>
                          <RichTextPreview
                            content={version.content || 'No content'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromptSet
