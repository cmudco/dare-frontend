export interface Tag {
    id: number;
    label: string;
}

export interface TagState {
    tags: Tag[];
    loading: boolean;
    error: string | null;
}
