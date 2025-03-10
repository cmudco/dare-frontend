import { getErrorMessage } from "../utils/errorHandler";
import { User } from "../redux/types/user";
import { userAxiosInstance } from "@/utils/axios";

export const registerUser = async (data: {
    name: string;
    email: string;
    password1: string;
    password2: string;
    role: string;
}) => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/registration/",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const verifyEmailKey = async (data: { key: string }) => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/registration/verify-email/",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const loginUser = async (data: { email: string; password: string }) => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/login/",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getUserDataFromAPI = async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const response = await userAxiosInstance.get<User>(
            "/api/dj-rest-auth/user/",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const logoutUser = async () => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/logout/"
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const forgotPasswordUser = async (data: { email: string }) => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/password/reset/",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const verifyCodeUser = async (data: {
    otp: string;
    temp_token: string;
}) => {
    try {
        const response = await userAxiosInstance.post("/api/verify-otp/", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const resendVerificationEmail = async (data: { email: string }) => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/registration/resend-email/",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const resetPasswordUser = async (data: {
    new_password1: string;
    new_password2: string;
    token: string;
    uid: string;
}) => {
    try {
        const response = await userAxiosInstance.post(
            "/api/dj-rest-auth/password/reset/confirm/",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const setup2FA = async (data: {
    temp_token: string;
    skip_2fa: boolean;
}) => {
    try {
        const response = await userAxiosInstance.post("/api/setup-2fa/", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const uploadProfilePicture = async (formData: FormData) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No token found");
    }

    try {
        const response = await userAxiosInstance.put(
            `/api/update-profile-picture/`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
