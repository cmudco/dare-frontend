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
  isPublished?: boolean
}

export interface PublishedPrompt {
  id: number
  promptId: number
  title: string
  content: string
  description: string
  authorEmail: string
  publishedAt: string
  version: number
}

export interface PromptState {
  prompts: Prompt[]
  selectedPrompt: Prompt | null
  loading: boolean
  error: string | null
}

export interface PromptsLibraryState {
  publishedPrompts: PublishedPrompt[]
  loading: boolean
  error: string | null
}

export interface PromptTableProps {
  searchQuery: string
}
