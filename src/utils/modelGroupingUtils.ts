import { LLMModel } from '@/redux/types/conversation'
import { ModelTier } from './constants/model'

export type ModelGroupType = 'Premium' | 'Advanced' | 'Flash' | 'Other'

export interface ModelGroup {
  type: ModelGroupType
  models: LLMModel[]
}

export interface ProviderGroup {
  provider: string
  groups: ModelGroup[]
}

const tierToGroupType: Record<string, ModelGroupType> = {
  [ModelTier.Premium]: 'Premium',
  [ModelTier.Advanced]: 'Advanced',
  [ModelTier.Flash]: 'Flash',
}

/**
 * Categorize a model into a group type based on its backend tier.
 */
export const categorizeModel = (model: LLMModel): ModelGroupType => {
  return tierToGroupType[model.tier] ?? 'Advanced'
}

/**
 * Group models by Provider and then by Type
 */
export const groupModels = (models: LLMModel[]): ProviderGroup[] => {
  const providerMap: Record<string, Record<ModelGroupType, LLMModel[]>> = {}

  models.forEach((model) => {
    const provider = model.provider
    const type = categorizeModel(model)

    if (!providerMap[provider]) {
      providerMap[provider] = {
        Premium: [],
        Advanced: [],
        Flash: [],
        Other: [],
      }
    }

    providerMap[provider][type].push(model)
  })

  // Convert to array of ProviderGroup
  return Object.entries(providerMap)
    .map(([provider, typeGroups]) => {
      const groups: ModelGroup[] = (
        Object.entries(typeGroups) as [ModelGroupType, LLMModel[]][]
      )
        .filter(([, models]) => models.length > 0)
        .map(([type, models]) => ({
          type,
          models: models.sort((a, b) => a.name.localeCompare(b.name)),
        }))
        // Sort groups: Premium -> Advanced -> Flash
        .sort((a, b) => {
          const order = { Premium: 0, Advanced: 1, Flash: 2, Other: 3 }
          return order[a.type] - order[b.type]
        })

      return { provider, groups }
    })
    .sort((a, b) => {
      const priority: Record<string, number> = {
        CLAUDE: 1,
        OPENAI: 2,
        GEMINI: 3,
        LLAMA: 4,
      }
      const aPrio = priority[a.provider.toUpperCase()] || 99
      const bPrio = priority[b.provider.toUpperCase()] || 99

      if (aPrio !== bPrio) return aPrio - bPrio
      return a.provider.localeCompare(b.provider)
    })
}

/**
 * Group models globally by Type (Cost/Tier)
 */
export const groupModelsByCost = (models: LLMModel[]): ModelGroup[] => {
  const typeMap: Record<ModelGroupType, LLMModel[]> = {
    Premium: [],
    Advanced: [],
    Flash: [],
    Other: [],
  }

  models.forEach((model) => {
    const type = categorizeModel(model)
    typeMap[type].push(model)
  })

  return (Object.entries(typeMap) as [ModelGroupType, LLMModel[]][])
    .filter(([, models]) => models.length > 0)
    .map(([type, models]) => ({
      type,
      models: models.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      const order = { Premium: 0, Advanced: 1, Flash: 2, Other: 3 }
      return order[a.type] - order[b.type]
    })
}
