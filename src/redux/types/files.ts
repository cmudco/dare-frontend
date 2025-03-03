export interface MyFile {
    id: number;
    user: string;
    name: string;
    file: string;
    fileType: string;
    size: number;
    tags: string[];
}

export interface FileState {
    files: MyFile[];
    loading: boolean;
    error: string | null;
    selectedTags: string[];
    isModalOpen: boolean;
    filename: string;
}
