import axios from "axios";
import { User } from "firebase/auth";

const BASE_URL = import.meta.env.VITE_DJANGO_BACKEND_URL;

console.log("BASE_URL:", BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This should be set here, not in headers
});

export const loginUser = async (data: {
  id_token: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/login/", data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Login failed";
    throw new Error(errorMessage);
  }
};

export const sendTokenToBackend = async (token: string) => {
  try {
    const response = await axiosInstance.post("/auth/token/", null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Failed to send token to backend";
    throw new Error(errorMessage);
  }
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  access_code: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/create-user/", data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Registration failed";
    throw new Error(errorMessage);
  }
};

export const forgotPasswordUser = async (data: { email: string }) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/forgot-password/",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Password recovery failed";
    throw new Error(errorMessage);
  }
};

export const verifyCodeUser = async (data: { verificationCode: string }) => {
  try {
    const response = await axiosInstance.post("/auth/verify-code/", data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Verification failed";
    throw new Error(errorMessage);
  }
};

export const resetPasswordUser = async (data: {
  password: string;
  confirmPassword: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password/", data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Password reset failed";
    throw new Error(errorMessage);
  }
};

export const verifyEmailUser = async (data: { firebase_uid: string }) => {
  try {
    const response = await axiosInstance.post("/auth/verify-email/", data, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.data) {
      throw new Error("Failed to verify email");
    }

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Verification failed";
    throw new Error(errorMessage);
  }
};
