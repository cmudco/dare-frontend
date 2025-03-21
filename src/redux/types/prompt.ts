export interface Prompt {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    uploadedAt?: string;
    user: string;
}

export interface PromptState {
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    loading: boolean;
    error: string | null;
}

export interface PromptTableProps {
    searchQuery: string;
}
