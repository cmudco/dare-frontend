import { Agent } from '../redux/types/agent'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

export const getAgentsAPI = async (): Promise<{ results: Agent[] }> => {
  return await baseRequest<{ results: Agent[] }>({
    url: 'api/agents/',
    method: METHOD.GET,
  })
}

export const getAgentByIdAPI = async (id: number): Promise<Agent> => {
  return await baseRequest<Agent>({
    url: `api/agents/${id}/`,
    method: METHOD.GET,
  })
}

export const createAgentAPI = async (agentData: {
  name: string
  description: string
  prompt: number
  llm?: number | null
  contentFiles?: number[]
  embeddingFiles?: number[]
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
  enableWebSearch?: boolean
}): Promise<Agent> => {
  return await baseRequest<Agent>({
    url: 'api/agents/',
    method: METHOD.POST,
    data: agentData,
  })
}

export const updateAgentAPI = async (
  id: number,
  agentData: Partial<Agent>
): Promise<Agent> => {
  return await baseRequest<Agent>({
    url: `api/agents/${id}/`,
    method: METHOD.PUT,
    data: agentData,
  })
}

export const simpleUpdateAgentAPI = async (
  id: number,
  agentData: Partial<Agent>
): Promise<Agent> => {
  return await baseRequest<Agent>({
    url: `api/agents/${id}/simple-update/`,
    method: METHOD.PATCH,
    data: agentData,
  })
}

export const cloneAgentAPI = async (id: number): Promise<Agent> => {
  return await baseRequest<Agent>({
    url: `api/agents/${id}/clone/`,
    method: METHOD.POST,
  })
}

export const deleteAgentAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/agents/${id}/`,
    method: METHOD.DELETE,
  })
}

export const searchAgentsAPI = async (query: string): Promise<Agent[]> => {
  return await baseRequest<Agent[]>({
    url: `api/agents/search/`,
    method: METHOD.GET,
    params: {
      q: query,
    },
  })
}
