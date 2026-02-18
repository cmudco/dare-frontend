/**
 * MCP (Model Context Protocol) constants
 */

/**
 * Execution status for MCP tool calls
 */
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  ERROR = 'error',
}
