import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { config } from '@/config/environment'
import type {
  AgentRun,
  ChatMessage,
  CreateResearchProjectPayload,
  EvidenceGraph,
  OkfBundle,
  ResearchProject,
  ResearchProjectsResponse,
  ReviewItem,
  ScoutResult,
  ThesisSourceLink,
  UpdateResearchProjectPayload,
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

export const updateResearchProjectAPI = async (
  id: number,
  payload: UpdateResearchProjectPayload
): Promise<ResearchProject> => {
  return await baseRequest<ResearchProject>({
    url: `api/research/projects/${id}/`,
    method: METHOD.PATCH,
    data: payload,
  })
}

/** Kick off a delegated Scout run (returns immediately; poll the run for status). */
export const runScoutAPI = async (
  projectId: number,
  task: string,
  depth: 'quick' | 'deep' = 'deep',
  tools?: string[]
): Promise<ScoutResult> => {
  return await baseRequest<ScoutResult>({
    url: `api/research/projects/${projectId}/scout/`,
    method: METHOD.POST,
    data: { task, depth, tools },
  })
}

/** Kick off a delegated run that generates a renderable artifact (poll the run). */
export const generateArtifactAPI = async (
  projectId: number,
  prompt: string,
  artifactType?: string
): Promise<ScoutResult> => {
  return await baseRequest<ScoutResult>({
    url: `api/research/projects/${projectId}/artifact/`,
    method: METHOD.POST,
    data: { prompt, artifactType: artifactType || '' },
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
  /** Which Hermes profile these files came from ('default' when unisolated). */
  profile: string
  /** True once the project has its own profile, so these files are private to it. */
  isolated: boolean
  /** Newest first. How these files got to their current state, one entry per change. */
  history: AgentMemoryChange[]
}

/** What changed in one file between two snapshots. */
export interface AgentMemoryFileChange {
  count: number
  added: string[]
  removed: string[]
}

/** One moment the agent's memory changed. */
export interface AgentMemoryChange {
  id: number
  takenAt: string
  memory: AgentMemoryFileChange
  user: AgentMemoryFileChange
  /** The earliest snapshot on record — everything in it counts as newly learned. */
  isFirst: boolean
}

/** Read this project's Hermes profile memory files (read-only). */
export const getAgentMemoryAPI = async (
  projectId: number
): Promise<AgentMemory> => {
  return await baseRequest<AgentMemory>({
    url: `api/research/projects/${projectId}/agent-memory/`,
    method: METHOD.GET,
  })
}

/**
 * Decide on something the agent wants to remember.
 *
 * Accept promotes it into project memory the scholar owns; reject also removes
 * it from the agent's own memory, so it stops acting on a fact they rejected.
 */
export const reviewMemoryProposalAPI = async (
  proposalId: number,
  decision: 'accept' | 'reject'
): Promise<{ id: number; status: string }> => {
  return await baseRequest<{ id: number; status: string }>({
    url: `api/research/memory-proposals/${proposalId}/review/`,
    method: METHOD.POST,
    data: { decision },
  })
}

/** Poll a single agent run's live status (for Scout/Critic progress). */
export const getAgentRunAPI = async (runId: number): Promise<AgentRun> => {
  return await baseRequest<AgentRun>({
    url: `api/research/agent-runs/${runId}/`,
    method: METHOD.GET,
  })
}

/**
 * Request cancellation of an in-flight run. Idempotent and owner-scoped; the
 * backend records intent and asks Hermes to stop, but the terminal outcome
 * (cancelled / completed / outcome_unknown) is resolved by later polling — do
 * not assume the run is cancelled just because this resolved.
 */
export const cancelAgentRunAPI = async (runId: number): Promise<AgentRun> => {
  return await baseRequest<AgentRun>({
    url: `api/research/agent-runs/${runId}/cancel/`,
    method: METHOD.POST,
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

/** The project's evidence graph — nodes/edges for the Graph view. */
export const getResearchGraphAPI = async (
  projectId: number
): Promise<EvidenceGraph> => {
  return await baseRequest<EvidenceGraph>({
    url: `api/research/projects/${projectId}/graph/`,
    method: METHOD.GET,
  })
}

/** List the source links for a thesis (project-memory item). */
export const getThesisSourceLinksAPI = async (
  memoryId: number
): Promise<ThesisSourceLink[]> => {
  return await baseRequest<ThesisSourceLink[]>({
    url: `api/research/theses/${memoryId}/sources/`,
    method: METHOD.GET,
  })
}

/** Link a source to a thesis with a stance (defaults to the source's evidence label). */
export const addThesisSourceLinkAPI = async (
  memoryId: number,
  sourceId: number,
  stance?: string
): Promise<ThesisSourceLink> => {
  return await baseRequest<ThesisSourceLink>({
    url: `api/research/theses/${memoryId}/sources/`,
    method: METHOD.POST,
    data: { sourceId, stance },
  })
}

/** Remove a source link from a thesis. */
export const removeThesisSourceLinkAPI = async (
  memoryId: number,
  sourceId: number
): Promise<void> => {
  await baseRequest<void>({
    url: `api/research/theses/${memoryId}/sources/${sourceId}/`,
    method: METHOD.DELETE,
  })
}

/** The project's durable knowledge as an OKF bundle (JSON) for the Maps viewer. */
export const getResearchOkfBundleAPI = async (
  projectId: number
): Promise<OkfBundle> => {
  return await baseRequest<OkfBundle>({
    url: `api/research/projects/${projectId}/okf-bundle/`,
    method: METHOD.GET,
  })
}

/**
 * Download the OKF bundle as a zip. Uses fetch (not an <a href>) so the JWT
 * auth header can be sent, then triggers a client-side blob download.
 */
export const downloadOkfBundleAPI = async (
  projectId: number
): Promise<void> => {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `${config.apiUrl}/api/research/projects/${projectId}/okf-export/`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  )
  if (!response.ok) throw new Error('Export failed')
  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="?([^"]+)"?/)
  const filename = match ? match[1] : `project-${projectId}-okf.zip`
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
