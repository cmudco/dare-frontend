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

import { ConversationState, PickerModel } from '../types/conversation'

const isImageOrAudioModel = (m: PickerModel): boolean =>
  Boolean(m.isImageGenerator || m.isAudioTranscriber)

export const filterPickerEntriesByImageGeneration = (
  entries: PickerModel[],
  isImageGeneration: boolean
): PickerModel[] =>
  entries.filter((m) =>
    isImageGeneration ? m.isImageGenerator === true : !isImageOrAudioModel(m)
  )

/**
 * Pick a dispatch id for the current mode: keep the desired one if it's
 * still in the filtered entries, otherwise require an explicit selection.
 */
export const selectAppropriateModel = (
  desired: string | null | undefined,
  entries: PickerModel[]
): string | null => {
  if (desired && entries.some((e) => e.id === desired)) return desired
  return null
}

/**
 * Re-derive the picker from the unfiltered catalog for the active mode
 * (priority: audio > image > text), so toggling modes is lossless.
 */
export const syncPickerEntriesWithMode = (
  state: Pick<
    ConversationState,
    | 'modelCatalog'
    | 'pickerEntries'
    | 'selectedModel'
    | 'imageGenerationEnabled'
    | 'audioTranscriptionEnabled'
  >,
  desired?: string | null
): void => {
  const entries = state.audioTranscriptionEnabled
    ? state.modelCatalog.filter((m) => m.isAudioTranscriber === true)
    : filterPickerEntriesByImageGeneration(
        state.modelCatalog,
        state.imageGenerationEnabled
      )
  state.pickerEntries = entries
  state.selectedModel = selectAppropriateModel(desired, entries)
}

/** Wait for the route's conversation and catalog before prompting for a model. */
export const isModelPickerReady = ({
  conversationListStatus,
  modelCatalogStatus,
  routeConversationId,
  activeConversationId,
  conversationCount,
}: Pick<ConversationState, 'conversationListStatus' | 'modelCatalogStatus'> & {
  routeConversationId?: string
  activeConversationId?: string
  conversationCount: number
}): boolean =>
  conversationListStatus === 'succeeded' &&
  modelCatalogStatus === 'succeeded' &&
  (routeConversationId
    ? activeConversationId === routeConversationId
    : !activeConversationId && conversationCount === 0)
