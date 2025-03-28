import { Prompt } from "../redux/types/prompt";
import { baseRequest } from "@/utils/requests";
import { METHOD } from "@/utils/constants/requests";

export const getPromptsAPI = async (): Promise<{ results: Prompt[] }> => {
    return await baseRequest<{ results: Prompt[] }>({
        url: "api/prompts/",
        method: METHOD.GET,
    });
};

export const getPromptByIdAPI = async (id: string): Promise<Prompt> => {
    return await baseRequest<Prompt>({
        url: `api/prompts/${id}/`,
        method: METHOD.GET,
    });
};

export const createPromptAPI = async (promptData: {
    title: string;
    content: string;
    version?: number;
    parent?: string;
}): Promise<Prompt> => {
    return await baseRequest<Prompt>({
        url: "api/prompts/",
        method: METHOD.POST,
        data: promptData,
    });
};

export const updatePromptAPI = async (
    id: string,
    promptData: Partial<Prompt>
): Promise<Prompt> => {
    return await baseRequest<Prompt>({
        url: `api/prompts/${id}/`,
        method: METHOD.PUT,
        data: promptData,
    });
};

export const deletePromptAPI = async (id: string): Promise<void> => {
    await baseRequest<void>({
        url: `api/prompts/${id}/`,
        method: METHOD.DELETE,
    });
};
