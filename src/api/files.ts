import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";
import { BASE_URL } from "./config";


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const fetchFiles = async () => {
  try {
    const response = await axiosInstance.get("/api/files/", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const uploadFile = async (data: FormData) => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.post("/api/upload/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const archiveFileAPI = async (id: number) => {
  try {
    const response = await axiosInstance.post(`/api/archive/${id}/`, null, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};