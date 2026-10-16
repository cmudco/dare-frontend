/**
 * Agents table configuration
 */

export const AGENTS_TABLE_HEAD = [
  'Agent',
  'Prompt',
  'Model',
  'Date Created',
  'Action',
] as const

export const AGENT_TABLE_HEADER_TO_KEY = {
  Agent: 'name',
  Prompt: 'promptTitle',
  Model: 'modelName',
  'Date Created': 'createdAt',
  Action: null,
} as const

/** New-agent defaults; match the backend's AGENT_DEFAULT_* (thinking models share the token budget). */
export const AGENT_DEFAULTS = {
  maxTokens: 16384,
  historyLimit: 40,
} as const
