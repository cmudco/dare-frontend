import { createAsyncThunk } from '@reduxjs/toolkit'
import { Agent } from '../types/agent'
import {
  cloneAgentAPI,
  createAgentAPI,
  deleteAgentAPI,
  getAgentByIdAPI,
  getAgentsAPI,
  simpleUpdateAgentAPI,
  updateAgentAPI,
} from '@/api/agents'
import { RootState } from '../store'

export const getAgents = createAsyncThunk(
  'agents/getAgents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAgentsAPI()
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getAgentById = createAsyncThunk(
  'agents/getAgentById',
  async (id: number, { rejectWithValue }) => {
    try {
      return (await getAgentByIdAPI(id)) as Agent
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createOrUpdateAgent = createAsyncThunk(
  'agents/createOrUpdateAgent',
  async (
    {
      id,
      agentData,
      bumpVersion,
    }: {
      id?: number
      agentData: {
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
      }
      bumpVersion?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      if (id) {
        if (bumpVersion) {
          return await updateAgentAPI(id, agentData)
        } else {
          return await simpleUpdateAgentAPI(id, agentData)
        }
      } else {
        return await createAgentAPI(agentData)
      }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const cloneAgent = createAsyncThunk(
  'agents/cloneAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cloneAgentAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const agentState = state.agent

      const deletedAgent = agentState.agents.find((a) => a.id === id)

      if (deletedAgent) {
        const childAgents = agentState.agents.filter((a) => a.parent === id)

        await deleteAgentAPI(id)

        const updatePromises = childAgents.map((child) => {
          return updateAgentAPI(child.id, {
            ...child,
            parent: deletedAgent.parent,
          })
        })

        await Promise.all(updatePromises)
      } else {
        await deleteAgentAPI(id)
      }

      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
