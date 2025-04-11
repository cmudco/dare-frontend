import { MODEL_CONFIG } from '../config/modelConfig'

export const getTemperatureColor = (temperature: number): string => {
  if (temperature <= 0.3) return 'text-blue-500'
  if (temperature <= 0.7) return 'text-green-500'
  return 'text-red-500'
}

export const getTemperatureDescription = (temperature: number): string => {
  if (temperature <= 0.3) return 'More precise, deterministic responses'
  if (temperature <= 0.7) return 'Balanced creativity and coherence'
  return 'More creative, diverse responses'
}

export const getMaxTokensColor = (maxTokens: number): string => {
  if (maxTokens <= 1024) return 'text-blue-500'
  if (maxTokens <= 4096) return 'text-green-500'
  return 'text-purple-500'
}

export const getMaxTokensBgColor = (maxTokens: number): string => {
  if (maxTokens <= 1024) return 'bg-blue-500'
  if (maxTokens <= 4096) return 'bg-green-500'
  return 'bg-purple-500'
}

export const getMaxTokensDescription = (maxTokens: number): string => {
  if (maxTokens <= 1024) return 'Shorter, more concise responses'
  if (maxTokens <= 4096) return 'Standard length responses'
  return 'Longer, more detailed responses'
}

export const getMaxTokensPercentage = (maxTokens: number): number => {
  const min = 1
  const max = 8192
  return ((maxTokens - min) / (max - min)) * 100
}

export const DEFAULT_TEMPERATURE = MODEL_CONFIG.temperature
export const DEFAULT_MAX_TOKENS = MODEL_CONFIG.maxTokens
