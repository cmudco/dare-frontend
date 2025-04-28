import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Message as MessageModel } from '../../redux/types/conversation'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, ChevronDown, ChevronUp } from 'lucide-react'
import { RootState } from '@/redux/store'

interface MessageProps {
  message: MessageModel
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const llms = useSelector(
    (state: RootState) => state.conversation.availableModels
  )
  const user = useSelector((state: RootState) => state.user.user)
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false)

  if (!message) {
    return null
  }

  const llm = llms.find((model) => model.id == message.llmId)
  const llmName = llm ? llm.name : 'Unknown LLM'

  const userInitial = user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'

  const toggleSnippets = () => {
    setIsSnippetsOpen(!isSnippetsOpen)
  }

  return (
    <div
      className={`flex flex-col px-5 ${
        message.isSender ? 'items-end' : 'items-start'
      } mb-4`}
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
        <div
          className={`relative max-w-[95%] text-wrap rounded-xl px-5 py-3 ${
            message.isSender ? 'bg-gray-100' : 'bg-gray-100'
          } group inline-block`}
        >
          <div
            className={`text-wrap font-normal ${
              message.streaming ? 'animate-pulse' : ''
            }`}
          >
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className='prose !max-w-none'
              >
                {message.streaming ? `${message.message}▋` : message.message}
              </ReactMarkdown>
            </div>
          </div>

          {!message.isSender && !message.streaming && (
            <button className='absolute -right-8 -top-2 mr-2 mt-2 hidden text-gray-500 hover:text-gray-700 group-hover:block'>
              <ArrowPathIcon className='h-5 w-5 text-gray-900' />
            </button>
          )}
        </div>
        {message.isSender && (
          <div className='ml-2 mt-1 flex-shrink-0'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-medium text-white'>
              {userInitial.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {!message.isSender && !message.streaming && message.llmId && (
        <div
          className={`mt-1 text-xs text-gray-500 ${
            message.isSender ? 'text-right' : 'pl-10 text-left'
          }`}
        >
          {llmName}
        </div>
      )}

      {!message.isSender &&
        !message.streaming &&
        message.snippets &&
        message.snippets.length > 0 && (
          <div className='mt-2 w-full max-w-[95%] pl-10'>
            <button
              onClick={toggleSnippets}
              className='flex items-center text-sm text-gray-600 hover:text-gray-800'
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
                      className='rounded-r-lg border-l-4 border-gray-300 bg-gray-50 p-3 pl-4'
                    >
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-700'>
                          From {snippet.file.name} (Score:{' '}
                          {snippet.similarityScore.toFixed(2)})
                        </span>
                        <span className='text-xs text-gray-500'>
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
                      <p className='text-sm text-gray-600'>{snippet.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
    </div>
  )
}

export default Message
