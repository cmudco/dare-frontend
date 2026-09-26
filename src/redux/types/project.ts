import type { Conversation } from './conversation'
import type {
  ProjectIconKey,
  ProjectMemoryScope,
} from '@/utils/constants/project'

export interface Project {
  id: number
  name: string
  icon: ProjectIconKey
  description: string
  /** The prompt holding the project's instructions; pre-selected in new chats. */
  prompt: number | null
  /** Content of `prompt`, or empty when there is none. */
  instructions: string
  /** DB-backed LLM pre-selected in new chats. */
  defaultModel: number | null
  webSearchEnabled: boolean
  artifactsEnabled: boolean
  memoryEnabled: boolean
  memoryScope: ProjectMemoryScope
  fileIds: number[]
  folderIds: number[]
  libraryIds: number[]
  workflowIds: number[]
  conversationCount: number
  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

export interface ProjectDraft {
  name: string
  icon: ProjectIconKey
}

export type ProjectUpdate = Partial<
  Pick<
    Project,
    | 'name'
    | 'icon'
    | 'description'
    | 'prompt'
    | 'instructions'
    | 'defaultModel'
    | 'webSearchEnabled'
    | 'artifactsEnabled'
    | 'memoryEnabled'
    | 'memoryScope'
    | 'fileIds'
    | 'folderIds'
    | 'libraryIds'
    | 'workflowIds'
  >
>

export interface DeleteProjectRequest {
  projectId: number
  deleteConversations: boolean
}

export interface MoveConversationsRequest {
  conversationIds: string[]
  /** Null files the chats back into the main list. */
  projectId: number | null
}

export interface MoveConversationsResult {
  moved: Conversation[]
  failedCount: number
}
