import ChatMarkdown from '../ChatMarkdown'

interface Props {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  /** Shown under the agent label while a turn streams, e.g. the tool in use. */
  activity?: string
}

const MessageBubble = ({ role, content, streaming, activity }: Props) =>
  role === 'user' ? (
    <div className='flex justify-end'>
      <div className='max-w-[80%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-sm whitespace-pre-wrap'>
        {content}
      </div>
    </div>
  ) : (
    <div className='max-w-[88%]'>
      <p className='mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
        Research chat
      </p>
      <div className='rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed'>
        {content ? (
          streaming ? (
            <span className='whitespace-pre-wrap'>
              {content}
              <span className='ml-0.5 inline-block animate-pulse'>▍</span>
            </span>
          ) : (
            <ChatMarkdown content={content} />
          )
        ) : (
          streaming && (
            <span className='text-muted-foreground'>
              {activity || 'Thinking…'}
            </span>
          )
        )}
      </div>
      {streaming && content && activity && (
        <p className='mt-1 text-xs text-muted-foreground'>{activity}</p>
      )}
    </div>
  )

export default MessageBubble
