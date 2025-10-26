import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialApiKeysState } from './initialState/apiKeys'
import {
  getUserApiKeys,
  getProviderStatus,
  updateApiKey,
  deleteApiKey,
  getBillingMode,
  updateBillingMode,
} from './asyncThunks/apiKeys'
import {
  UserProviderApiKey,
  ProviderStatusMap,
  BillingModeResponse,
  ProviderType,
} from './types/apiKeys'

const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState: initialApiKeysState,
  reducers: {
    clearApiKeysError: (state) => {
      state.error = null
      state.updateError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User API Keys
      .addCase(getUserApiKeys.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getUserApiKeys.fulfilled,
        (state, action: PayloadAction<UserProviderApiKey[]>) => {
          state.loading = false
          state.userApiKeys = action.payload
        }
      )
      .addCase(getUserApiKeys.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Get Provider Status
      .addCase(getProviderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getProviderStatus.fulfilled,
        (state, action: PayloadAction<ProviderStatusMap>) => {
          state.loading = false
          state.providerStatus = action.payload
        }
      )
      .addCase(getProviderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update API Key
      .addCase(updateApiKey.pending, (state) => {
        state.updating = true
        state.updateError = null
      })
      .addCase(
        updateApiKey.fulfilled,
        (state, action: PayloadAction<UserProviderApiKey>) => {
          state.updating = false
          // Update the specific key in the array
          const index = state.userApiKeys.findIndex(
            (key) => key.provider === action.payload.provider
          )
          if (index !== -1) {
            state.userApiKeys[index] = action.payload
          } else {
            state.userApiKeys.push(action.payload)
          }
          // Update provider status if it exists
          if (state.providerStatus) {
            state.providerStatus[action.payload.provider] = {
              hasKey: action.payload.hasKey,
              maskedKey: action.payload.maskedKey,
              providerDisplay: action.payload.providerDisplay,
            }
          }
        }
      )
      .addCase(updateApiKey.rejected, (state, action) => {
        state.updating = false
        state.updateError = action.payload as string
      })

      // Delete API Key
      .addCase(deleteApiKey.pending, (state) => {
        state.updating = true
        state.updateError = null
      })
      .addCase(
        deleteApiKey.fulfilled,
        (state, action: PayloadAction<ProviderType>) => {
          state.updating = false
          // Update the key to show it's cleared
          const index = state.userApiKeys.findIndex(
            (key) => key.provider === action.payload
          )
          if (index !== -1) {
            state.userApiKeys[index].hasKey = false
            state.userApiKeys[index].maskedKey = null
          }
          // Update provider status
          if (state.providerStatus && state.providerStatus[action.payload]) {
            state.providerStatus[action.payload].hasKey = false
            state.providerStatus[action.payload].maskedKey = null
          }
        }
      )
      .addCase(deleteApiKey.rejected, (state, action) => {
        state.updating = false
        state.updateError = action.payload as string
      })

      // Get Billing Mode
      .addCase(getBillingMode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getBillingMode.fulfilled,
        (state, action: PayloadAction<BillingModeResponse>) => {
          state.loading = false
          state.billingMode = action.payload.billingMode
          state.billingModeDisplay = action.payload.billingModeDisplay
        }
      )
      .addCase(getBillingMode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update Billing Mode
      .addCase(updateBillingMode.pending, (state) => {
        state.updating = true
        state.updateError = null
      })
      .addCase(
        updateBillingMode.fulfilled,
        (state, action: PayloadAction<BillingModeResponse>) => {
          state.updating = false
          state.billingMode = action.payload.billingMode
          state.billingModeDisplay = action.payload.billingModeDisplay
        }
      )
      .addCase(updateBillingMode.rejected, (state, action) => {
        state.updating = false
        state.updateError = action.payload as string
      })
  },
})

export const { clearApiKeysError } = apiKeysSlice.actions
export default apiKeysSlice.reducer
