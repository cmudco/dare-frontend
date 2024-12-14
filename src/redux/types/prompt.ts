export interface Prompt {
  id: string;
  title: string;
  dateCreated: string;
}

export interface PromptState {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
}
