/**
 * Agents table configuration
 */

export const AGENTS_TABLE_HEAD = [
  'Agent',
  'Prompt',
  'Temperature',
  'Date Created',
  'Action',
] as const

export const AGENT_TABLE_HEADER_TO_KEY = {
  Agent: 'name',
  Prompt: 'promptTitle',
  Temperature: 'temperature',
  'Date Created': 'createdAt',
  Action: null,
} as const
