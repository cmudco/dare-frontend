import { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Bot, Check, Loader2 } from 'lucide-react'
import { RootState, AppDispatch } from '@/redux/store'
import { applyAgentToConversation } from '@/redux/asyncThunks/conversation'
import { Agent } from '@/redux/types/agent'
import { toast } from '@/utils/toast'

/** Agents list in the PromptSet dialog; picking one gives the chat its whole setup. */
const AgentTabContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const agents = useSelector((state: RootState) => state.agent.agents)
  const loading = useSelector((state: RootState) => state.agent.loading)
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const [applyingId, setApplyingId] = useState<number | null>(null)

  const selectedAgentId = activeConversation?.selectedAgent

  const sortedAgents = useMemo(() => {
    if (!selectedAgentId) return agents
    return [...agents].sort((a, b) => {
      if (a.id === selectedAgentId) return -1
      if (b.id === selectedAgentId) return 1
      return 0
    })
  }, [agents, selectedAgentId])

  const handleSelectAgent = async (agent: Agent) => {
    if (!activeConversation || applyingId !== null) return
    const detaching = selectedAgentId === agent.id
    setApplyingId(agent.id)
    try {
      await dispatch(
        applyAgentToConversation({
          conversationId: activeConversation.conversationId,
          agent: detaching ? null : agent,
        })
      ).unwrap()
    } catch {
      toast.error(
        detaching ? 'Could not remove the agent' : 'Could not apply the agent'
      )
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className='max-h-[50vh] overflow-y-auto'>
      <div className='mb-3 text-xs text-muted-foreground'>
        Select an agent to apply its settings to this conversation
      </div>

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>Loading agents...</span>
        </div>
      ) : sortedAgents.length === 0 ? (
        <div className='py-6 text-center text-sm text-muted-foreground'>
          No agents available. Create agents in the Agents page.
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {sortedAgents.map((agent) => {
            const isAgentSelected = selectedAgentId === agent.id
            return (
              <button
                key={agent.id}
                type='button'
                disabled={applyingId !== null}
                className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-all disabled:cursor-wait ${
                  isAgentSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-accent'
                }`}
                onClick={() => handleSelectAgent(agent)}
                aria-pressed={isAgentSelected}
              >
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                  <Bot className='h-4 w-4 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-0.5 text-sm font-medium text-foreground'>
                    {agent.name}
                  </div>
                  <div className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                    {agent.description || 'No description'}
                  </div>
                  {agent.modelName && (
                    <div className='mt-1 inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                      {agent.modelName}
                    </div>
                  )}
                </div>
                <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                  {applyingId === agent.id ? (
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  ) : (
                    isAgentSelected && (
                      <Check className='h-4 w-4 text-primary' />
                    )
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedAgentId && (
        <div className='mt-3 border-t border-border pt-3'>
          <div className='text-[11px] text-muted-foreground'>
            The agent sets this chat's prompt, model, settings, sources and
            tools. Click it again to remove it.
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentTabContent
