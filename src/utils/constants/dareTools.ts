/**
 * DARE Tools constants and enums
 *
 * Centralized enum definitions for DARE tool system.
 * Following RULES.md: Use TypeScript enums for finite option sets.
 */

/**
 * Tool call execution status
 */
export enum ToolCallStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * DARE tool categories for UI grouping
 */
export enum DareToolCategory {
  VISUALIZATION = 'visualization',
  DATA = 'data',
  UTILITY = 'utility',
}

/**
 * Message content types for specialized rendering
 */
export enum MessageContentType {
  TEXT = 'text',
  MERMAID_DIAGRAM = 'mermaid_diagram',
  CHART = 'chart',
  IMAGE = 'image',
  AUDIO = 'audio',
}

/**
 * Chart types supported by create_chart tool
 */
export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
}

/**
 * Server slug identifiers for tool sources
 */
export enum ServerSlug {
  DARE = 'dare',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
}

/**
 * Tool call execution origin.
 */
export enum ToolCallOrigin {
  DARE = 'dare',
  MCP = 'mcp',
  PROVIDER = 'provider',
}

/**
 * DARE tool function names
 */
export enum DareToolName {
  CREATE_CHART = 'create_chart',
  CREATE_DIAGRAM = 'create_diagram',
  CREATE_DOCX = 'create_docx',
}
