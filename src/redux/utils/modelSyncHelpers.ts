/**
 * Model Sync Helpers
 *
 * Utilities for synchronizing available models and selected model
 * with the image generation toggle state.
 *
 * These helpers ensure that:
 * - Only appropriate models are shown in the picker (text or image)
 * - The selected model matches the current mode
 * - State stays consistent across conversation switches and page refreshes
 */

import { LLMModel } from '../types/conversation'

/**
 * Filter models by image generation capability
 *
 * @param allModels - Complete list of available models
 * @param isImageGeneration - Whether image generation mode is active
 * @returns Filtered list of models matching the current mode
 */
export const filterModelsByImageGeneration = (
  allModels: LLMModel[],
  isImageGeneration: boolean
): LLMModel[] => {
  return allModels.filter((model) =>
    isImageGeneration
      ? model.isImageGenerator === true
      : !model.isImageGenerator
  )
}

/**
 * Select appropriate model based on conversation state and available models
 *
 * @param conversationModel - Model ID saved in conversation (may be null/undefined)
 * @param availableModels - List of models available for current mode
 * @returns Model ID to select (conversation's model if valid, otherwise first available)
 */
export const selectAppropriateModel = (
  conversationModel: number | null | undefined,
  availableModels: LLMModel[]
): number | null => {
  // Check if conversation's model is in the available models
  const isModelAvailable = availableModels.some(
    (m) => m.id === conversationModel
  )

  // Use conversation's model if it matches the current mode, otherwise use first available
  return isModelAvailable && conversationModel
    ? conversationModel
    : (availableModels[0]?.id ?? null)
}

/**
 * Update model list and selection based on image generation state
 *
 * This is the main synchronization function that:
 * 1. Filters available models to match the current mode (text/image)
 * 2. Selects an appropriate model (conversation's saved model or first available)
 *
 * @param state - Redux conversation state
 * @param imageGenerationEnabled - Whether image generation is currently enabled
 * @param conversationModel - Optional model ID from conversation
 */
export const syncModelsWithImageGenerationState = <
  T extends {
    allModels: LLMModel[]
    availableModels: LLMModel[]
    selectedModel: number | null
  },
>(
  state: T,
  imageGenerationEnabled: boolean,
  conversationModel?: number | null
): void => {
  // Filter models based on image generation state
  const filteredModels = filterModelsByImageGeneration(
    state.allModels,
    imageGenerationEnabled
  )
  state.availableModels = filteredModels

  // Select appropriate model
  state.selectedModel = selectAppropriateModel(
    conversationModel,
    filteredModels
  )
}
