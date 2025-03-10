import axiosInstance from "@/utils/axios";
import { getErrorMessage } from "../utils/errorHandler";
import { Prompt } from "../redux/types/prompt";

const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getPromptsAPI = async () => {
    try {
        const response = await axiosInstance.get(`/api/prompts/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data.results;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getPromptByIdAPI = async (id: string) => {
    try {
        const response = await axiosInstance.get<Prompt>(
            `/api/prompts/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createPromptAPI = async (promptData: {
    title: string;
    content: string;
}) => {
    try {
        const response = await axiosInstance.post<Prompt>(
            `/api/prompts/`,
            promptData,
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updatePromptAPI = async (
    id: string,
    promptData: Partial<Prompt>
) => {
    try {
        const response = await axiosInstance.put<Prompt>(
            `/api/prompts/${id}/`,
            promptData,
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const deletePromptAPI = async (id: string) => {
    try {
        await axiosInstance.delete(`/api/prompts/${id}/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
