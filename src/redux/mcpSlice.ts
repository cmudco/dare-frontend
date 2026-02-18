import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialMcpState } from './initialState/mcp'
import {
  getMcpServers,
  getMcpConnections,
  createMcpConnection,
  deleteMcpConnection,
  testMcpConnection,
  getMcpTools,
  executeMcpTool,
  getMcpExecutions,
} from './asyncThunks/mcp'
import {
  McpServer,
  McpConnection,
  McpTool,
  McpToolExecution,
  TestMcpConnectionResponse,
  ExecuteMcpToolResponse,
} from './types/mcp'

const mcpSlice = createSlice({
  name: 'mcp',
  initialState: initialMcpState,
  reducers: {
    clearMcpError: (state) => {
      state.error = null
    },
    clearTestResult: (state) => {
      state.testResult = null
    },
    clearLastExecution: (state) => {
      state.lastExecution = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get MCP Servers
      .addCase(getMcpServers.pending, (state) => {
        state.serversLoading = true
        state.error = null
      })
      .addCase(
        getMcpServers.fulfilled,
        (state, action: PayloadAction<McpServer[]>) => {
          state.serversLoading = false
          state.servers = action.payload
        }
      )
      .addCase(getMcpServers.rejected, (state, action) => {
        state.serversLoading = false
        state.error = action.payload as string
      })

      // Get MCP Connections
      .addCase(getMcpConnections.pending, (state) => {
        state.connectionsLoading = true
        state.error = null
      })
      .addCase(
        getMcpConnections.fulfilled,
        (state, action: PayloadAction<McpConnection[]>) => {
          state.connectionsLoading = false
          state.connections = action.payload
        }
      )
      .addCase(getMcpConnections.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload as string
      })

      // Create MCP Connection
      .addCase(createMcpConnection.pending, (state) => {
        state.connectionsLoading = true
        state.error = null
      })
      .addCase(
        createMcpConnection.fulfilled,
        (state, action: PayloadAction<McpConnection>) => {
          state.connectionsLoading = false
          // Update or add the connection
          const index = state.connections.findIndex(
            (c) => c.server.slug === action.payload.server.slug
          )
          if (index !== -1) {
            state.connections[index] = action.payload
          } else {
            state.connections.push(action.payload)
          }
        }
      )
      .addCase(createMcpConnection.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload as string
      })

      // Delete MCP Connection
      .addCase(deleteMcpConnection.pending, (state) => {
        state.connectionsLoading = true
        state.error = null
      })
      .addCase(
        deleteMcpConnection.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.connectionsLoading = false
          // Remove the connection
          state.connections = state.connections.filter(
            (c) => c.server.slug !== action.payload
          )
          // Clear tools for this server
          delete state.toolsByServer[action.payload]
          delete state.toolsLoading[action.payload]
        }
      )
      .addCase(deleteMcpConnection.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload as string
      })

      // Test MCP Connection
      .addCase(testMcpConnection.pending, (state) => {
        state.testingConnection = true
        state.testResult = null
        state.error = null
      })
      .addCase(
        testMcpConnection.fulfilled,
        (state, action: PayloadAction<TestMcpConnectionResponse>) => {
          state.testingConnection = false
          state.testResult = action.payload
        }
      )
      .addCase(testMcpConnection.rejected, (state, action) => {
        state.testingConnection = false
        state.testResult = { success: false, message: action.payload as string }
        state.error = action.payload as string
      })

      // Get MCP Tools
      .addCase(getMcpTools.pending, (state, action) => {
        const serverSlug = action.meta.arg
        state.toolsLoading[serverSlug] = true
        state.error = null
      })
      .addCase(
        getMcpTools.fulfilled,
        (
          state,
          action: PayloadAction<{ serverSlug: string; tools: McpTool[] }>
        ) => {
          const { serverSlug, tools } = action.payload
          state.toolsLoading[serverSlug] = false
          state.toolsByServer[serverSlug] = tools
        }
      )
      .addCase(getMcpTools.rejected, (state, action) => {
        const serverSlug = action.meta.arg
        state.toolsLoading[serverSlug] = false
        state.error = action.payload as string
      })

      // Execute MCP Tool
      .addCase(executeMcpTool.pending, (state) => {
        state.executing = true
        state.lastExecution = null
        state.error = null
      })
      .addCase(
        executeMcpTool.fulfilled,
        (state, action: PayloadAction<ExecuteMcpToolResponse>) => {
          state.executing = false
          // Note: The actual execution record would come from the history endpoint
          // For now, we just track success/failure
          if (!action.payload.success && action.payload.error) {
            state.error = action.payload.error
          }
        }
      )
      .addCase(executeMcpTool.rejected, (state, action) => {
        state.executing = false
        state.error = action.payload as string
      })

      // Get MCP Executions
      .addCase(getMcpExecutions.pending, (state) => {
        state.executionHistoryLoading = true
        state.error = null
      })
      .addCase(
        getMcpExecutions.fulfilled,
        (state, action: PayloadAction<McpToolExecution[]>) => {
          state.executionHistoryLoading = false
          state.executionHistory = action.payload
        }
      )
      .addCase(getMcpExecutions.rejected, (state, action) => {
        state.executionHistoryLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearMcpError, clearTestResult, clearLastExecution } =
  mcpSlice.actions
export default mcpSlice.reducer
