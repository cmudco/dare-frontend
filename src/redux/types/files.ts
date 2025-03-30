import { FileStatus } from "@/utils/constants/file";

export interface MyFile {
    id: number;
    user: string;
    name: string;
    file: string;
    fileType: string;
    size: number;
    tags: number[];
    jobId?: string;
    status: FileStatus;
}

export interface FileState {
    files: MyFile[];
    loading: boolean;
    pollingLoading: boolean;
    error: string | null;
    selectedTags: number[];
    isModalOpen: boolean;
    filename: string;
    jobStatuses: { [fileId: number]: { status: FileStatus; jobId?: string; jobStatus?: string } };
}
