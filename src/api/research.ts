import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { config } from '@/config/environment'
import type {
  AgentRun,
  ChatMessage,
  CreateResearchProjectPayload,
  ResearchProject,
  ResearchProjectsResponse,
  ReviewItem,
} from '@/redux/types/research'

export const getResearchProjectsAPI =
  async (): Promise<ResearchProjectsResponse> => {
    return await baseRequest<ResearchProjectsResponse>({
      url: 'api/research/projects/',
      method: METHOD.GET,
    })
  }

export const getResearchProjectAPI = async (
  id: number
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${id}/`,
    method: METHOD.GET,
  })
}

export const createResearchProjectAPI = async (
  payload: CreateResearchProjectPayload
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: 'api/research/projects/',
    method: METHOD.POST,
    data: payload,
  })
}

export interface ScoutResult {
  runId: number
  status: string
}

/** Kick off a delegated Scout run (returns immediately; poll the run for status). */
export const runScoutAPI = async (
  projectId: number,
  task: string
): Promise<ScoutResult> => {
  return await baseRequest<ScoutResult>({
    url: `api/research/projects/${projectId}/scout/`,
    method: METHOD.POST,
    data: { task },
  })
}

/** Kick off a Critic run that pressure-tests a staged source (poll the run). */
export const askCriticAPI = async (itemId: number): Promise<ScoutResult> => {
  return await baseRequest<ScoutResult>({
    url: `api/research/staging-items/${itemId}/critic/`,
    method: METHOD.POST,
  })
}

export interface AgentMemory {
  soul: string
  memory: string
  user: string
}

/** Read the Hermes profile's operational memory files (read-only). */
export const getAgentMemoryAPI = async (): Promise<AgentMemory> => {
  return await baseRequest<AgentMemory>({
    url: 'api/research/agent-memory/',
    method: METHOD.GET,
  })
}

/** Poll a single agent run's live status (for Scout/Critic progress). */
export const getAgentRunAPI = async (runId: number): Promise<AgentRun> => {
  return await baseRequest<AgentRun>({
    url: `api/research/agent-runs/${runId}/`,
    method: METHOD.GET,
  })
}

/** Approve / reject / defer a staged review item. */
export const reviewStagingItemAPI = async (
  itemId: number,
  decision: 'approve' | 'reject' | 'later',
  reason?: string
): Promise<ReviewItem> => {
  return await baseRequest<ReviewItem>({
    url: `api/research/staging-items/${itemId}/review/`,
    method: METHOD.POST,
    data: { decision, reason },
  })
}

export const getChatHistoryAPI = async (
  projectId: number
): Promise<ChatMessage[]> => {
  return await baseRequest<ChatMessage[]>({
    url: `api/research/projects/${projectId}/chat/`,
    method: METHOD.GET,
  })
}

export interface ChatStreamHandlers {
  onDelta: (delta: string) => void
  onDone: (payload: { messageId: number; runId: number }) => void
  onError: (message: string) => void
}

/**
 * Send a chat message and consume the SSE reply stream from the backend
 * (which proxies Hermes `message.delta` events). Uses fetch + a ReadableStream
 * reader so the JWT auth header can be sent (EventSource can't).
 */
export const streamChatMessage = async (
  projectId: number,
  message: string,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal
): Promise<void> => {
  const token = localStorage.getItem('token')
  let response: Response
  try {
    response = await fetch(
      `${config.apiUrl}/api/research/projects/${projectId}/chat/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal,
      }
    )
  } catch {
    handlers.onError('Could not reach the agent.')
    return
  }

  if (!response.ok || !response.body) {
    handlers.onError('The agent is unavailable right now.')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.trim()
      if (!line.startsWith('data:')) continue
      const payload = line.slice('data:'.length).trim()
      if (!payload) continue
      try {
        const event = JSON.parse(payload)
        if (event.type === 'delta') handlers.onDelta(event.delta as string)
        else if (event.type === 'done') handlers.onDone(event)
        else if (event.type === 'error') handlers.onError(event.error as string)
      } catch {
        // ignore non-JSON keep-alives
      }
    }
  }
}
