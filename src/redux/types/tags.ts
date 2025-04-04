export interface Tag {
    id: number;
    label: string;
    fileCount?: number;
}

export interface TagState {
    tags: Tag[];
    loading: boolean;
    error: string | null;
}
