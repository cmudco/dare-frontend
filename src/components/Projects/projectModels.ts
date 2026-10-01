import type { PickerModel } from '@/redux/types/conversation'

// Conversations persist only DB-backed LLMs; wallet-routed picker ids are not numeric.
export const persistableModels = (entries: PickerModel[]) =>
  entries.filter((entry) => /^\d+$/.test(entry.id))
