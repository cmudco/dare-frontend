import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import {
  loginUser,
  registerUser,
  forgotPasswordUser,
  verifyCodeUser,
  resetPasswordUser,
  sendTokenToBackend as sendTokenToBackendAPI,
  verifyEmailUser,
  setup2FA as setup2FAAPI,
} from "../api/api";

interface UserState {
  user: { username: string; email: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  firebaseUid?: string;
  temp_token: string;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  firebaseUid: "",
  temp_token: "",
};

export const firebaseLogin = createAsyncThunk(
  "user/firebaseLogin",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      console.log("Firebase login successful:", firebaseUser.email);
      console.log("ID token:", idToken);
      console.log("CREDENTIALS: ", credentials);

      return {
        idToken,
        email: credentials.email,
        firebaseUid: firebaseUser.uid,
      };
    } catch (error: any) {
      console.error("Firebase login error:", error.message);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const sendTokenToBackend = createAsyncThunk(
  "user/sendTokenToBackend",
  async (token: string, thunkAPI) => {
    try {
      const data = await sendTokenToBackendAPI(token);
      return data;
    } catch (error) {
      console.error(
        "Error sending token to backend:",
        (error as Error).message
      );
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (
    credentials: { id_token: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      console.log("CREDENTIALS------: ", credentials);

      const data = await loginUser(credentials);
      return data;
    } catch (error) {
      console.log("EHHHHHHH: ", error);
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const register = createAsyncThunk(
  "user/register",
  async (
    formData: {
      username: string;
      email: string;
      password: string;
      confirm_password: string;
      access_code: string;
    },
    thunkAPI
  ) => {
    try {
      const data = await registerUser(formData);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await sendEmailVerification(userCredential.user);
      await signOut(auth);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (formData: { email: string }, thunkAPI) => {
    try {
      const data = await forgotPasswordUser(formData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const verifyCode = createAsyncThunk(
  "user/verifyCode",
  async (formData: { verificationCode: string }, thunkAPI) => {
    try {
      const data = await verifyCodeUser(formData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (formData: { password: string; confirmPassword: string }, thunkAPI) => {
    try {
      const data = await resetPasswordUser(formData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (formData: { firebase_uid: string }, thunkAPI) => {
    try {
      const data = await verifyEmailUser(formData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const resendEmailVerification = createAsyncThunk(
  "user/resendEmailVerification",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      return { email: credentials.email };
    } catch (error: any) {
      console.error("Resend email verification error:", error.message);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const setup2FA = createAsyncThunk(
  "user/setup2FA",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { user: UserState };
    const { temp_token } = state.user;
    try {
      const data = await setup2FAAPI({ temp_token, skip_2fa: false });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
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
          username: "", // Default value for username
          email: action.payload.email,
        };
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(firebaseLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendTokenToBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendTokenToBackend.fulfilled, (state) => {
        state.loading = false;
        // Handle the response from the backend if needed
      })
      .addCase(sendTokenToBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
      .addCase(setup2FA.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(setup2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
