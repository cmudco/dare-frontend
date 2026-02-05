/**
 * AgentSelector Component
 *
 * Allows users to select an agent template for a conversation.
 * Applies agent settings (model, temperature, etc.) on selection.
 * Single-select behavior - clicking a selected agent deselects it.
 *
 * Uses Redux directly - no props drilling required.
 */

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Bot, ChevronDown, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RootState, AppDispatch } from '@/redux/store'
import { getAgents } from '@/redux/asyncThunks/agent'
import { updateConversation } from '@/redux/asyncThunks/conversation'
import {
  updateSelectedAgent,
  applyAgentSettings,
  loadSelectedFilesFromIds,
} from '@/redux/conversationSlice'
import { Agent } from '@/redux/types/agent'

export const AgentSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(false)

  // Redux state
  const agents = useSelector((state: RootState) => state.agent.agents)
  const loading = useSelector((state: RootState) => state.agent.loading)
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const files = useSelector((state: RootState) => state.files.files)

  const selectedAgentId = activeConversation?.selectedAgent
  const selectedAgentName = activeConversation?.selectedAgentName
  const disabled = !activeConversation

  // Fetch agents on mount if not already loaded
  useEffect(() => {
    if (agents.length === 0 && !loading) {
      dispatch(getAgents())
    }
  }, [dispatch, agents.length, loading])

  /**
   * Handle agent template selection.
   * Applies agent settings to the conversation and persists via API.
   * Also syncs file selections to the UI state.
   */
  const handleSelectAgent = (agent: Agent) => {
    if (!activeConversation) return

    // If clicking the already selected agent, deselect it
    if (selectedAgentId === agent.id) {
      handleClearSelection()
      setOpen(false)
      return
    }

    // Apply all agent settings to Redux state in a single dispatch
    dispatch(
      applyAgentSettings({
        agentId: agent.id,
        agentName: agent.name,
        llm: agent.llm ?? undefined,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        maxContextSnippets: agent.maxContextSnippets,
        documentSimilarityThreshold: agent.documentSimilarityThreshold,
        enableWebSearch: agent.enableWebSearch,
      })
    )

    // Sync file selections to UI state
    dispatch(
      loadSelectedFilesFromIds({
        files,
        selectedFileIds: agent.contentFiles || [],
        selectedEmbeddingIds: agent.embeddingFiles || [],
        selectedMediaIds: activeConversation.selectedMediaIds || [],
      })
    )

    // Persist all settings to backend
    dispatch(
      updateConversation({
        conversationId: activeConversation.conversationId,
        updates: {
          selectedAgent: agent.id,
          selectedModel: agent.llm,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          maxContextSnippets: agent.maxContextSnippets,
          documentSimilarityThreshold: agent.documentSimilarityThreshold,
          webSearchEnabled: agent.enableWebSearch,
          promptId: agent.prompt,
          selectedFileIds: agent.contentFiles || [],
          selectedEmbeddingIds: agent.embeddingFiles || [],
        },
      })
    )

    setOpen(false)
  }

  /**
   * Clear agent selection and file selections.
   */
  const handleClearSelection = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!activeConversation) return

    // Update Redux state
    dispatch(
      updateSelectedAgent({
        agentId: null,
        agentName: null,
      })
    )

    // Clear file selections in UI state
    dispatch(
      loadSelectedFilesFromIds({
        files,
        selectedFileIds: [],
        selectedEmbeddingIds: [],
        selectedMediaIds: activeConversation.selectedMediaIds || [],
      })
    )

    // Persist cleared state to backend
    dispatch(
      updateConversation({
        conversationId: activeConversation.conversationId,
        updates: {
          selectedAgent: null,
          selectedFileIds: [],
          selectedEmbeddingIds: [],
        },
      })
    )
  }

  /**
   * Get display label for the agent selector button
   */
  const getDisplayLabel = (): string => {
    if (selectedAgentId && selectedAgentName) {
      return selectedAgentName
    }
    return 'Agent'
  }

  const displayLabel = getDisplayLabel()
  const isSelected = selectedAgentId != null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          disabled={disabled}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-all ${
            isSelected
              ? 'bg-primary/15 text-primary'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          title='Agent Template'
        >
          <Bot className='h-4 w-4' />
          <span className='max-w-[100px] truncate'>{displayLabel}</span>
          {isSelected ? (
            <X
              className='h-3 w-3 opacity-60 hover:opacity-100'
              onClick={handleClearSelection}
            />
          ) : (
            <ChevronDown className='h-3 w-3 opacity-60' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-[#1e1e2e]'
        align='start'
      >
        <div className='mb-1.5 flex items-center gap-2'>
          <Bot className='h-[18px] w-[18px] text-primary' />
          <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            Agent Templates
          </span>
        </div>
        <div className='mb-3 text-xs text-gray-500'>
          Select an agent to apply its settings to this conversation
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-2 py-6 text-sm text-gray-500'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Loading agents...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className='py-6 text-center text-sm text-gray-500'>
            No agents available. Create agents in the Agents page.
          </div>
        ) : (
          <div className='flex max-h-[300px] flex-col gap-1 overflow-y-auto'>
            {agents.map((agent) => {
              const isAgentSelected = selectedAgentId === agent.id
              return (
                <button
                  key={agent.id}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    isAgentSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-transparent hover:border-gray-200 hover:bg-gray-100 dark:hover:border-white/10 dark:hover:bg-white/5'
                  }`}
                  onClick={() => handleSelectAgent(agent)}
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5'>
                    <Bot className='h-4 w-4 text-primary' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-0.5 text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                      {agent.name}
                    </div>
                    <div className='line-clamp-2 text-[11px] leading-relaxed text-gray-500'>
                      {agent.description || 'No description'}
                    </div>
                    {agent.llmName && (
                      <div className='mt-1 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-400'>
                        {agent.llmName}
                      </div>
                    )}
                  </div>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                    {isAgentSelected && (
                      <Check className='h-4 w-4 text-primary' />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {isSelected && (
          <div className='mt-3 border-t border-gray-200 pt-3 dark:border-white/10'>
            <div className='text-[11px] text-gray-500'>
              Agent settings will be applied: model, temperature, max tokens,
              context snippets, similarity threshold, and web search.
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default AgentSelector
