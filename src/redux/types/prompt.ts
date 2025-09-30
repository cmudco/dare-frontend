export interface Prompt {
  id: number
  title: string
  content: string
  createdAt: string
  uploadedAt?: string
  user: string
  version: number
  parent?: number
  isDefault?: boolean
}

export interface PromptState {
  prompts: Prompt[]
  selectedPrompt: Prompt | null
  loading: boolean
  error: string | null
}

export interface PromptTableProps {
  searchQuery: string
}
