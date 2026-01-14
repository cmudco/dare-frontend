/**
 * MCP (Model Context Protocol) types for Redux state management
 */

import { ExecutionStatus } from '@/utils/constants/mcp'

/**
 * Credential schema for connection form
 */
export interface CredentialSchema {
  key: string
  label: string
  type: 'password' | 'text'
  placeholder?: string
  required: boolean
  helpText?: string
}

/**
 * MCP Server - Available integration
 */
export interface McpServer {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  requiredCredentials: CredentialSchema[]
  credentialsHelpUrl: string
  setupGuide: string
  isActive: boolean
  createdAt: string
}

/**
 * User's connection to an MCP server
 */
export interface McpConnection {
  id: number
  server: McpServer
  maskedCredentials: Record<string, string | null>
  hasCredentials: boolean
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * JSON Schema property for tool arguments
 */
export interface JsonSchemaProperty {
  type: string
  description?: string
  enum?: string[]
  default?: unknown
}

/**
 * JSON Schema for tool arguments
 */
export interface JsonSchema {
  type: string
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
}

/**
 * Tool definition from MCP server
 */
export interface McpTool {
  name: string
  description?: string
  inputSchema?: JsonSchema
}

/**
 * Tool execution result
 */
export interface McpToolExecution {
  id: number
  serverName: string
  serverSlug: string
  toolName: string
  toolArguments: Record<string, unknown>
  status: ExecutionStatus
  result: Record<string, unknown> | null
  errorMessage: string
  executionTimeMs: number | null
  createdAt: string
}

/**
 * Request payload for creating a connection
 */
export interface CreateMcpConnectionRequest {
  serverSlug: string
  credentials: Record<string, string>
}

/**
 * Request payload for executing a tool
 */
export interface ExecuteMcpToolRequest {
  serverSlug: string
  toolName: string
  arguments: Record<string, unknown>
}

/**
 * Response from tool execution
 */
export interface ExecuteMcpToolResponse {
  success: boolean
  result?: unknown
  error?: string
}

/**
 * Response from connection test
 */
export interface TestMcpConnectionResponse {
  success: boolean
  message: string
}

/**
 * Response from getting tools
 */
export interface GetMcpToolsResponse {
  tools: McpTool[]
  count: number
  cached: boolean
}

/**
 * MCP Redux state
 */
export interface McpState {
  // Available servers
  servers: McpServer[]
  serversLoading: boolean

  // User connections
  connections: McpConnection[]
  connectionsLoading: boolean

  // Tools per server (keyed by slug)
  toolsByServer: Record<string, McpTool[]>
  toolsLoading: Record<string, boolean>

  // Execution
  executing: boolean
  lastExecution: McpToolExecution | null
  executionHistory: McpToolExecution[]
  executionHistoryLoading: boolean

  // Connection testing
  testingConnection: boolean
  testResult: TestMcpConnectionResponse | null

  // Errors
  error: string | null
}
