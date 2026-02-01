/**
 * AgentTabContent Component
 *
 * Displays the agent templates list inside the PromptSet modal.
 * Handles agent selection and applies settings to the conversation.
 * Uses Redux directly for state management.
 */

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Bot, Check, Loader2 } from 'lucide-react'
import { RootState, AppDispatch } from '@/redux/store'
import { getAgents } from '@/redux/asyncThunks/agent'
import { updateConversation } from '@/redux/asyncThunks/conversation'
import {
  updateSelectedAgent,
  applyAgentSettings,
  loadSelectedFilesFromIds,
} from '@/redux/conversationSlice'
import { Agent } from '@/redux/types/agent'

const AgentTabContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const agents = useSelector((state: RootState) => state.agent.agents)
  const loading = useSelector((state: RootState) => state.agent.loading)
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const files = useSelector((state: RootState) => state.files.files)

  const selectedAgentId = activeConversation?.selectedAgent

  // Fetch agents on mount if not already loaded
  useEffect(() => {
    if (agents.length === 0 && !loading) {
      dispatch(getAgents())
    }
  }, [dispatch, agents.length, loading])

  /**
   * Handle agent template selection.
   * Applies agent settings to the conversation and persists via API.
   */
  const handleSelectAgent = (agent: Agent) => {
    if (!activeConversation) return

    // If clicking the already selected agent, deselect it
    if (selectedAgentId === agent.id) {
      handleClearSelection()
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
  }

  /**
   * Clear agent selection.
   */
  const handleClearSelection = () => {
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
      ) : agents.length === 0 ? (
        <div className='py-6 text-center text-sm text-muted-foreground'>
          No agents available. Create agents in the Agents page.
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {agents.map((agent) => {
            const isAgentSelected = selectedAgentId === agent.id
            return (
              <button
                key={agent.id}
                className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-all ${
                  isAgentSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-gray-300 hover:bg-muted dark:hover:border-white/20 dark:hover:bg-white/5'
                }`}
                onClick={() => handleSelectAgent(agent)}
              >
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5'>
                  <Bot className='h-4 w-4 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-0.5 text-sm font-medium text-foreground'>
                    {agent.name}
                  </div>
                  <div className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
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

      {selectedAgentId && (
        <div className='mt-3 border-t border-border pt-3'>
          <div className='text-[11px] text-muted-foreground'>
            Agent settings will be applied: model, temperature, max tokens,
            context snippets, similarity threshold, and web search.
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentTabContent
