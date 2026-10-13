import { formatUsd } from '@/utils/wallets'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import {
  createThreadAPI,
  getThreadsAPI,
  streamThreadMessage,
} from '@/api/research'
import type { ResearchThread, SoulFile } from '@/redux/types/research'
import MessageBubble from './MessageBubble'
import ThreadEvent from './ThreadEvent'
import LiveScoutsBar from './LiveScoutsBar'
import ThreadList from './ThreadList'
import { useThread } from './useThread'

interface Props {
  projectId: number
  soulFile: SoulFile | null
  /** The open thread (owned by the URL), or null to pick one. */
  threadId: number | null
  onSelectThread: (id: number) => void
  onGoToReview: () => void
  /** Scouts started or memory decided — the workspace counts moved. */
  onWorkspaceChanged: () => void
}

const TOOL_ACTIVITY: [string, string][] = [
  ['launch_scouts', 'Launching Scouts…'],
  ['thread_status', 'Checking on the Scouts…'],
  ['search_knowledge', 'Checking your approved knowledge…'],
  ['web_search', 'Searching the web…'],
  ['fetch_page', 'Reading a page…'],
  ['skill_manage', 'Proposing a skill…'],
  ['memory', 'Proposing something to remember…'],
]

const activityFor = (tool: string) =>
  TOOL_ACTIVITY.find(([name]) => tool.endsWith(name))?.[1] ?? 'Working…'

const REFLECTION_WINDOW_MS = 90_000

const STARTERS = [
  'Help me scope a question for this project',
  'Plan Scouts to map the strongest evidence so far',
  'What do my approved sources already establish?',
]

/**
 * Research mode's hub: one persistent conversation per thread, from which the
 * agent launches Scouts and in which review notes and memory proposals land.
 */
