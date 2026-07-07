import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/user'
import { User, ConversationSettings } from './types/user'
import {
  forgotPassword,
  userLogin,
  userRegister,
  resetPassword,
  setup2FA,
  verifyCode,
  getUserData,
  userLogout,
  verifyEmailRegistration,
  getUserStats,
  changePassword,
  updateVectorDBSetting,
  fetchVectorDBSetting,
  fetchChunkSettings,
  updateChunkSettings,
  updateUserProfile,
} from './asyncThunks/user'

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
    },
    resetError(state) {
      state.error = null
    },
    updateConversationSettings(
      state,
      action: PayloadAction<Partial<ConversationSettings>>
    ) {
      state.conversationSettings = {
        ...(state.conversationSettings || { fontSize: 'sm' }),
        ...action.payload,
      } as ConversationSettings
      // Also store in localStorage for persistence
      localStorage.setItem(
        'conversationSettings',
        JSON.stringify(state.conversationSettings)
      )
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(verifyEmailRegistration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyEmailRegistration.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.successMessage = action.payload?.alreadyVerified
          ? 'Your email is already verified'
          : 'Email verified successfully'
      })
      .addCase(verifyEmailRegistration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(userLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
        state.token = action.payload.access
        localStorage.setItem('token', state.token)
        localStorage.setItem('refreshToken', action.payload.refresh)
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(getUserData.pending, (state) => {
        state.loading = true
        state.userLoading = true
        state.error = null
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.userLoading = false
        state.error = null
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.loading = false
        state.userLoading = false
        state.error = action.payload as string
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
      })
      .addCase(getUserStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(userLogout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(userLogout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.token = ''
        state.temp_token = ''
        state.loading = false
        state.error = null
      })
      .addCase(userLogout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(userRegister.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(verifyCode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        localStorage.setItem('token', state.token)
        state.error = null
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(setup2FA.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setup2FA.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(setup2FA.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
        state.successMessage = 'Password changed successfully'
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateVectorDBSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateVectorDBSetting.fulfilled, (state, action) => {
        state.loading = false
        if (state.user && action.payload) {
          state.user = {
            ...state.user,
            vectorDb: action.payload.vectorDb,
          }
        }
        state.error = null
        state.successMessage = 'Vector database updated successfully'
      })
      .addCase(updateVectorDBSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchVectorDBSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVectorDBSetting.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        if (state.user) {
          state.user.vectorDb = action.payload.vectorDb
        }
      })
      .addCase(fetchVectorDBSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchChunkSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChunkSettings.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.chunkSettings = action.payload
      })
      .addCase(fetchChunkSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateChunkSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateChunkSettings.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.chunkSettings = action.payload
        state.successMessage = 'Chunk settings updated successfully'
      })
      .addCase(updateChunkSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update user profile (avatar, profile fields)
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { updateUser, logout, resetError, updateConversationSettings } =
  userSlice.actions

export default userSlice.reducer
