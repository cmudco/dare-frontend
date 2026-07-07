import { User } from './user'

export interface AuthResponse {
  access: string
  refresh: string
  key: string
  user: User
}

export interface ErrorResponse {
  error: string
  message: string
}

export interface VerifyEmailResponse {
  detail: string
  access?: string
  refresh?: string
  alreadyVerified?: boolean
}

export interface ResetPasswordResponse {
  detail: string
}

export interface Setup2FAResponse {
  detail: string
  temp_token: string
  token: string
}

export interface UploadProfilePictureResponse {
  avatarUrl: string
  avatarType: string
  message: string
}
