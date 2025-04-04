import { Prompt } from '../redux/types/prompt'
export const sortPrompts = (prompts: Prompt[]): Prompt[] => {
  return [...prompts].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
