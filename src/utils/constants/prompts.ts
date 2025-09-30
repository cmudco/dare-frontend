import { Prompt } from '@/redux/types/prompt'

export const formatDate = (dateString?: string): string => {
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

export const PROMPTS_TABLE_HEAD = ['Prompt', 'Date Created', 'Action']

export const PROMPT_TABLE_HEADER_TO_KEY = {
  Prompt: 'title',
  'Date Created': 'createdAt',
  Action: null,
} as const

export interface PromptGroup {
  rootPrompt: Prompt
  versions: Prompt[]
}

const findRootPromptId = (
  prompt: Prompt,
  promptMap: Map<number, Prompt>
): number => {
  let current = prompt
  while (current.parent) {
    const parent = promptMap.get(current.parent)
    if (!parent) break
    current = parent
  }
  return current.id
}

export const groupPrompts = (prompts: Prompt[]): PromptGroup[] => {
  const promptMap = new Map<number, Prompt>()
  prompts.forEach((prompt) => promptMap.set(prompt.id, prompt))

  const groups: PromptGroup[] = []
  const groupMap = new Map<number, PromptGroup>()

  prompts.forEach((prompt) => {
    const rootId = findRootPromptId(prompt, promptMap)
    let group = groupMap.get(rootId)
    if (!group) {
      const rootPrompt = promptMap.get(rootId)!
      group = { rootPrompt, versions: [] }
      groupMap.set(rootId, group)
      groups.push(group)
    }
    group.versions.push(prompt)
  })

  groups.forEach((group) => {
    group.versions.sort((a, b) => (b.version || 0) - (a.version || 0))
  })

  return groups
}
