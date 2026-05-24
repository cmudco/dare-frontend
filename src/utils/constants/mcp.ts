/**
 * MCP (Model Context Protocol) constants
 */

/**
 * Catalog server slugs referenced in the UI (must match API `McpServer.slug`).
 * SyftBox uses OTP auth instead of the generic credential form on the detail page.
 */
export enum McpCatalogSlug {
  SYFTBOX = 'syftbox',
}

export enum McpTransport {
  STDIO = 'stdio',
  STREAMABLE_HTTP = 'streamable_http',
}

export enum McpAuthType {
  CREDENTIALS = 'credentials',
  NONE = 'none',
  BEARER = 'bearer',
  OAUTH2 = 'oauth2',
}

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
