import { User } from '../redux/types/user'
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  AuthResponse,
  VerifyEmailResponse,
  Setup2FAResponse,
  ResetPasswordResponse,
  UploadProfilePictureResponse,
} from '@/redux/types/auth'

export const registerUser = async (data: {
  name: string
  email: string
  password1: string
  password2: string
  accessCode: string
}): Promise<AuthResponse> => {
  return await baseRequest<AuthResponse>({
    url: 'users/api/dj-rest-auth/registration/',
    method: METHOD.POST,
    data,
  })
}

export const verifyEmailKey = async (data: {
  key: string
}): Promise<VerifyEmailResponse> => {
  return await baseRequest<VerifyEmailResponse>({
    url: 'users/api/dj-rest-auth/registration/verify-email/',
    method: METHOD.POST,
    data,
  })
}

export const loginUser = async (data: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  return await baseRequest<AuthResponse>({
    url: 'users/api/dj-rest-auth/login/',
    method: METHOD.POST,
    data,
  })
}

export const getUserDataFromAPI = async (): Promise<User | null> => {
  // farhat: it is only needed for this endpoint
  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }

  return await baseRequest<User>({
    url: 'users/api/dj-rest-auth/user/',
    method: METHOD.GET,
    includeAuthToken: true,
  })
}

export const getUserStatsFromAPI = async (): Promise<AuthResponse> => {
  return await baseRequest<AuthResponse>({
    url: 'users/api/stats/',
    method: METHOD.GET,
  })
}

export const logoutUser = async (): Promise<void> => {
  return await baseRequest<void>({
    url: 'users/api/dj-rest-auth/logout/',
    method: METHOD.POST,
  })
}

export const forgotPasswordUser = async (data: {
  email: string
}): Promise<void> => {
  return await baseRequest<void>({
    url: 'users/api/dj-rest-auth/password/reset/',
    method: METHOD.POST,
    data,
  })
}

export const verifyCodeUser = async (data: {
  otp: string
  temp_token: string
}): Promise<Setup2FAResponse> => {
  return await baseRequest<Setup2FAResponse>({
    url: 'users/api/verify-otp/',
    method: METHOD.POST,
    data,
  })
}

export const resendVerificationEmail = async (data: {
  email: string
}): Promise<void> => {
  return await baseRequest<void>({
    url: 'users/api/dj-rest-auth/registration/resend-email/',
    method: METHOD.POST,
    data,
  })
}

export const resetPasswordUser = async (data: {
  new_password1: string
  new_password2: string
  token: string
  uid: string
}): Promise<ResetPasswordResponse> => {
  return await baseRequest<ResetPasswordResponse>({
    url: 'users/api/dj-rest-auth/password/reset/confirm/',
    method: METHOD.POST,
    data,
  })
}

export const setup2FA = async (data: {
  temp_token: string
  skip_2fa: boolean
}): Promise<Setup2FAResponse> => {
  return await baseRequest<Setup2FAResponse>({
    url: 'users/api/setup-2fa/',
    method: METHOD.POST,
    data,
  })
}

export const uploadProfilePicture = async (
  formData: FormData
): Promise<UploadProfilePictureResponse> => {
  return await baseRequest<UploadProfilePictureResponse>({
    url: 'users/api/avatar/upload/',
    method: METHOD.POST,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const changePasswordUser = async (data: {
  old_password: string
  new_password1: string
  new_password2: string
}): Promise<{ detail: string }> => {
  return await baseRequest<{ detail: string }>({
    url: 'users/api/dj-rest-auth/password/change/',
    method: METHOD.POST,
    data,
  })
}

export const updateUserData = async (data: {
  avatarType?: string
  avatarPreset?: string | null
  avatarUrl?: string | null
  role?: string
  industry?: string
  purpose?: string
  referralSource?: string
}): Promise<User> => {
  return await baseRequest<User>({
    url: 'users/api/dj-rest-auth/user/',
    method: METHOD.PATCH,
    data,
  })
}
