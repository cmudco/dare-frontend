import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState/user";
import {
  loginWithFirebase,
  forgotPassword,
  userLogin,
  userRegister,
  resendEmailVerification,
  resetPassword,
  setup2FA,
  verifyCode,
  fetchUserData,
  userLogout,
} from "./aynscThunks/user";

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser(state, action) {
      state.user = action.payload
    },
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
      .addCase(loginWithFirebase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithFirebase.fulfilled, (state, action) => {
        state.firebaseUid = action.payload.firebaseUid;
        state.loading = false;
        state.user = {
          username: "",
          email: action.payload.email,
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.token = action.payload.temp_token;
        localStorage.setItem("token", state.token);

      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(userLogout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = "";
        state.temp_token = "";
        state.firebaseUid = "";
      })

      .addCase(userRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(userRegister.rejected, (state, action) => {
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
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        localStorage.setItem("token", state.token);
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
      })
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.userLoading = true
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.userLoading = false
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.userLoading = false
        state.error = action.payload as string;
      })
  },
});

export const { updateUser, logout, resetError } = userSlice.actions;

export default userSlice.reducer;