const ChatHub = ({
  projectId,
  soulFile,
  threadId,
  onSelectThread,
  onGoToReview,
  onWorkspaceChanged,
}: Props) => {
  const [threads, setThreads] = useState<ResearchThread[]>([])
  const [threadsLoaded, setThreadsLoaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [pendingUser, setPendingUser] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [activity, setActivity] = useState('')
  const [sendError, setSendError] = useState('')
  const [mode, setMode] = useState<'chat' | 'scout'>('chat')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // After each turn, keep checking for a while: Hermes's background reflection
  // runs after the reply and may stage memory proposals a few seconds later.
  const [watchUntil, setWatchUntil] = useState(0)
  const { detail, loading, error, reload } = useThread(
    threadId,
    sending,
    watchUntil
  )

  const loadThreads = useCallback(async () => {
    const list = await getThreadsAPI(projectId)
    setThreads(list)
    setThreadsLoaded(true)
    return list
  }, [projectId])

  useEffect(() => {
    void loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (threadsLoaded && threadId === null && threads.length > 0) {
      onSelectThread(threads[0].id)
    }
  }, [threadsLoaded, threadId, threads, onSelectThread])

  // A reflection proposal can land while nothing else changes; keep the
  // Learning badge in step with what the thread shows.
  const proposalCount = Object.keys(detail?.proposals ?? {}).length
  const workspaceChanged = useRef(onWorkspaceChanged)
  workspaceChanged.current = onWorkspaceChanged
  useEffect(() => {
    if (proposalCount > 0) workspaceChanged.current()
  }, [proposalCount])

  const messageCount = detail?.messages.length ?? 0
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount, pendingUser, streamingText])

  const newThread = async () => {
    setCreating(true)
    try {
      const thread = await createThreadAPI(projectId)
      setThreads((prev) => [thread, ...prev])
      onSelectThread(thread.id)
      return thread.id
    } finally {
      setCreating(false)
    }
  }

  const send = async (text: string) => {
    const message = text.trim()
    if (!message || sending) return
    const target = threadId ?? (await newThread())
    setInput('')
    setSendError('')
    setSending(true)
    setPendingUser(message)
    setStreamingText('')
    setActivity('')
    const settle = async () => {
      await reload()
      setPendingUser(null)
      setStreamingText(null)
      setActivity('')
      setSending(false)
      setWatchUntil(Date.now() + REFLECTION_WINDOW_MS)
      void loadThreads()
      onWorkspaceChanged()
    }
    await streamThreadMessage(target, message, mode, {
      onDelta: (delta) => {
        setActivity('')
        setStreamingText((prev) => (prev ?? '') + delta)
      },
      onTool: (tool, phase) => {
        setActivity(phase === 'started' ? activityFor(tool) : '')
        // Show the Scout card the moment they launch, not after the reply.
        if (phase === 'completed' && tool.endsWith('launch_scouts')) {
          void reload()
          onWorkspaceChanged()
        }
      },
      onDone: () => void settle(),
      onError: (msg) => {
        setSendError(msg)
        void settle()
      },
    })
  }

  const followupLive = !!detail?.activeTurn && !sending
  const composerLocked = sending || followupLive
  // A turn in flight always shows, even while a just-created thread loads.
  const turnInFlight = pendingUser !== null || streamingText !== null
  const isEmpty =
    !turnInFlight &&
    (!threadId || (detail !== null && detail.messages.length === 0))

  return (
    <div className='flex h-[calc(100vh-11rem)] flex-col gap-4 lg:flex-row'>
      <ThreadList
        threads={threads}
        activeId={threadId}
        onSelect={onSelectThread}
        onNew={() => void newThread()}
        creating={creating}
      />

      <section className='flex min-h-0 min-w-0 flex-1 flex-col'>
        <header className='shrink-0'>
          <h2 className='truncate text-xl font-semibold tracking-tight'>
            {detail?.thread.title || 'Research chat'}
          </h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Ask anything. The agent sends Scouts to dig, and learns from your
            review notes.
            {!!detail?.cost && (
              <span className='ml-2 text-xs tabular-nums'>
                · {formatUsd(String(detail.cost))} spent
              </span>
            )}
          </p>
        </header>

        <div className='mt-4 flex-1 overflow-y-auto pr-1'>
          {loading && !detail && !turnInFlight ? (
            <div className='flex h-full items-center justify-center'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : error ? (
            <p className='text-sm text-destructive'>{error}</p>
          ) : isEmpty ? (
            <div className='flex h-full flex-col items-center justify-center gap-3'>
              <p className='max-w-sm text-center text-sm text-muted-foreground'>
                Bring a question. The agent will clarify it, propose a plan of
                Scouts for you to edit, and run them while you keep talking.
              </p>
              <div className='flex flex-wrap justify-center gap-2'>
                {STARTERS.map((starter) => (
                  <Button
                    key={starter}
                    size='sm'
                    variant='outline'
                    onClick={() => setInput(starter)}
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {detail?.messages.map((row) =>
                row.role === 'event' ? (
                  <ThreadEvent
                    key={row.id}
                    event={row}
                    detail={detail}
                    onChanged={() => {
                      void reload()
                      onWorkspaceChanged()
                    }}
                    onGoToReview={onGoToReview}
                  />
                ) : (
                  <MessageBubble
                    key={row.id}
                    role={row.role}
                    content={row.content}
                  />
                )
              )}
              {pendingUser !== null && (
                <MessageBubble role='user' content={pendingUser} />
              )}
              {streamingText !== null && (
                <MessageBubble
                  role='assistant'
                  content={streamingText}
                  activity={activity}
                  streaming
                />
              )}
              {followupLive && (
                <MessageBubble
                  role='assistant'
                  content=''
                  activity='Catching up on new findings and your notes…'
                  streaming
                />
              )}
              {sendError ? (
                <p className='text-sm text-destructive'>{sendError}</p>
              ) : (
                detail?.lastTurnFailed &&
                !sending && (
                  <p className='text-sm text-destructive'>
                    {detail.lastTurnFailed.followup
                      ? 'The agent could not respond to the latest events.'
                      : 'The agent’s last reply did not complete.'}{' '}
                    <Link
                      className='underline'
                      to={`/research/${projectId}/runs/${detail.lastTurnFailed.runId}`}
                    >
                      See the run
                    </Link>
                  </p>
                )
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className='mt-4 shrink-0'>
          {detail && (
            <LiveScoutsBar
              scouts={detail.scouts}
              onChanged={() => {
                void reload()
                onWorkspaceChanged()
              }}
              onGoToReview={onGoToReview}
            />
          )}
        </div>
        <div className='shrink-0 rounded-2xl border border-border bg-card p-4'>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(input)
              }
            }}
            placeholder={
              mode === 'scout'
                ? 'What should a Scout look for? It launches straight away… (Enter to send)'
                : 'Ask, plan, or steer the Scouts… (Enter to send · Shift+Enter for a new line)'
            }
            aria-label='Message the research chat'
            rows={2}
            disabled={composerLocked}
          />
          <div className='mt-3 flex items-center justify-between gap-3'>
            <div
              role='radiogroup'
              aria-label='Message mode'
              className='flex shrink-0 rounded-lg bg-muted p-0.5'
            >
              {(
                [
                  [
                    'chat',
                    'Chat',
                    'Talk it through; the agent proposes a plan first',
                  ],
                  [
                    'scout',
                    'Scout now',
                    'Launch one Scout from this message right away',
                  ],
                ] as const
              ).map(([key, label, hint]) => (
                <button
                  key={key}
                  type='button'
                  role='radio'
                  aria-checked={mode === key}
                  title={hint}
                  onClick={() => setMode(key)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs',
                    mode === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className='truncate text-xs text-muted-foreground'>
              {followupLive
                ? 'The agent is responding to new events…'
                : `Under ${soulFile ? `soul file v${soulFile.version}` : 'no soul file yet'} · findings go to your inbox · memory needs your approval`}
            </span>
            <Button
              onClick={() => void send(input)}
              disabled={input.trim().length === 0 || composerLocked}
              size='sm'
            >
              {sending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              {mode === 'scout' ? 'Launch' : 'Send'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ChatHub
