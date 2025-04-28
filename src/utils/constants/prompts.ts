export const PROMPTS_TABLE_HEAD = ['Prompt', 'Date Created', 'Action']

export const PROMPT_TABLE_HEADER_TO_KEY = {
  Prompt: 'title',
  'Date Created': 'createdAt',
  Action: null,
} as const

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Unknown date'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
