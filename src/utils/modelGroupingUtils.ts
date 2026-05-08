import { LLMModel } from '@/redux/types/conversation'
import { ModelTier } from './constants/model'

export type ModelGroupType = 'Premium' | 'Advanced' | 'Flash' | 'Other'

export interface ModelGroup {
  type: ModelGroupType
  entries: LLMModel[]
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

const PROVIDER_PRIORITY: Record<string, number> = {
  CLAUDE: 1,
  OPENAI: 2,
  GEMINI: 3,
  LLAMA: 4,
}

const TYPE_ORDER: Record<ModelGroupType, number> = {
  Premium: 0,
  Advanced: 1,
  Flash: 2,
  Other: 3,
}

/** Categorize by tier — entries without a tier (e.g. LiteLLM-routed) fall
 *  into "Advanced" so they stay in the user's main list. */
export const categorizeEntry = (entry: LLMModel): ModelGroupType =>
  (entry.tier && tierToGroupType[entry.tier]) ?? 'Advanced'

/** Group entries by provider, then by tier. */
export const groupModels = (entries: LLMModel[]): ProviderGroup[] => {
  const providerMap: Record<string, Record<ModelGroupType, LLMModel[]>> = {}

  entries.forEach((entry) => {
    const provider = entry.provider
    const type = categorizeEntry(entry)

    if (!providerMap[provider]) {
      providerMap[provider] = {
        Premium: [],
        Advanced: [],
        Flash: [],
        Other: [],
      }
    }

    providerMap[provider][type].push(entry)
  })

  return Object.entries(providerMap)
    .map(([provider, typeGroups]) => {
      const groups: ModelGroup[] = (
        Object.entries(typeGroups) as [ModelGroupType, LLMModel[]][]
      )
        .filter(([, list]) => list.length > 0)
        .map(([type, list]) => ({
          type,
          entries: list.sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])

      return { provider, groups }
    })
    .sort((a, b) => {
      const aPrio = PROVIDER_PRIORITY[a.provider.toUpperCase()] || 99
      const bPrio = PROVIDER_PRIORITY[b.provider.toUpperCase()] || 99
      if (aPrio !== bPrio) return aPrio - bPrio
      return a.provider.localeCompare(b.provider)
    })
}

/** Group entries globally by tier (cost). */
export const groupModelsByCost = (entries: LLMModel[]): ModelGroup[] => {
  const typeMap: Record<ModelGroupType, LLMModel[]> = {
    Premium: [],
    Advanced: [],
    Flash: [],
    Other: [],
  }

  entries.forEach((entry) => {
    typeMap[categorizeEntry(entry)].push(entry)
  })

  return (Object.entries(typeMap) as [ModelGroupType, LLMModel[]][])
    .filter(([, list]) => list.length > 0)
    .map(([type, list]) => ({
      type,
      entries: list.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
}
