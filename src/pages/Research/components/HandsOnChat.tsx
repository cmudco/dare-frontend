import { useState } from 'react'
import { Bookmark, BookmarkCheck, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SOUL_FILE } from '../mockData'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'c1',
    role: 'user',
    content:
      'Before I run Scout — is "high trust" doing the causal work here, or is it downstream of something else?',
  },
  {
    id: 'c2',
    role: 'assistant',
    content:
      'Honest answer: the direction is not settled. Some work treats trust as a cause of cooperation and universal services; other work argues trust is itself produced by equal institutions, so it is partly downstream. I would hold both as live rather than assert causation. If you want, I can have Scout pull the strongest study on each side so you can judge.',
  },
]

let nextId = 100

const HandsOnChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES)
  const [input, setInput] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const send = () => {
    const text = input.trim()
    if (!text) return
    const userMessage: ChatMessage = {
      id: `u${nextId++}`,
      role: 'user',
      content: text,
    }
    const replyId = `a${nextId++}`
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    // Mock a live reply that models the soul file (signals uncertainty,
    // refuses to assert without a source, offers to delegate to Scout).
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          role: 'assistant',
          content:
            'Reasoning under your standards: I will flag what is genuinely uncertain rather than smooth it over, and I will not assert a claim that needs a citation — I would suggest a Scout run to verify it first. Want me to draft the argument, or gather evidence first?',
        },
      ])
    }, 600)
  }

  const toggleSave = (id: string) =>
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

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
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className='flex justify-end'>
              <div className='max-w-[80%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-sm'>
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className='max-w-[85%]'>
              <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Agent
              </p>
              <div className='rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed'>
                {m.content}
              </div>
              <button
                onClick={() => toggleSave(m.id)}
                className='mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                {savedIds.has(m.id) ? (
                  <>
                    <BookmarkCheck className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
                    Saved to Project Knowledge
                  </>
                ) : (
                  <>
                    <Bookmark className='h-3.5 w-3.5' />
                    Save to Project Knowledge
                  </>
                )}
              </button>
            </div>
          )
        )}
      </div>

      <div className='rounded-2xl border border-border bg-card p-4'>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
          placeholder='Think out loud with the agent… (⌘/Ctrl + Enter to send)'
          rows={2}
        />
        <div className='mt-3 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>
            Live conversation · under soul file {SOUL_FILE.version} ·
            save-gated, not staged
          </span>
          <Button onClick={send} disabled={input.trim().length === 0} size='sm'>
            <Send className='h-4 w-4' /> Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HandsOnChat
