import { PromptState } from '../types/prompt'

export const initialState: PromptState = {
  prompts: [],
  selectedPrompt: null,
  loading: false,
  error: null,
}
