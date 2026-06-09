import { useEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getChatHistoryAPI, streamChatMessage } from '@/api/research'
import type { ChatMessage, SoulFile } from '../types'

interface Props {
  projectId?: number
  soulFile: SoulFile | null
}

const Bubble = ({
  role,
  content,
  streaming,
}: {
  role: string
  content: string
  streaming?: boolean
}) =>
  role === 'user' ? (
    <div className='flex justify-end'>
      <div className='max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-sm'>
        {content}
      </div>
    </div>
  ) : (
    <div className='max-w-[85%]'>
      <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        Agent
      </p>
      <div className='rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed'>
        {content ? (
          <span className='whitespace-pre-wrap'>{content}</span>
        ) : (
          streaming && <span className='text-muted-foreground'>Thinking…</span>
        )}
        {streaming && content && (
          <span className='ml-0.5 inline-block animate-pulse'>▍</span>
        )}
      </div>
    </div>
  )

const HandsOnChat = ({ projectId, soulFile }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingUser, setPendingUser] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!projectId) return
    let active = true
    getChatHistoryAPI(projectId)
      .then((history) => {
        if (active) setMessages(history)
      })
      .catch(() => {
        if (active) setError('Could not load the conversation.')
      })
    return () => {
      active = false
    }
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingUser, streamingText])

  const send = async () => {
    const text = input.trim()
    if (!text || sending || !projectId) return
    setInput('')
    setError(null)
    setSending(true)
    setPendingUser(text)
    setStreamingText('')
    await streamChatMessage(projectId, text, {
      onDelta: (delta) => setStreamingText((prev) => (prev ?? '') + delta),
      onDone: async () => {
        try {
          setMessages(await getChatHistoryAPI(projectId))
        } catch {
          /* keep what streamed if the refetch fails */
        }
        setPendingUser(null)
        setStreamingText(null)
        setSending(false)
      },
      onError: (message) => {
        setError(message)
        setPendingUser(null)
        setStreamingText(null)
        setSending(false)
      },
    })
  }

  const isEmpty =
    messages.length === 0 && !pendingUser && streamingText === null
  const soulLabel = soulFile
    ? `soul file v${soulFile.version}`
    : 'no soul file yet'

  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Chat</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Hands-on mode — think live with the agent, under your soul file.
          Nothing is saved unless you save it.
        </p>
      </header>

      <div className='space-y-4'>
        {isEmpty && (
          <p className='rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'>
            Start a conversation — ask anything, think out loud, or sanity-check
            an idea before you run Scout.
          </p>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} />
        ))}
        {pendingUser !== null && <Bubble role='user' content={pendingUser} />}
        {streamingText !== null && (
          <Bubble role='assistant' content={streamingText} streaming />
        )}
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className='rounded-2xl border border-border bg-card p-4'>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void send()
            }
          }}
          placeholder='Think out loud with the agent… (⌘/Ctrl + Enter to send)'
          rows={2}
          disabled={sending}
        />
        <div className='mt-3 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>
            Live conversation · under {soulLabel} · save-gated, not staged
          </span>
          <Button
            onClick={() => void send()}
            disabled={input.trim().length === 0 || sending}
            size='sm'
          >
            {sending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HandsOnChat
