import { createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserState, UserStats } from "../types/user";
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
} from "../../api/auth";
import { getErrorMessage } from "@/utils/errorHandler";

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

export const getUserData = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("user/getUserData", async (_, thunkAPI) => {
    try {
        const user = await getUserDataFromAPI();
        if (!user) {
            return thunkAPI.rejectWithValue("No user data found");
        }
        return user;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const getUserStats = createAsyncThunk<
    UserStats,
    void,
    { rejectValue: string }
>("user/getUserStats", async (_, thunkAPI) => {
    try {

        const response = await getUserStatsFromAPI();

        return response;
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

export const resendVerification = createAsyncThunk(
    "user/resendVerification",
    async ({ email }: { email: string }, thunkAPI) => {
        try {
            const response = await resendVerificationEmail({ email });
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    "user/resetPassword",
    async (
        formData: {
            new_password1: string;
            new_password2: string;
            token: string;
            uid: string;
        },
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
