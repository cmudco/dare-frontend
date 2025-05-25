import { VectorDbSource } from '@/utils/constants/user'
import { Prompt } from './prompt'

export interface UserStats {
  promptCount: number
  fileCount: number
  conversationCount: number
  messageCount: number
  aiMessageCount: number
  taggedFilesCount: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
}

export interface User {
  id: string
  email: string
  username: string | null
  name: string
  role: string
  is_2fa_enabled: boolean
  is_2fa_pending: boolean
  is_active: boolean
  is_staff: boolean
  roomid?: string
  invite_code?: string
  profile_picture?: string
  vectorDb?: VectorDbSource
  defaultPrompt?: Prompt
  chunkSettings?: ChunkSettings
}

export interface ChunkSettings {
  chunkSize: number
  overlapSize: number
}

export interface UserState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  temp_token: string
  token: string
  userLoading: boolean
  successMessage: string | null
  stats: UserStats | null
  chunkSettings: ChunkSettings | null
}

export type ChangePasswordValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileSettings {
  first_name: string
  last_name: string
}
export interface VectorDBSettings {
  vector_db: number
}
