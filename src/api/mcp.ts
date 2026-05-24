import {
  McpServer,
  McpConnection,
  McpToolExecution,
  CreateMcpConnectionRequest,
  ExecuteMcpToolResponse,
  TestMcpConnectionResponse,
  GetMcpToolsResponse,
  StartMcpOAuthResponse,
} from '@/redux/types/mcp'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

/**
 * Paginated response from DRF
 */
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Get all available MCP servers
 */
export const getMcpServersAPI = async (): Promise<McpServer[]> => {
  const response = await baseRequest<PaginatedResponse<McpServer>>({
    url: 'mcp/api/servers/',
    method: METHOD.GET,
  })
  return response.results
}

/**
 * Get user's MCP connections
 */
export const getMcpConnectionsAPI = async (): Promise<McpConnection[]> => {
  const response = await baseRequest<PaginatedResponse<McpConnection>>({
    url: 'mcp/api/connections/',
    method: METHOD.GET,
  })
  return response.results
}

/**
 * Create or update an MCP connection
 */
export const createMcpConnectionAPI = async (
  data: CreateMcpConnectionRequest
): Promise<McpConnection> => {
  return await baseRequest<McpConnection>({
    url: 'mcp/api/connections/',
    method: METHOD.POST,
    data,
  })
}

/**
 * Disconnect from an MCP server
 */
export const deleteMcpConnectionAPI = async (
  serverSlug: string
): Promise<{ message: string }> => {
  return await baseRequest<{ message: string }>({
    url: `mcp/api/connections/${serverSlug}/`,
    method: METHOD.DELETE,
  })
}

/**
 * Test an MCP connection
 */
export const testMcpConnectionAPI = async (
  serverSlug: string
): Promise<TestMcpConnectionResponse> => {
  return await baseRequest<TestMcpConnectionResponse>({
    url: `mcp/api/connections/${serverSlug}/test/`,
    method: METHOD.POST,
  })
}

/**
 * Get available tools for an MCP server
 */
export const getMcpToolsAPI = async (
  serverSlug: string
): Promise<GetMcpToolsResponse> => {
  return await baseRequest<GetMcpToolsResponse>({
    url: `mcp/api/servers/${serverSlug}/tools/`,
    method: METHOD.GET,
  })
}

/**
 * Start OAuth for a remote MCP server
 */
export const startMcpOAuthAPI = async (
  serverSlug: string
): Promise<StartMcpOAuthResponse> => {
  return await baseRequest<StartMcpOAuthResponse>({
    url: `mcp/api/servers/${serverSlug}/oauth/start/`,
    method: METHOD.POST,
  })
}

/**
 * Execute an MCP tool
 */
export const executeMcpToolAPI = async (
  serverSlug: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<ExecuteMcpToolResponse> => {
  return await baseRequest<ExecuteMcpToolResponse>({
    url: `mcp/api/connections/${serverSlug}/execute/`,
    method: METHOD.POST,
    data: {
      toolName,
      arguments: args,
    },
  })
}

/**
 * Get tool execution history
 */
export const getMcpExecutionsAPI = async (params?: {
  server?: string
  status?: string
}): Promise<McpToolExecution[]> => {
  const searchParams = new URLSearchParams()
  if (params?.server) searchParams.append('server', params.server)
  if (params?.status) searchParams.append('status', params.status)

  const queryString = searchParams.toString()
  const response = await baseRequest<PaginatedResponse<McpToolExecution>>({
    url: `mcp/api/executions/${queryString ? `?${queryString}` : ''}`,
    method: METHOD.GET,
  })
  return response.results
}
