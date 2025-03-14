import axiosInstance from "@/utils/axios";
import { Tag } from "../redux/types/tags";
import { getErrorMessage } from "../utils/errorHandler";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getTagsAPI = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/api/tags/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createTag = async (label: string): Promise<Tag> => {
    try {
        const response = await axiosInstance.post(`/api/tags/`, {label}, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updateTag = async (
    id: number,
    tagData: Partial<Tag>
): Promise<Tag> => {
    try {
        const response = await axiosInstance.put(`/api/tags/${id}/`, tagData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const deleteTag = async (id: number) => {
    try {
        await axiosInstance.delete(`/api/tags/${id}/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
