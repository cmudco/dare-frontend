import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MessageProps } from '../../redux/types/conversation'
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
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react'
import { RootState } from '@/redux/store'
import mermaid from 'mermaid'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from './CodeBlock'
import { MermaidBlock } from './MermaidBlock'
import { PencilIcon } from '@heroicons/react/20/solid'
import { updateMessageThunk } from '../../redux/asyncThunks/conversation'
import { AppDispatch } from '../../redux/store'
import { regenerateResponse } from '@/redux/asyncThunks/websocket'
import FeedbackModal from './FeedbackModal'
import MessageMetadata from './MessageMetadata'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

const Message: React.FC<MessageProps> = ({
  message,
  onEditMessage,
  onContentRendered,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const llms = useSelector((state: RootState) => state.conversation.allModels)
  const user = useSelector((state: RootState) => state.user.user)
  const conversationSettings = useSelector(
    (state: RootState) => state.user.conversationSettings
  )
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackIsLike, setFeedbackIsLike] = useState(false)
  const [isMetadataOpen, setIsMetadataOpen] = useState(false)

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

  const llm = llms.find((model) => model.id === message.llmId)
  const llmName = llm ? llm.name : 'Unknown LLM'
  const userInitial = user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'

  const toggleSnippets = () => setIsSnippetsOpen(!isSnippetsOpen)
  const toggleVersion = () => {
    setShowOriginal(!showOriginal)
  }

  const handleReaction = (isLike: boolean) => {
    if (!message.id) return

    setFeedbackIsLike(isLike)
    setIsFeedbackModalOpen(true)
  }

  const handleFeedbackSubmit = (feedback: string) => {
    if (message.id) {
      dispatch(
        updateMessageThunk({
          messageId: message.id,
          reaction: {
            feedbackType: feedbackIsLike
              ? FeedbackType.LIKE
              : FeedbackType.DISLIKE,
            feedbackText: feedback.trim() || undefined,
          },
        })
      )
    }
  }

  const handleEdit = () => {
    if (message.isSender && onEditMessage) {
      onEditMessage(message.id, message.message)
    }
  }

  const handleRegenerate = () => {
    if (!message.isSender) {
      dispatch(regenerateResponse({ messageId: message.id }))
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
        message.isSender ? 'items-end' : 'items-start'
      } group mb-4`}
    >
      <div
        className={`flex w-full max-w-[100%] ${
          message.isSender ? 'justify-end' : 'justify-start'
        } items-start`}
      >
        {!message.isSender && (
          <div className='mr-2 mt-1 flex-shrink-0'>
            <Bot className='h-8 w-8' />
          </div>
        )}

        {message.isSender && !message.streaming && (
          <div className='mr-2 mt-2 flex flex-shrink-0 items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
            <button
              className='flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground'
              onClick={() => navigator.clipboard.writeText(message.message)}
              aria-label='Copy message'
            >
              <Copy className='h-4 w-4' />
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
            message.isSender
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
              className={`prose ${getFontSizeClasses()} max-w-none text-foreground dark:prose-invert focus:outline-none prose-code:bg-transparent prose-code:p-0 prose-code:shadow-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={{
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
                        className='not-prose rounded border border-border bg-muted px-1 text-foreground transition-colors hover:bg-muted/80'
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
            </div>
          </div>
        </div>

        {message.isSender && (
          <div className='ml-2 mt-1 flex-shrink-0'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-medium text-white'>
              {userInitial.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {!message.isSender && !message.streaming && (
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
            className='mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground'
            onClick={() => navigator.clipboard.writeText(message.message)}
            aria-label='Copy AI response'
          >
            <Copy className='h-4 w-4' />
          </button>
          <button
            className='mr-1 flex h-7 min-w-[28px] items-center justify-center rounded bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground'
            onClick={() => setIsMetadataOpen(true)}
            aria-label='View message metadata'
          >
            <Info className='h-4 w-4' />
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

      {!message.isSender && !message.streaming && message.llmId && (
        <div
          className={`mt-1 text-xs text-muted-foreground ${
            message.isSender ? 'text-right' : 'pl-10 text-left'
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

      {!message.isSender &&
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

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        isLike={feedbackIsLike}
      />

      <MessageMetadata
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        message={message}
      />
    </div>
  )
}

export default Message
