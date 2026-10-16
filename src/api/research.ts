import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { config } from '@/config/environment'
import type {
  AgentRunDetail,
  CreateResearchProjectPayload,
  EvidenceGraph,
  LearningOverview,
  MemoryLayer,
  OkfBundle,
  PromptBrief,
  ResearchProject,
  ResearchProjectsResponse,
  ResearchThread,
  ReviewItem,
  ReviewReasonTag,
  ScoutResult,
  SoulFile,
  ThesisSourceLink,
  ThreadDetail,
  ThreadProposal,
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

/** An approved skill the agent loads. */
export interface AgentSkill {
  name: string
  description: string
  scope: 'project' | 'researcher'
}

/** The files this project's agent loads on every run, as DARE renders them. */
export interface AgentMemory {
  profile: string
  soul: string
  memory: string
  user: string
  skills: AgentSkill[]
}

/** The files this project's agent loads on every run. */
export const getAgentMemoryAPI = async (
  projectId: number
): Promise<AgentMemory> => {
  return await baseRequest<AgentMemory>({
    url: `api/research/projects/${projectId}/agent-memory/`,
    method: METHOD.GET,
  })
}

/**
 * Decide on something the agent wants to remember. Accepting applies it to
 * `layer` (defaults to the layer the agent suggested) and DARE renders it into
 * every profile that layer reaches; rejecting saves nothing.
 */
export const reviewMemoryProposalAPI = async (
  proposalId: number,
  decision: 'accept' | 'reject',
  layer?: MemoryLayer
): Promise<ThreadProposal> => {
  return await baseRequest<ThreadProposal>({
    url: `api/research/memory-proposals/${proposalId}/review/`,
    method: METHOD.POST,
    data: { decision, layer },
  })
}

/** The project's current SOUL.md (soul file version in force). */
export const getSoulFileAPI = async (
  projectId: number
): Promise<SoulFile | null> => {
  return await baseRequest<SoulFile | null>({
    url: `api/research/projects/${projectId}/soul/`,
    method: METHOD.GET,
  })
}

/** Save SOUL.md as a new soul file version. */
export const saveSoulFileAPI = async (
  projectId: number,
  content: string
): Promise<SoulFile> => {
  return await baseRequest<SoulFile>({
    url: `api/research/projects/${projectId}/soul/`,
    method: METHOD.PUT,
    data: { content },
  })
}

/** The project's MEMORY.md entries (DARE-owned project memory). */
export const getProjectMemoryAPI = async (
  projectId: number
): Promise<{ entries: string[] }> => {
  return await baseRequest<{ entries: string[] }>({
    url: `api/research/projects/${projectId}/memory/`,
    method: METHOD.GET,
  })
}

/** Make the project's memory exactly these entries; renders MEMORY.md. */
export const saveProjectMemoryAPI = async (
  projectId: number,
  entries: string[]
): Promise<{ entries: string[] }> => {
  return await baseRequest<{ entries: string[] }>({
    url: `api/research/projects/${projectId}/memory/`,
    method: METHOD.PUT,
    data: { entries },
  })
}

/** Every role's brief, exactly as runs are given it. */
export const getPromptBriefsAPI = async (): Promise<{
  briefs: PromptBrief[]
}> => {
  return await baseRequest<{ briefs: PromptBrief[] }>({
    url: 'api/research/prompts/',
    method: METHOD.GET,
  })
}

/** What the agent has learned: layers, procedures, pending, timeline, chart. */
export const getLearningAPI = async (
  projectId: number
): Promise<LearningOverview> => {
  return await baseRequest<LearningOverview>({
    url: `api/research/projects/${projectId}/learning/`,
    method: METHOD.GET,
  })
}

/** Poll a single agent run's live status (for Scout/Critic progress). */
export const getAgentRunAPI = async (
  runId: number
): Promise<AgentRunDetail> => {
  return await baseRequest<AgentRunDetail>({
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
export const cancelAgentRunAPI = async (
  runId: number
): Promise<AgentRunDetail> => {
  return await baseRequest<AgentRunDetail>({
    url: `api/research/agent-runs/${runId}/cancel/`,
    method: METHOD.POST,
  })
}

/**
 * Approve / reject / defer a staged review item. The note and reason tags are
 * kept on the item and pushed into the chat thread that staged it, where the
 * agent can learn from them.
 */
export const reviewStagingItemAPI = async (
  itemId: number,
  decision: 'approve' | 'reject' | 'later',
  reason?: string,
  tags?: ReviewReasonTag[]
): Promise<ReviewItem> => {
  return await baseRequest<ReviewItem>({
    url: `api/research/staging-items/${itemId}/review/`,
    method: METHOD.POST,
    data: { decision, reason, tags },
  })
}

/** Stop a thread's Scout and start a replacement that follows `instruction`. */
export const redirectScoutAPI = async (
  runId: number,
  instruction: string
): Promise<{
  runId: number
  replacedRunId: number | null
  steered: boolean
}> => {
  return await baseRequest<{
    runId: number
    replacedRunId: number | null
    steered: boolean
  }>({
    url: `api/research/agent-runs/${runId}/redirect/`,
    method: METHOD.POST,
    data: { instruction },
  })
}

export const getThreadsAPI = async (
  projectId: number
): Promise<ResearchThread[]> => {
  return await baseRequest<ResearchThread[]>({
    url: `api/research/projects/${projectId}/threads/`,
    method: METHOD.GET,
  })
}

export const createThreadAPI = async (
  projectId: number,
  title = ''
): Promise<ResearchThread> => {
  return await baseRequest<ResearchThread>({
    url: `api/research/projects/${projectId}/threads/`,
    method: METHOD.POST,
    data: { title },
  })
}

export const getThreadAPI = async (threadId: number): Promise<ThreadDetail> => {
  return await baseRequest<ThreadDetail>({
    url: `api/research/threads/${threadId}/`,
    method: METHOD.GET,
  })
}

export interface ChatStreamHandlers {
  onDelta: (delta: string) => void
  onTool: (tool: string, phase: 'started' | 'completed') => void
  onDone: (payload: { messageId: number; runId: number }) => void
  /** The reply is still coming; it lands in the thread when Hermes finishes. */
  onPending: () => void
  onError: (message: string) => void
}

/**
 * Send one scholar message to a thread and consume the SSE reply. Uses fetch +
 * a ReadableStream reader so the JWT auth header can be sent (EventSource
 * can't).
 */
export const streamThreadMessage = async (
  threadId: number,
  message: string,
  mode: 'chat' | 'scout',
  handlers: ChatStreamHandlers,
  signal?: AbortSignal
): Promise<void> => {
  const token = localStorage.getItem('token')
  let response: Response
  try {
    response = await fetch(
      `${config.apiUrl}/api/research/threads/${threadId}/messages/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, mode }),
        signal,
      }
    )
  } catch {
    handlers.onError('Could not reach the agent.')
    return
  }

  if (response.status === 409) {
    handlers.onError('The agent is still replying in this thread.')
    return
  }
  if (response.status === 402) {
    const body = await response.json().catch(() => ({}))
    handlers.onError(body.error || 'This project has used its research budget.')
    return
  }
  if (!response.ok || !response.body) {
    handlers.onError('The agent is unavailable right now.')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let ended = false

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
        else if (event.type === 'tool') handlers.onTool(event.tool, event.phase)
        else if (event.type === 'done') {
          ended = true
          handlers.onDone(event)
        } else if (event.type === 'pending') {
          ended = true
          handlers.onPending()
        } else if (event.type === 'error') {
          ended = true
          handlers.onError(event.error as string)
        }
      } catch {
        // ignore non-JSON keep-alives
      }
    }
  }
  // A stream cut off mid-reply: the thread shows the reply once it lands.
  if (!ended) handlers.onPending()
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
