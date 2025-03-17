import { baseRequest } from "@/utils/requests";
import { METHOD } from "@/utils/constants/requests";
import { MyFile } from "@/redux/types/files";

export const getFilesAPI = async (): Promise<{ results: MyFile[] }> => {
    return await baseRequest<{ results: MyFile[] }>({
        url: "api/files/",
        method: METHOD.GET,
    });
};

export const uploadFileAPI = async (
    data: FormData
): Promise<{ results: File[] }> => {
    return await baseRequest<{ results: File[] }>({
        url: "api/files/",
        method: METHOD.POST,
        data,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteFileAPI = async (id: number): Promise<void> => {
    await baseRequest<void>({
        url: `api/files/${id}/`,
        method: METHOD.DELETE,
    });
};
