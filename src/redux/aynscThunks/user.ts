import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  loginUser,
  registerUser,
  forgotPasswordUser,
  verifyCodeUser,
  resetPasswordUser,
    verifyEmailUser,
    setup2FA as setup2FAAPI,
} from "../../api/api";
import { auth } from "../../firebase/firebaseConfig";
import { UserState } from "../types/user";

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

      return {
        idToken,
        email: credentials.email,
        firebaseUid: firebaseUser.uid,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

//   export const sendTokenToBackend = createAsyncThunk(
//     "user/sendTokenToBackend",
//     async (token: string, thunkAPI) => {
//       try {
//         const data = await sendTokenToBackendAPI(token);
//         return data;
//       } catch (error) {
//         return thunkAPI.rejectWithValue((error as Error).message);
//       }
//     }
//   );

export const login = createAsyncThunk(
  "user/login",
  async (
    credentials: { id_token: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const data = await loginUser(credentials);
      return data;
    } catch (error) {
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
  async ( otp: string , thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { user: UserState };
      const { temp_token } = state.user;
      const data = await verifyCodeUser({otp: otp, temp_token: temp_token});
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
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
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
