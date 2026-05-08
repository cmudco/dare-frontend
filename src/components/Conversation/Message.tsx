import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  MessageProps,
  MessageReaction,
  isSenderMessage,
} from '@/redux/types/conversation'
import { FeedbackType } from '@/utils/constants/conversation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Info,
  Trash2,
} from 'lucide-react'
import { RootState } from '@/redux/store'
import mermaid from 'mermaid'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from './CodeBlock'
import { MermaidBlock } from './MermaidBlock'
import { PencilIcon } from '@heroicons/react/20/solid'
import {
  updateMessageThunk,
  updateConversationFeedbackTracking,
  deleteMessage,
} from '@/redux/asyncThunks/conversation'
import { AppDispatch } from '../../redux/store'
import { regenerateSocketResponse } from '@/redux/asyncThunks/socketMessages'
import FeedbackModal from './FeedbackModal'
import MessageMetadata from './MessageMetadata'
import WebSearchSources from './WebSearchSources'
import MemoryContextSources from './MemoryContextSources'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { ArtifactCard } from '../Artifacts'
import { ToolCallIndicator } from '../MCP/ToolCallIndicator'
import { features } from '@/config/environment'
import { debugLog } from '@/utils/debugLogger'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

const Message: React.FC<MessageProps> = ({
  message,
  onEditMessage,
  onContentRendered,
  shouldShowAutoFeedback,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const llms = useSelector((state: RootState) => state.conversation.allModels)
  const user = useSelector((state: RootState) => state.user.user)
  const conversationSettings = useSelector(
    (state: RootState) => state.user.conversationSettings
  )
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const isReadOnly = activeConversation?.isOwner === false
  const activeConversationMessages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [feedbackIsLike, setFeedbackIsLike] = useState<boolean | undefined>(
    undefined
  )
  const [isMetadataOpen, setIsMetadataOpen] = useState(false)
  const [feedbackModalState, setFeedbackModalState] = useState<{
    isOpen: boolean
    source: 'thumbs' | 'manual' | 'auto'
  }>({
    isOpen: false,
    source: 'auto', // Just an arbitrary default
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [copiedUserMessage, setCopiedUserMessage] = useState(false)
  const [copiedAiResponse, setCopiedAiResponse] = useState(false)

  // Open modal when parent signals auto-feedback should show
  useEffect(() => {
    if (shouldShowAutoFeedback && !feedbackModalState.isOpen) {
      setFeedbackIsLike(undefined) // re-set this state
      setFeedbackModalState({
        isOpen: true,
        source: 'auto',
      })
    }
  }, [shouldShowAutoFeedback])

  // Function to get font size classes based on user preference
  const getFontSizeClasses = () => {
    const fontSize = conversationSettings?.fontSize || 'sm'
    switch (fontSize) {
      case 'xs':
        return 'prose-xs text-xs'
      case 'sm':
        return 'prose-sm text-sm'
      case 'base':
        return 'prose text-base'
      case 'lg':
        return 'prose-lg text-lg'
      case 'xl':
        return 'prose-xl text-xl'
      default:
        return 'prose-sm text-sm'
    }
  }

  if (!message) return null

  // Real DB-backed LLM messages carry a numeric `message.llm` FK; LiteLLM
  // dispatches leave that null and stamp `litellmModelName` instead.
  const llm =
    message.llm != null
      ? llms.find((model) => model.id === message.llm)
      : undefined
  const llmName = llm ? llm.name : (message.litellmModelName ?? 'Unknown LLM')
  const userInitial = user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'

  const toggleSnippets = () => setIsSnippetsOpen(!isSnippetsOpen)
  const toggleVersion = () => {
    setShowOriginal(!showOriginal)
  }

  const handleReaction = (isLike: boolean) => {
    if (!message.id) return

    setFeedbackIsLike(isLike)
    setFeedbackModalState({
      isOpen: true,
      source: 'thumbs',
    })
  }

  const handleShowFeedback = () => {
    if (!message.id) return

    setFeedbackIsLike(undefined)
    setFeedbackModalState({
      isOpen: true,
      source: 'manual',
    })
  }

  const handleFeedbackSubmit = (
    feedback: string,
    source: 'thumbs' | 'manual' | 'auto',
    thumbSelection?: boolean
  ) => {
    if (message.id) {
      const reaction: MessageReaction = {
        feedbackText: feedback.trim() || undefined,
        feedbackSource: source,
      }
      if (thumbSelection !== undefined) {
        reaction.feedbackType = thumbSelection
          ? FeedbackType.LIKE
          : FeedbackType.DISLIKE
      }
      debugLog('Sending reaction:', reaction)

      dispatch(updateMessageThunk({ messageId: message.id, reaction }))

      // If feedback is triggering by clicking thumb or manually providing it, reset the auto-prompt interval timer
      if ((source === 'manual' || source === 'thumbs') && activeConversation) {
        const messageResponseCount = activeConversationMessages.filter(
          (m) => !isSenderMessage(m)
        ).length

        dispatch(
          updateConversationFeedbackTracking({
            conversationId: activeConversation.conversationId,
            feedbackAutoPromptCount:
              (activeConversation.feedbackAutoPromptCount || 0) + 1, // remove if we still want an auto-prompt
            feedbackLastPromptMessageCount: messageResponseCount,
            feedbackLastPromptTimestamp: new Date().toISOString(),
          })
        )
      }
    }
  }

  const handleModalClose = () => {
    setFeedbackModalState({ ...feedbackModalState, isOpen: false })
  }

  const handleEdit = () => {
    if (isSenderMessage(message) && onEditMessage) {
      onEditMessage(message.id, message.message)
    }
  }

  const handleRegenerate = () => {
    if (!isSenderMessage(message)) {
      dispatch(regenerateSocketResponse({ messageId: message.id }))
    }
  }

  const handleDeleteMessage = async () => {
    if (message.id) {
      await dispatch(deleteMessage(message.id.toString()))
    }
  }

  const displayMessage =
    showOriginal && message.originalMessage
      ? message.originalMessage
      : message.message
  const buttonLabel = message.isRegenerated
    ? showOriginal
      ? 'Regenerated'
      : 'Original'
    : message.isEdited
      ? showOriginal
        ? 'Edited'
        : 'Original'
      : ''

  return (
    <div
      className={`flex flex-col px-5 ${
        isSenderMessage(message) ? 'items-end' : 'items-start'
      } group mb-4`}
    >
      <div
        className={`flex w-full max-w-[100%] ${
          isSenderMessage(message) ? 'justify-end' : 'justify-start'
        } items-start`}
      >
        {!isSenderMessage(message) && (
          <div className='mr-2 mt-1 flex-shrink-0'>
            <Bot className='h-8 w-8' />
          </div>
        )}

        {isSenderMessage(message) && !message.streaming && !isReadOnly && (
          <div className='mr-2 mt-2 flex flex-shrink-0 items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
            <button
              className={`flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 transition-colors ${
                copiedUserMessage
                  ? 'text-green-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                navigator.clipboard.writeText(message.message)
                setCopiedUserMessage(true)
                setTimeout(() => setCopiedUserMessage(false), 2000)
              }}
              aria-label={copiedUserMessage ? 'Copied!' : 'Copy message'}
            >
              {copiedUserMessage ? (
                <Check className='h-4 w-4' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
            </button>
            <button
              className={`mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 transition-colors ${
                message.isEdited || message.isRegenerated
                  ? showOriginal
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={handleEdit}
              aria-label='Edit message'
            >
              <PencilIcon className='h-4 w-4' />
            </button>
            <button
              className='mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-red-500'
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label='Delete message'
            >
              <Trash2 className='h-4 w-4' />
            </button>
            {(message.isEdited || message.isRegenerated) && buttonLabel && (
              <button
                className={`mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 transition-colors ${
                  showOriginal
                    ? message.isRegenerated
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={toggleVersion}
                aria-label={
                  showOriginal
                    ? message.isRegenerated
                      ? 'Show Regenerated'
                      : 'Show Edited'
                    : 'Show Original'
                }
              >
                {buttonLabel}
              </button>
            )}
          </div>
        )}

        <div
          className={`relative mb-2 max-w-[95%] text-wrap rounded-xl px-5 py-3 ${
            isSenderMessage(message)
              ? 'border border-blue-200 bg-blue-50 dark:border-blue-800/30 dark:bg-blue-900/20'
              : 'border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800'
          } inline-block hover:z-20`}
        >
          <div
            className={`text-wrap font-normal ${
              message.streaming ? 'animate-pulse' : ''
            }`}
          >
            <div
              className={`prose ${getFontSizeClasses()} max-w-full text-foreground dark:prose-invert focus:outline-none prose-code:bg-transparent prose-code:p-0 prose-code:shadow-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none`}
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={
                  message.streaming
                    ? [rehypeKatex, rehypeRaw]
                    : [rehypeKatex, rehypeHighlight, rehypeRaw]
                }
                components={{
                  // Handle tables
                  table({ children, ...props }) {
                    return (
                      <div className='max-w-full overflow-x-auto'>
                        <table className='min-w-full' {...props}>
                          {children}
                        </table>
                      </div>
                    )
                  },
                  // Handle pre blocks
                  pre({ children, ...props }) {
                    return (
                      <pre
                        className='max-w-full overflow-x-auto whitespace-pre-wrap break-words break-all'
                        {...props}
                      >
                        {children}
                      </pre>
                    )
                  },
                  // Handle paragraphs
                  p({ children, ...props }) {
                    return (
                      <p
                        className='break-words'
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                        {...props}
                      >
                        {children}
                      </p>
                    )
                  },
                  // Handle links to prevent long URLs from overflowing
                  a({ children, href, ...props }) {
                    return (
                      <a
                        href={href}
                        className='break-all'
                        style={{
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                        }}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => {
                          if (!href) return
                          e.preventDefault()
                          window.open(href, '_blank', 'noopener,noreferrer')
                        }}
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  },
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    if (match && match[1] === 'mermaid') {
                      if (message.streaming) {
                        return (
                          <div className='not-prose my-4'>
                            Loading diagram...
                          </div>
                        )
                      }
                      return (
                        <MermaidBlock
                          code={String(children).trim()}
                          onRendered={onContentRendered}
                          streaming={message.streaming}
                        />
                      )
                    }
                    if (match) {
                      return (
                        <CodeBlock className={className} props={props}>
                          {children}
                        </CodeBlock>
                      )
                    }
                    return (
                      <code
                        className='not-prose break-all rounded border border-border bg-muted px-1 text-foreground transition-colors hover:bg-muted/80'
                        style={{
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.streaming ? `${displayMessage}\u258b` : displayMessage}
              </ReactMarkdown>

              {/* User Uploaded Images Display */}
              {(() => {
                const uploadedImages = message.files?.filter(
                  (file) => file.mediaType === 'image' && !file.isGenerated
                )

                if (uploadedImages?.length) {
                  return (
                    <div className='not-prose mb-3 flex flex-wrap gap-2'>
                      {uploadedImages.map((file) => (
                        <div
                          key={file.id}
                          className='relative rounded-lg border border-gray-200 dark:border-gray-700'
                        >
                          <img
                            src={`${import.meta.env.VITE_DJANGO_BACKEND_URL}${file.file}`}
                            alt={file.name}
                            className='max-h-64 max-w-xs rounded-lg object-contain'
                          />
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              })()}

              {/* Generated Image Display */}
              {(() => {
                // Check for generated image in generatedImage field (WebSocket)
                if (message.generatedImage) {
                  return (
                    <div className='not-prose mt-4'>
                      <img
                        src={`${import.meta.env.VITE_DJANGO_BACKEND_URL}${message.generatedImage.fileUrl}`}
                        alt={message.generatedImage.prompt}
                        className='max-w-full rounded-lg shadow-md'
                      />
                      <div className='mt-2 space-y-1 text-xs text-muted-foreground'>
                        <p>
                          <span className='font-medium'>Prompt:</span>{' '}
                          {message.generatedImage.prompt}
                        </p>
                        {message.generatedImage.revisedPrompt && (
                          <p>
                            <span className='font-medium'>Revised:</span>{' '}
                            {message.generatedImage.revisedPrompt}
                          </p>
                        )}
                        <p>
                          {message.generatedImage.model} •{' '}
                          {message.generatedImage.size} • $
                          {message.generatedImage.cost}
                        </p>
                      </div>
                    </div>
                  )
                }

                // Check for generated images in files array (from history)
                const generatedImages = message.files?.filter(
                  (file) =>
                    file.isGenerated && file.mediaType === 'generated_image'
                )

                if (generatedImages && generatedImages.length > 0) {
                  return (
                    <>
                      {generatedImages.map((file) => (
                        <div key={file.id} className='not-prose mt-4'>
                          <img
                            src={`${import.meta.env.VITE_DJANGO_BACKEND_URL}${file.file}`}
                            alt={file.generationPrompt || file.name}
                            className='max-w-full rounded-lg shadow-md'
                          />
                          <div className='mt-2 space-y-1 text-xs text-muted-foreground'>
                            <p>
                              <span className='font-medium'>Prompt:</span>{' '}
                              {file.generationPrompt}
                            </p>
                            {file.revisedPrompt && (
                              <p>
                                <span className='font-medium'>Revised:</span>{' '}
                                {file.revisedPrompt}
                              </p>
                            )}
                            {file.generationParams && (
                              <p>
                                {file.generationParams.model} •{' '}
                                {file.generationParams.size}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )
                }

                return null
              })()}

              {/* Artifact Card - Show when message has associated artifact */}
              {features.enableArtifacts && message.artifactId && (
                <ArtifactCard artifactId={message.artifactId} />
              )}
            </div>
          </div>
        </div>

        {isSenderMessage(message) && (
          <div className='ml-2 mt-1 flex-shrink-0'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-medium text-white'>
              {userInitial.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {!isSenderMessage(message) && !message.streaming && !isReadOnly && (
        <div className='flex w-full max-w-[95%] pl-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
          <button
            className='flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground'
            onClick={handleRegenerate}
            aria-label='Regenerate AI response'
          >
            <RefreshCw className='h-4 w-4' />
          </button>

          <button
            className={`flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 ${
              message.feedbackType === FeedbackType.LIKE
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleReaction(true)}
            aria-label={
              message.feedbackType === FeedbackType.LIKE
                ? 'Remove like'
                : 'Like response'
            }
          >
            <ThumbsUp className='h-4 w-4' />
          </button>

          <button
            className={`flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 ${
              message.feedbackType === FeedbackType.DISLIKE
                ? 'text-red-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleReaction(false)}
            aria-label={
              message.feedbackType === FeedbackType.DISLIKE
                ? 'Remove dislike'
                : 'Dislike response'
            }
          >
            <ThumbsDown className='h-4 w-4' />
          </button>

          <button
            onClick={() => handleShowFeedback()}
            className={`ml-2 px-2 text-sm ${!(message.feedbackType || message.feedbackText) ? 'hover:underline' : ''}`}
          >
            {message.feedbackType || message.feedbackText ? (
              <>
                <span className='text-green-600'>✓</span>
                <span className='text-gray-600'> Feedback Recorded</span>
              </>
            ) : (
              <span className='text-gray-600'>Give Feedback</span>
            )}
          </button>

          <button
            className={`mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 transition-colors ${
              copiedAiResponse
                ? 'text-green-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              navigator.clipboard.writeText(message.message)
              setCopiedAiResponse(true)
              setTimeout(() => setCopiedAiResponse(false), 2000)
            }}
            aria-label={copiedAiResponse ? 'Copied!' : 'Copy AI response'}
          >
            {copiedAiResponse ? (
              <Check className='h-4 w-4' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
          </button>
          <button
            className='mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground'
            onClick={() => setIsMetadataOpen(true)}
            aria-label='View message metadata'
          >
            <Info className='h-4 w-4' />
          </button>
          <button
            className='mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-red-500'
            onClick={() => setIsDeleteModalOpen(true)}
            aria-label='Delete message'
          >
            <Trash2 className='h-4 w-4' />
          </button>
          {(message.isEdited || message.isRegenerated) && buttonLabel && (
            <button
              className={`mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 transition-colors ${
                showOriginal
                  ? message.isRegenerated
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={toggleVersion}
              aria-label={
                showOriginal
                  ? message.isRegenerated
                    ? 'Show Regenerated'
                    : 'Show Edited'
                  : 'Show Original'
              }
            >
              {buttonLabel}
            </button>
          )}
        </div>
      )}

      {!isSenderMessage(message) && !message.streaming && message.llm && (
        <div
          className={`mt-1 text-xs text-muted-foreground ${
            isSenderMessage(message) ? 'text-right' : 'pl-10 text-left'
          }`}
        >
          <span>{llmName}</span>
          {message.cost && (
            <span className='ml-2 font-medium text-green-600'>
              ${parseFloat(message.cost).toFixed(4)}
            </span>
          )}
        </div>
      )}

      {!isSenderMessage(message) &&
        !message.streaming &&
        message.snippets &&
        message.snippets.length > 0 && (
          <div className='mt-2 w-full max-w-[95%] pl-10'>
            <button
              onClick={toggleSnippets}
              className='flex items-center text-sm text-muted-foreground hover:text-foreground'
            >
              {isSnippetsOpen ? (
                <ChevronUp className='mr-1 h-4 w-4' />
              ) : (
                <ChevronDown className='mr-1 h-4 w-4' />
              )}
              {isSnippetsOpen
                ? 'Hide Matched Snippets'
                : `Show Matched Snippets (${message.snippets.length})`}
            </button>
            {isSnippetsOpen && (
              <div className='mt-2 space-y-3'>
                {[...message.snippets]
                  .sort((a, b) => b.similarityScore - a.similarityScore)
                  .map((snippet) => (
                    <div
                      key={snippet.id}
                      className='rounded-r-lg border-l-4 border-border bg-muted p-3 pl-4'
                    >
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='text-sm font-medium text-foreground'>
                          From {snippet.file.name} (Score:{' '}
                          {snippet.similarityScore.toFixed(2)})
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {snippet.vectorDbSource ? (
                            <>
                              <span className='font-medium'>
                                {snippet.vectorDbSource}
                              </span>{' '}
                              - Chunk {snippet.chunkIndex}
                            </>
                          ) : (
                            <>Chunk {snippet.chunkIndex}</>
                          )}
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {snippet.text}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      {/* Web Search Sources */}
      {!isSenderMessage(message) &&
        !message.streaming &&
        message.webSearchSources &&
        message.webSearchSources.length > 0 && (
          <WebSearchSources sources={message.webSearchSources} />
        )}

      {/* Memory Context Sources */}
      {!isSenderMessage(message) &&
        !message.streaming &&
        message.memoryContextData &&
        message.memoryContextData.length > 0 && (
          <MemoryContextSources items={message.memoryContextData} />
        )}

      {/* MCP Tool Calls - Show tool usage indicator for AI messages */}
      {!isSenderMessage(message) &&
        !message.streaming &&
        message.mcpToolCalls &&
        message.mcpToolCalls.length > 0 && (
          <div className='mt-2 max-w-[95%] pl-10'>
            <ToolCallIndicator toolCalls={message.mcpToolCalls} />
          </div>
        )}

      <FeedbackModal
        isOpen={feedbackModalState.isOpen}
        onClose={handleModalClose}
        onSubmit={handleFeedbackSubmit}
        isLike={feedbackIsLike}
        source={feedbackModalState.source}
      />

      <MessageMetadata
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        message={message}
      />

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteMessage}
        title='Delete Message'
        description='Are you sure you want to delete this message? This will remove it from the conversation history.'
        confirmText='Delete'
        cancelText='Cancel'
      />
    </div>
  )
}

export default Message
