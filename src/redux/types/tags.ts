export interface Tag {
    id: number;
    label: string;
    created_at?: string;
    updated_at?: string;
}

export interface TagState {
    tags: Tag[];
    loading: boolean;
    error: string | null;
}
