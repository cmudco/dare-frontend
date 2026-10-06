import { McpState } from '../types/mcp'

export const initialMcpState: McpState = {
  // Available servers
  servers: [],
  serversLoading: false,

  // User connections
  connections: [],
  connectionsLoading: false,

  // Tools per server (keyed by slug)
  toolsByServer: {},
  toolsLoading: {},
  toolsError: {},

  // Execution
  executing: false,
  lastExecution: null,
  executionHistory: [],
  executionHistoryLoading: false,

  // Connection testing
  testingConnection: false,
  testResult: null,

  // Errors
  error: null,
}
