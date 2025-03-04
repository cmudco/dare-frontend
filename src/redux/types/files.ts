export interface MyFile {
    id: number;
    user: string;
    name: string;
    file: string;
    fileType: string;
    size: number;
    tags: number[];
}

export interface FileState {
    files: MyFile[];
    loading: boolean;
    error: string | null;
    selectedTags: number[];
    isModalOpen: boolean;
    filename: string;
}
