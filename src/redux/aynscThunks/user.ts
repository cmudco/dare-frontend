import { createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserState } from "../types/user";
import {
    forgotPasswordUser,
    loginUser,
    registerUser,
    resetPasswordUser,
    verifyCodeUser,
    setup2FA as setup2FAAPI,
    fetchUserDataFromAPI,
    verifyEmailKey,
    logoutUser,
    uploadProfilePicture,
} from "../../api/auth";

export const userRegister = createAsyncThunk(
    "user/register",
    async (
        formData: {
            name: string;
            email: string;
            password1: string;
            password2: string;
            role: string;
        },
        thunkAPI
    ) => {
        try {
            const data = await registerUser(formData);

            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const verifyEmailRegistration = createAsyncThunk(
    "user/verifyEmailRegistration",
    async (formData: { key: string }, thunkAPI) => {
        try {
            const data = await verifyEmailKey(formData);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const userLogin = createAsyncThunk(
    "user/login",
    async (credentials: { email: string; password: string }, thunkAPI) => {
        try {
            const data = await loginUser(credentials);
            if (data.access) {
                localStorage.setItem("token", data.access);
            }
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const fetchUserData = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("user/fetchUserData", async (_, thunkAPI) => {
    try {
        const user = await fetchUserDataFromAPI();
        if (!user) {
            return thunkAPI.rejectWithValue("No user data found");
        }
        return user;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const userLogout = createAsyncThunk(
    "user/logoutUser",
    async (_, thunkAPI) => {
        try {
            const data = await logoutUser();
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
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
    async (otp: string, thunkAPI) => {
        try {
            const state = thunkAPI.getState() as { user: UserState };
            const { token } = state.user;
            const data = await verifyCodeUser({ otp: otp, temp_token: token });
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    "user/resetPassword",
    async (
        formData: { password: string; confirmPassword: string },
        thunkAPI
    ) => {
        try {
            const data = await resetPasswordUser(formData);
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const setup2FA = createAsyncThunk(
    "user/setup2FA",
    async (_, thunkAPI) => {
        const state = thunkAPI.getState() as { user: UserState };
        const { token } = state.user;
        try {
            const data = await setup2FAAPI({
                temp_token: token,
                skip_2fa: false,
            });
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const updateProfilePicture = createAsyncThunk(
    "user/updateProfilePicture",
    async (formData: FormData, thunkAPI) => {
        try {
            const response = await uploadProfilePicture(formData);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
