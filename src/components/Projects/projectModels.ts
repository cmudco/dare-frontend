import type { PickerModel } from '@/redux/types/conversation'

const LITELLM_PREFIX = 'litellm:'

/** Display name of a project's default model, even when the picker lacks it. */
export const projectModelLabel = (
  ref: string | null,
  entries: PickerModel[]
): string | null => {
  if (!ref) return null
  const entry = entries.find((candidate) => candidate.id === ref)
  if (entry) return entry.name
  // litellm:<key>:<model> — model names may contain colons.
  return ref.startsWith(LITELLM_PREFIX)
    ? ref.split(':').slice(2).join(':')
    : null
}
