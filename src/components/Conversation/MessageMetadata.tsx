import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Message } from '@/redux/types/conversation'
import { FeedbackType } from '@/utils/constants/conversation'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  X,
  Bot,
  User,
  Clock,
  Coins,
  Zap,
  FileText,
  Brain,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit,
  RotateCcw,
  Tag,
} from 'lucide-react'
import { formatDistance } from 'date-fns'
import { getTagColor } from '@/utils/files'

interface MessageMetadataProps {
  isOpen: boolean
  onClose: () => void
  message: Message
}

const MessageMetadata: React.FC<MessageMetadataProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  const availableModels = useSelector(
    (state: RootState) => state.conversation.availableModels
  )

  const getLLMName = (llmId?: number) => {
    if (!llmId) return 'N/A'
    const llm = availableModels.find((model) => model.id === llmId)
    return llm ? llm.name : `Model ${llmId}`
  }

  const formatCost = (cost?: string | null) => {
    if (!cost) return '0.0000'
    return parseFloat(cost).toFixed(4)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      relative: formatDistance(date, new Date(), { addSuffix: true }),
      absolute: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
  }

  const getSenderTypeInfo = () => {
    if (message.isSender) {
      return {
        icon: <User className='h-4 w-4' />,
        label: 'User',
        color: 'bg-blue-100 text-blue-800',
      }
    } else {
      return {
        icon: <Bot className='h-4 w-4' />,
        label: 'AI Assistant',
        color: 'bg-purple-100 text-purple-800',
      }
    }
  }

  const dateInfo = formatDate(message.date)
  const senderInfo = getSenderTypeInfo()

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className='fixed bottom-0 right-0 top-0 mt-0 h-full w-[50vw] rounded-l-lg bg-white p-0 shadow-lg'>
        <ScrollArea className='h-full w-full'>
          <div className='p-4'>
            <DrawerHeader className='p-0 text-left'>
              <div className='flex items-center justify-between px-6 py-4'>
                <DrawerTitle className='flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5' />
                  Message Metadata
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant='ghost' size='icon'>
                    <X className='h-4 w-4' />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className='space-y-6 p-6'>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <MessageSquare className='h-5 w-5' />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Message ID
                      </label>
                      <p className='rounded bg-gray-100 px-2 py-1 font-mono text-sm'>
                        {message.id}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Sender
                      </label>
                      <div className='flex items-center gap-2'>
                        <Badge className={senderInfo.color}>
                          {senderInfo.icon}
                          {senderInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Message Content
                    </label>
                    <div className='mt-1 max-h-32 overflow-y-auto rounded-md bg-gray-50 p-3'>
                      <p className='whitespace-pre-wrap break-words text-sm'>
                        {message.message.length > 200
                          ? `${message.message.substring(0, 200)}...`
                          : message.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Clock className='h-5 w-5' />
                    Timing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Created
                      </label>
                      <p className='text-sm'>{dateInfo.relative}</p>
                      <p className='text-xs text-gray-500'>
                        {dateInfo.absolute}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Model Information */}
              {!message.isSender && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <Brain className='h-5 w-5' />
                      AI Model Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Model
                      </label>
                      <p className='text-sm'>{getLLMName(message.llmId)}</p>
                    </div>

                    {(message.inputTokens || message.outputTokens) && (
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <label className='text-sm font-medium text-gray-600'>
                            Input Tokens
                          </label>
                          <div className='flex items-center gap-2'>
                            <Zap className='h-4 w-4 text-blue-500' />
                            <span className='font-mono text-sm'>
                              {message.inputTokens?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className='text-sm font-medium text-gray-600'>
                            Output Tokens
                          </label>
                          <div className='flex items-center gap-2'>
                            <Zap className='h-4 w-4 text-green-500' />
                            <span className='font-mono text-sm'>
                              {message.outputTokens?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.cost && (
                      <div>
                        <label className='text-sm font-medium text-gray-600'>
                          Cost
                        </label>
                        <div className='flex items-center gap-2'>
                          <Coins className='h-4 w-4 text-yellow-500' />
                          <span className='font-mono text-lg font-semibold text-green-600'>
                            ${formatCost(message.cost)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Files Information */}
              {message.files && message.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <FileText className='h-5 w-5' />
                      Files ({message.files.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      {message.files.map((file) => (
                        <div
                          key={file.id}
                          className='flex items-center gap-2 rounded bg-gray-50 p-2'
                        >
                          <FileText className='h-4 w-4 text-gray-500' />
                          <span className='text-sm'>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags Information */}
              {message.tags && message.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <Tag className='h-5 w-5' />
                      Tags ({message.tags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {message.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={getTagColor(tag.label)}
                          className='flex items-center gap-1'
                        >
                          <Tag className='h-3 w-3' />
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message Status */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <MessageSquare className='h-5 w-5' />
                    Message Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {message.feedbackType === FeedbackType.LIKE && (
                      <Badge
                        variant='outline'
                        className='border-green-600 text-green-600'
                      >
                        <ThumbsUp className='mr-1 h-3 w-3' />
                        Liked
                      </Badge>
                    )}
                    {message.feedbackType === FeedbackType.DISLIKE && (
                      <Badge
                        variant='outline'
                        className='border-red-600 text-red-600'
                      >
                        <ThumbsDown className='mr-1 h-3 w-3' />
                        Disliked
                      </Badge>
                    )}
                    {message.isEdited && (
                      <Badge
                        variant='outline'
                        className='border-blue-600 text-blue-600'
                      >
                        <Edit className='mr-1 h-3 w-3' />
                        Edited
                      </Badge>
                    )}
                    {message.isRegenerated && (
                      <Badge
                        variant='outline'
                        className='border-purple-600 text-purple-600'
                      >
                        <RotateCcw className='mr-1 h-3 w-3' />
                        Regenerated
                      </Badge>
                    )}
                    {message.streaming && (
                      <Badge
                        variant='outline'
                        className='border-orange-600 text-orange-600'
                      >
                        <Zap className='mr-1 h-3 w-3' />
                        Streaming
                      </Badge>
                    )}
                  </div>

                  {message.originalMessage && (
                    <div className='mt-4'>
                      <label className='text-sm font-medium text-gray-600'>
                        Original Message
                      </label>
                      <div className='mt-1 max-h-32 overflow-y-auto rounded-md bg-gray-50 p-3'>
                        <p className='whitespace-pre-wrap break-words text-sm'>
                          {message.originalMessage.length > 200
                            ? `${message.originalMessage.substring(0, 200)}...`
                            : message.originalMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.feedbackText && (
                    <div className='mt-4'>
                      <label className='text-sm font-medium text-gray-600'>
                        {message.feedbackType === 'like' ? 'Like' : 'Dislike'}{' '}
                        Feedback
                      </label>
                      <div
                        className={`mt-1 rounded-md p-3 ${
                          message.feedbackType === 'like'
                            ? 'bg-green-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            message.feedbackType === 'like'
                              ? 'text-green-800'
                              : 'text-red-800'
                          }`}
                        >
                          {message.feedbackText}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Snippets Information */}
              {message.snippets && message.snippets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <FileText className='h-5 w-5' />
                      Context Snippets ({message.snippets.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {message.snippets.map((snippet) => (
                        <div
                          key={snippet.id}
                          className='rounded-lg border bg-gray-50 p-3'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium'>
                              {snippet.file.name}
                            </span>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                Score: {snippet.similarityScore.toFixed(3)}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                Chunk {snippet.chunkIndex}
                              </Badge>
                            </div>
                          </div>
                          <p className='line-clamp-3 text-xs text-gray-600'>
                            {snippet.text}
                          </p>
                          {snippet.vectorDbSource && (
                            <div className='mt-2'>
                              <Badge variant='outline' className='text-xs'>
                                {snippet.vectorDbSource}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default MessageMetadata
