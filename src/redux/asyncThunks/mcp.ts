import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getMcpServersAPI,
  createMcpServerAPI,
  getMcpConnectionsAPI,
  createMcpConnectionAPI,
  deleteMcpConnectionAPI,
  testMcpConnectionAPI,
  getMcpToolsAPI,
  startMcpOAuthAPI,
  executeMcpToolAPI,
  getMcpExecutionsAPI,
} from '../../api/mcp'
import {
  CreateMcpConnectionRequest,
  CreateMcpServerRequest,
} from '../types/mcp'

/**
 * Fetch all available MCP servers
 */
export const getMcpServers = createAsyncThunk(
  'mcp/getMcpServers',
  async (_, thunkAPI) => {
    try {
      const response = await getMcpServersAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Staff-only: create a hosted remote MCP server
 */
export const createMcpServer = createAsyncThunk(
  'mcp/createMcpServer',
  async (data: CreateMcpServerRequest, thunkAPI) => {
    try {
      const response = await createMcpServerAPI(data)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Fetch user's MCP connections
 */
export const getMcpConnections = createAsyncThunk(
  'mcp/getMcpConnections',
  async (_, thunkAPI) => {
    try {
      const response = await getMcpConnectionsAPI()
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Create or update an MCP connection with credentials
 */
export const createMcpConnection = createAsyncThunk(
  'mcp/createMcpConnection',
  async (data: CreateMcpConnectionRequest, thunkAPI) => {
    try {
      const response = await createMcpConnectionAPI(data)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Disconnect from an MCP server
 */
export const deleteMcpConnection = createAsyncThunk(
  'mcp/deleteMcpConnection',
  async (serverSlug: string, thunkAPI) => {
    try {
      await deleteMcpConnectionAPI(serverSlug)
      return serverSlug
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Test an MCP connection
 */
export const testMcpConnection = createAsyncThunk(
  'mcp/testMcpConnection',
  async (serverSlug: string, thunkAPI) => {
    try {
      const response = await testMcpConnectionAPI(serverSlug)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Get available tools for an MCP server
 */
export const getMcpTools = createAsyncThunk(
  'mcp/getMcpTools',
  async (serverSlug: string, thunkAPI) => {
    try {
      const response = await getMcpToolsAPI(serverSlug)
      return { serverSlug, tools: response.tools }
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Start OAuth for a remote MCP server
 */
export const startMcpOAuth = createAsyncThunk(
  'mcp/startMcpOAuth',
  async (serverSlug: string, thunkAPI) => {
    try {
      const response = await startMcpOAuthAPI(serverSlug)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Execute an MCP tool
 */
export const executeMcpTool = createAsyncThunk(
  'mcp/executeMcpTool',
  async (
    {
      serverSlug,
      toolName,
      args,
    }: {
      serverSlug: string
      toolName: string
      args: Record<string, unknown>
    },
    thunkAPI
  ) => {
    try {
      const response = await executeMcpToolAPI(serverSlug, toolName, args)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/**
 * Get tool execution history
 */
export const getMcpExecutions = createAsyncThunk(
  'mcp/getMcpExecutions',
  async (
    params: { server?: string; status?: string } | undefined,
    thunkAPI
  ) => {
    try {
      const response = await getMcpExecutionsAPI(params)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
