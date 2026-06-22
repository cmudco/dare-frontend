import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Message, isSenderMessage } from '@/redux/types/conversation'
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
  Globe,
  ExternalLink,
  Leaf,
  Droplets,
  Smartphone,
  Search,
  Lightbulb,
  Tv,
  Car,
  Thermometer,
} from 'lucide-react'
import {
  formatEnergy,
  formatCarbon,
  formatWater,
  formatPhoneBattery,
  formatSearches,
  formatDuration,
} from '@/utils/energyFormatUtils'
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
  const allModels = useSelector(
    (state: RootState) => state.conversation.allModels
  )

  // Resolve the dispatch model's display name from the message's persisted
  // FKs. Real LLM dispatches set `message.llm` (numeric pk); LiteLLM
  // dispatches leave that null and persist `message.litellmModelName`.
  const getDisplayedModelName = (
    llmId: number | null | undefined,
    litellmModelName: string | null | undefined
  ): string => {
    if (llmId != null) {
      const llm = allModels.find((model) => model.id === llmId)
      return llm ? llm.name : `Model ${llmId}`
    }
    return litellmModelName ?? 'N/A'
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
    if (isSenderMessage(message)) {
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

  const dateInfo = formatDate(message.createdAt)
  const senderInfo = getSenderTypeInfo()

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className='fixed top-0 right-0 bottom-0 mt-0 h-full w-[50vw] rounded-l-lg bg-white p-0 shadow-lg'>
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
                      <label className='text-sm font-medium text-muted-foreground'>
                        Message ID
                      </label>
                      <p className='rounded-sm bg-muted px-2 py-1 font-mono text-sm'>
                        {message.id}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>
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
                    <label className='text-sm font-medium text-muted-foreground'>
                      Message Content
                    </label>
                    <div className='mt-1 max-h-32 overflow-y-auto rounded-md bg-muted p-3'>
                      <p className='text-sm wrap-break-word whitespace-pre-wrap'>
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
                      <label className='text-sm font-medium text-muted-foreground'>
                        Created
                      </label>
                      <p className='text-sm'>{dateInfo.relative}</p>
                      <p className='text-xs text-muted-foreground'>
                        {dateInfo.absolute}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Model Information */}
              {!isSenderMessage(message) && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <Brain className='h-5 w-5' />
                      AI Model Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground'>
                        Model
                      </label>
                      <p className='text-sm'>
                        {getDisplayedModelName(
                          message.llm,
                          message.litellmModelName
                        )}
                      </p>
                    </div>

                    {(message.inputTokens || message.outputTokens) && (
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <label className='text-sm font-medium text-muted-foreground'>
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
                          <label className='text-sm font-medium text-muted-foreground'>
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
                        <label className='text-sm font-medium text-muted-foreground'>
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

              {/* Environmental Impact */}
              {!isSenderMessage(message) &&
                message.energyWh &&
                parseFloat(message.energyWh) > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-lg'>
                        <Leaf className='h-5 w-5 text-emerald-500' />
                        Environmental Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-3 gap-4'>
                        <div className='text-center'>
                          <Zap className='mx-auto mb-1 h-4 w-4 text-amber-500' />
                          <p className='text-sm font-semibold'>
                            {formatEnergy(parseFloat(message.energyWh!))}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Energy
                          </p>
                        </div>
                        {message.carbonG && (
                          <div className='text-center'>
                            <Leaf className='mx-auto mb-1 h-4 w-4 text-emerald-500' />
                            <p className='text-sm font-semibold'>
                              {formatCarbon(parseFloat(message.carbonG))}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Carbon
                            </p>
                          </div>
                        )}
                        {message.waterMl && (
                          <div className='text-center'>
                            <Droplets className='mx-auto mb-1 h-4 w-4 text-blue-500' />
                            <p className='text-sm font-semibold'>
                              {formatWater(parseFloat(message.waterMl))}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Water
                            </p>
                          </div>
                        )}
                      </div>

                      {message.energyStats && (
                        <div className='grid grid-cols-2 gap-2 border-t pt-3'>
                          <div className='flex items-center gap-2 text-xs'>
                            <Smartphone className='h-3.5 w-3.5 text-muted-foreground' />
                            <span>
                              {formatPhoneBattery(
                                message.energyStats.phoneBatteryPct
                              )}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs'>
                            <Search className='h-3.5 w-3.5 text-blue-500' />
                            <span>
                              {formatSearches(
                                message.energyStats.googleSearchesEquiv
                              )}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs'>
                            <Lightbulb className='h-3.5 w-3.5 text-yellow-500' />
                            <span>
                              {formatDuration(
                                message.energyStats.ledBulbSeconds
                              )}{' '}
                              LED
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs'>
                            <Tv className='h-3.5 w-3.5 text-red-500' />
                            <span>
                              {formatDuration(
                                message.energyStats.netflixSeconds
                              )}{' '}
                              Netflix
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs'>
                            <Car className='h-3.5 w-3.5 text-green-500' />
                            <span>
                              {message.energyStats.evMeters >= 1000
                                ? `${(message.energyStats.evMeters / 1000).toFixed(2)} km`
                                : `${message.energyStats.evMeters.toFixed(1)} m`}{' '}
                              EV
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs'>
                            <Thermometer className='h-3.5 w-3.5 text-cyan-500' />
                            <span>
                              {formatDuration(
                                message.energyStats.fridgeSeconds
                              )}{' '}
                              fridge
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs'>
                            <Brain className='h-3.5 w-3.5 text-purple-500' />
                            <span>
                              {formatDuration(
                                message.energyStats.humanThinkingSeconds
                              )}{' '}
                              thinking
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
                          className='flex items-center gap-2 rounded-sm bg-muted p-2'
                        >
                          <FileText className='h-4 w-4 text-muted-foreground' />
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
                      <label className='text-sm font-medium text-muted-foreground'>
                        Original Message
                      </label>
                      <div className='mt-1 max-h-32 overflow-y-auto rounded-md bg-muted p-3'>
                        <p className='text-sm wrap-break-word whitespace-pre-wrap'>
                          {message.originalMessage.length > 200
                            ? `${message.originalMessage.substring(0, 200)}...`
                            : message.originalMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.feedbackText && (
                    <div className='mt-4'>
                      <label className='text-sm font-medium text-muted-foreground'>
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
                          className='rounded-lg border bg-muted/50 p-3'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium'>
                              {snippet.file
                                ? snippet.file.name
                                : `${snippet.library?.name} — ${snippet.sourceRef}`}
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
                          <p className='line-clamp-3 text-xs text-muted-foreground'>
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

              {/* Web Search Sources Information */}
              {message.webSearchSources &&
                message.webSearchSources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-lg'>
                        <Globe className='h-5 w-5' />
                        Web Search Sources ({message.webSearchSources.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        {message.webSearchSources.map((source) => {
                          // Extract domain from URL for display
                          let domain = source.url
                          try {
                            domain = new URL(source.url).hostname.replace(
                              'www.',
                              ''
                            )
                          } catch {
                            // Keep original URL if parsing fails
                          }

                          const providerColors: Record<string, string> = {
                            openai: 'bg-emerald-100 text-emerald-700',
                            claude: 'bg-orange-100 text-orange-700',
                            gemini: 'bg-blue-100 text-blue-700',
                          }

                          return (
                            <div
                              key={source.id}
                              className='rounded-lg border bg-muted/50 p-3'
                            >
                              <div className='mb-2 flex items-start justify-between gap-2'>
                                <div className='min-w-0 flex-1'>
                                  <a
                                    href={source.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='group flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-blue-600'
                                  >
                                    <span className='truncate'>
                                      {source.title || domain}
                                    </span>
                                    <ExternalLink className='h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
                                  </a>
                                  <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                                    {domain}
                                  </p>
                                </div>
                                <div className='flex shrink-0 items-center gap-2'>
                                  {source.pageAge && (
                                    <span className='text-xs text-muted-foreground'>
                                      {source.pageAge}
                                    </span>
                                  )}
                                  <Badge
                                    className={`text-xs ${
                                      providerColors[source.provider] ||
                                      'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {source.provider}
                                  </Badge>
                                </div>
                              </div>
                              {source.citedText && (
                                <div className='mt-2 rounded-sm border-l-2 border-border bg-card p-2'>
                                  <p className='line-clamp-3 text-xs text-muted-foreground italic'>
                                    "{source.citedText}"
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Memory Context Information */}
              {message.memoryContextData &&
                message.memoryContextData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-lg'>
                        <Brain className='h-5 w-5 text-purple-500' />
                        Memory Context ({message.memoryContextData.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        {message.memoryContextData.map((item, index) => (
                          <div
                            key={index}
                            className='rounded-lg border bg-muted/50 p-3'
                          >
                            <div className='flex items-start justify-between gap-2'>
                              <p className='flex-1 text-sm text-foreground'>
                                {item.content}
                              </p>
                              {item.memoryType && (
                                <Badge className='shrink-0 bg-purple-100 text-xs text-purple-700'>
                                  {item.memoryType}
                                </Badge>
                              )}
                            </div>
                            {item.categories && item.categories.length > 0 && (
                              <div className='mt-2 flex flex-wrap gap-1'>
                                {item.categories.map((cat) => (
                                  <Badge
                                    key={cat}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {cat}
                                  </Badge>
                                ))}
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
