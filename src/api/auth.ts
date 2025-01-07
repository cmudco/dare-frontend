import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";
import { User } from "../redux/types/user";
import { BASE_URL } from "./config";


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const loginUser = async (data: {
  id_token: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/login/", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
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
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const forgotPasswordUser = async (data: { email: string }) => {
  try {
    const response = await axiosInstance.post("/api/auth/forgot-password/", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyCodeUser = async (data: { otp: string, temp_token: string }) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp/", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resetPasswordUser = async (data: {
  password: string;
  confirmPassword: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password/", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
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
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const setup2FA = async (data: {
  temp_token: string;
  skip_2fa: boolean;
}) => {
  try {
    const response = await axiosInstance.post("/auth/setup-2fa/", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const fetchUserDataFromAPI = async (): Promise<User> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get<User>(
      `${import.meta.env.VITE_DJANGO_BACKEND_URL}/auth/me/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};