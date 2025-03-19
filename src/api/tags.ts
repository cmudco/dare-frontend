import { Tag } from "../redux/types/tags";
import { baseRequest } from "@/utils/requests";
import { METHOD } from "@/utils/constants/requests";

export const getTagsAPI = async (): Promise<{ results: Tag[] }> => {
    return await baseRequest<{ results: Tag[] }>({
        url: "api/tags/",
        method: METHOD.GET,
    });
};

export const createTag = async (label: string): Promise<Tag> => {
    return await baseRequest<Tag>({
        url: "api/tags/",
        method: METHOD.POST,
        data: { label },
    });
};

export const updateTag = async (
    id: number,
    tagData: Partial<Tag>
): Promise<Tag> => {
    return await baseRequest<Tag>({
        url: `api/tags/${id}/`,
        method: METHOD.PUT,
        data: tagData,
    });
};

export const deleteTag = async (id: number): Promise<void> => {
    await baseRequest<void>({
        url: `api/tags/${id}/`,
        method: METHOD.DELETE,
    });
};
