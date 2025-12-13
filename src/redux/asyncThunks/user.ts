import { createAsyncThunk } from '@reduxjs/toolkit'
import { ChunkSettings, User, UserState, UserStats } from '../types/user'
import {
  forgotPasswordUser,
  loginUser,
  registerUser,
  resetPasswordUser,
  verifyCodeUser,
  setup2FA as setup2FAAPI,
  getUserDataFromAPI,
  verifyEmailKey,
  logoutUser,
  uploadProfilePicture,
  resendVerificationEmail,
  getUserStatsFromAPI,
  changePasswordUser,
  updateUserData,
} from '../../api/auth'
import {
  getChunkSettingsAPI,
  getVectorDBPreference,
  updateChunkSettingsAPI,
  updateVectorDBPreference,
} from '@/api/user'

export const userRegister = createAsyncThunk(
  'user/register',
  async (
    formData: {
      name: string
      email: string
      password1: string
      password2: string
      accessCode: string
    },
    thunkAPI
  ) => {
    try {
      const data = await registerUser(formData)

      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const verifyEmailRegistration = createAsyncThunk(
  'user/verifyEmailRegistration',
  async (formData: { key: string }, thunkAPI) => {
    try {
      const data = await verifyEmailKey(formData)
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const userLogin = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const data = await loginUser(credentials)
      if (data.access) {
        localStorage.setItem('token', data.access)
      }
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const getUserData = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('user/getUserData', async (_, thunkAPI) => {
  try {
    const user = await getUserDataFromAPI()
    if (!user) {
      return thunkAPI.rejectWithValue('No user data found')
    }

    if (!user.isActive) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      return thunkAPI.rejectWithValue(
        'This user has been set inactive. Please contact your administrator for assistance.'
      )
    }

    return user
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const getUserStats = createAsyncThunk<
  UserStats,
  void,
  { rejectValue: string }
>('user/getUserStats', async (_, thunkAPI) => {
  try {
    const response = await getUserStatsFromAPI()
    if (!response) {
      return thunkAPI.rejectWithValue('No stats data found')
    }
    return response as unknown as UserStats
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const userLogout = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      const data = await logoutUser()
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (formData: { email: string }, thunkAPI) => {
    try {
      const data = await forgotPasswordUser(formData)
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const verifyCode = createAsyncThunk(
  'user/verifyCode',
  async (otp: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { user: UserState }
      const { token } = state.user
      const data = await verifyCodeUser({ otp: otp, temp_token: token })
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const resendVerification = createAsyncThunk(
  'user/resendVerification',
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const response = await resendVerificationEmail({ email })
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (
    formData: {
      new_password1: string
      new_password2: string
      token: string
      uid: string
    },
    thunkAPI
  ) => {
    try {
      const data = await resetPasswordUser(formData)
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const setup2FA = createAsyncThunk(
  'user/setup2FA',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { user: UserState }
    const { token } = state.user
    try {
      const data = await setup2FAAPI({
        temp_token: token,
        skip_2fa: false,
      })
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const updateProfilePicture = createAsyncThunk(
  'user/updateProfilePicture',
  async (formData: FormData, thunkAPI) => {
    try {
      const response = await uploadProfilePicture(formData)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (
    formData: {
      old_password: string
      new_password1: string
      new_password2: string
    },
    thunkAPI
  ) => {
    try {
      const data = await changePasswordUser(formData)

      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const updateVectorDBSetting = createAsyncThunk(
  'user/updateVectorDBSetting',
  async (formData: { vectorDb: number }, thunkAPI) => {
    try {
      const data = await updateVectorDBPreference(formData)

      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const fetchVectorDBSetting = createAsyncThunk(
  'user/fetchVectorDBSetting',
  async (_, thunkAPI) => {
    try {
      const data = await getVectorDBPreference()

      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const fetchChunkSettings = createAsyncThunk(
  'user/fetchChunkSettings',
  async (_, thunkAPI) => {
    try {
      const data = await getChunkSettingsAPI()
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const updateChunkSettings = createAsyncThunk(
  'user/updateChunkSettings',
  async (formData: ChunkSettings, thunkAPI) => {
    try {
      const data = await updateChunkSettingsAPI(formData)
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

export const updateUserProfile = createAsyncThunk<
  User,
  {
    avatarType?: string
    avatarPreset?: string | null
    avatarUrl?: string | null
    role?: string
    industry?: string
    purpose?: string
    referralSource?: string
  },
  { rejectValue: string }
>('user/updateUserProfile', async (formData, thunkAPI) => {
  try {
    const data = await updateUserData(formData)
    return data
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
