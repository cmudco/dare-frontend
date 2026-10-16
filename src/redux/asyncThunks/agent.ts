import { createAsyncThunk } from '@reduxjs/toolkit'
import { Agent, AgentSetup } from '../types/agent'
import {
  cloneAgentAPI,
  createAgentAPI,
  deleteAgentAPI,
  getAgentByIdAPI,
  getAgentsAPI,
  simpleUpdateAgentAPI,
  updateAgentAPI,
} from '@/api/agents'

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
      agentData: AgentSetup
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
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAgentAPI(id)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
