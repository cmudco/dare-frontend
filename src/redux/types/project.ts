import type { Conversation } from './conversation'
import type {
  ProjectIconKey,
  ProjectMemoryScope,
  ProjectSourceMode,
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
  /** Picker id pre-selected in new chats: an LLM PK or `litellm:<key>:<model>`. */
  defaultModelRef: string | null
  webSearchEnabled: boolean
  artifactsEnabled: boolean
  memoryEnabled: boolean
  memoryScope: ProjectMemoryScope
  /** Whether new chats search the project's files or read them in full. */
  sourceMode: ProjectSourceMode
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
    | 'defaultModelRef'
    | 'webSearchEnabled'
    | 'artifactsEnabled'
    | 'memoryEnabled'
    | 'memoryScope'
    | 'sourceMode'
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

export interface SourceSizeRequest {
  fileIds: number[]
  folderIds: number[]
}

/** Estimated prompt cost of reading files in full; libraries are always searched. */
export interface SourceSize {
  fileCount: number
  estimatedTokens: number
  tokenLimit: number
  fitsFullFiles: boolean
}
