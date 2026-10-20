import type { PickerModel } from '@/redux/types/conversation'

const LITELLM_PREFIX = 'litellm:'

/** Whether a saved model ref points at a LiteLLM gateway model. */
export const isGatewayModelRef = (ref: string | null): boolean =>
  !!ref && ref.startsWith(LITELLM_PREFIX)

/** Display name of a saved model ref, even when the current picker lacks it. */
export const modelRefLabel = (
  ref: string | null,
  entries: PickerModel[]
): string | null => {
  if (!ref) return null
  const entry = entries.find((candidate) => candidate.id === ref)
  if (entry) return entry.name
  // litellm:<key>:<model> — model names may contain colons.
  return isGatewayModelRef(ref) ? ref.split(':').slice(2).join(':') : null
}
