import { VectorDbSource, AvatarType } from '@/utils/constants/user'
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

export type PlatformRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'RESEARCHER'
  | 'USER'
  | 'CREATOR'
  | 'SB_USER'

export interface User {
  id: string
  email: string
  username: string | null
  name: string
  role: string // Hoping it's ok to commandeer this for the user.role from the BE
  platformRole?: PlatformRole
  industry?: string
  purpose?: string
  referralSource?: string
  isOnboardingCompleted?: boolean
  is_2fa_enabled: boolean
  is_2fa_pending: boolean
  isActive: boolean
  is_staff: boolean
  roomid?: string
  invite_code?: string
  profile_picture?: string
  vectorDb?: VectorDbSource
  defaultPrompt?: Prompt
  chunkSettings?: ChunkSettings
  conversationSettings?: ConversationSettings
  modelGroup?: {
    id: number
    name: string
    description?: string
    isActive: boolean
  }
  billingMode?: string
  billingModeDisplay?: string
  // Avatar settings
  avatarType?: AvatarType
  avatarPreset?: string
  avatarUrl?: string
}

export interface ChunkSettings {
  chunkSize: number
  overlapSize: number
}

export interface ConversationSettings {
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
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
  conversationSettings: ConversationSettings | null
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
