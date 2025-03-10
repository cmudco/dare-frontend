import axiosInstance from "@/utils/axios";
import { getErrorMessage } from "../utils/errorHandler";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getFilesAPI = async () => {
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

export const uploadFileAPI = async (data: FormData) => {
    try {
        const token = getAuthToken();
        const response = await axiosInstance.post("/api/files/", data, {
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

export const deleteFileAPI = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/api/files/${id}/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
