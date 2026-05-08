/**
 * Model Sync Helpers
 *
 * Filters the chat picker by mode (image-generation / audio-transcription)
 * and reconciles the current `selectedModel` (an opaque string id) when the
 * filtered set changes.
 *
 * The id is opaque: for DB-backed LLMs it's the stringified PK; for
 * LiteLLM-routed entries it's `litellm:<key>:<model>`. The FE never inspects
 * the encoding — it just compares ids by equality.
 */

import { LLMModel } from '../types/conversation'

const isImageOrAudioModel = (m: LLMModel): boolean =>
  Boolean(m.isImageGenerator || m.isAudioTranscriber)

export const filterPickerEntriesByImageGeneration = (
  entries: LLMModel[],
  isImageGeneration: boolean
): LLMModel[] =>
  entries.filter((m) =>
    isImageGeneration ? m.isImageGenerator === true : !isImageOrAudioModel(m)
  )

export const filterPickerEntriesByAudioTranscription = (
  entries: LLMModel[],
  isAudioTranscription: boolean
): LLMModel[] =>
  entries.filter((m) =>
    isAudioTranscription ? m.isAudioTranscriber === true : !m.isAudioTranscriber
  )

// Legacy aliases used by non-picker surfaces (Agents, Workflows, config).
export const filterModelsByImageGeneration =
  filterPickerEntriesByImageGeneration
export const filterModelsByAudioTranscription =
  filterPickerEntriesByAudioTranscription

/**
 * Pick a dispatch id for the current mode: keep the desired one if it's
 * still in the filtered entries, otherwise fall back to the first available,
 * otherwise null.
 */
export const selectAppropriateModel = (
  desired: string | null | undefined,
  entries: LLMModel[]
): string | null => {
  if (desired && entries.some((e) => e.id === desired)) return desired
  return entries[0]?.id ?? null
}

export const syncModelsWithImageGenerationState = <
  T extends { pickerEntries: LLMModel[]; selectedModel: string | null },
>(
  state: T,
  imageGenerationEnabled: boolean,
  desired?: string | null
): void => {
  const filtered = filterPickerEntriesByImageGeneration(
    state.pickerEntries,
    imageGenerationEnabled
  )
  state.pickerEntries = filtered
  state.selectedModel = selectAppropriateModel(desired, filtered)
}

export const syncModelsWithAudioTranscriptionState = <
  T extends { pickerEntries: LLMModel[]; selectedModel: string | null },
>(
  state: T,
  audioTranscriptionEnabled: boolean,
  desired?: string | null
): void => {
  const filtered = filterPickerEntriesByAudioTranscription(
    state.pickerEntries,
    audioTranscriptionEnabled
  )
  state.pickerEntries = filtered
  state.selectedModel = selectAppropriateModel(desired, filtered)
}
