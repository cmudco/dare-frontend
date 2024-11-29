import axios from "axios";
import { User } from "firebase/auth";

const BASE_URL = import.meta.env.VITE_DJANGO_BACKEND_URL;

console.log("BASE_URL:", BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (data: {
  id_token: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/login/", data, {
      headers: {
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Login failed";
    throw new Error(errorMessage);
  }
};

export const sendTokenToBackend = async (token: string) => {
  try {
    const response = await axiosInstance.post("/api/auth/token/", null, {
      headers: {
        Authorization: `Bearer ${token}`,
        withCrendentials: true,
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
    const response = await axiosInstance.post("/api/auth/register/", data);
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
    const response = await axiosInstance.post("/api/auth/verify-code/", data);
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
    const response = await axiosInstance.post(
      "/api/auth/reset-password/",
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Password reset failed";
    throw new Error(errorMessage);
  }
};
