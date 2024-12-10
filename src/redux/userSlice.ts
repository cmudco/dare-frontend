import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState/user";
import {
  firebaseLogin,
  forgotPassword,
  login,
  register,
  resendEmailVerification,
  resetPassword,
  setup2FA,
  verifyCode,
} from "./aynscThunks/user";

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(firebaseLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(firebaseLogin.fulfilled, (state, action) => {
        state.firebaseUid = action.payload.firebaseUid;
        state.loading = false;
        state.user = {
          username: "",
          email: action.payload.email,
        };
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(firebaseLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // .addCase(sendTokenToBackend.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(sendTokenToBackend.fulfilled, (state) => {
      //   state.loading = false;
      //   // Handle the response from the backend if needed
      // })
      // .addCase(sendTokenToBackend.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload as string;
      // })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.temp_token = action.payload.temp_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resendEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendEmailVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setup2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setup2FA.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setup2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, resetError } = userSlice.actions;

export default userSlice.reducer;
