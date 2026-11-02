import { WalletType } from './billing'

export type BackgroundTask =
  | 'titles'
  | 'summaries'
  | 'memory'
  | 'query_analysis'

export type BackgroundModelSource =
  | 'litellm_key'
  | 'user'
  | 'task_override'
  | 'platform_default'
  | 'environment'
  | 'unavailable'

export interface BackgroundModelCandidate {
  identifier: string
  name: string
  provider: string
  inputTokenRatePerMillion: string
  outputTokenRatePerMillion: string
}

export interface BackgroundTaskModel {
  task: BackgroundTask
  label: string
  modelIdentifier: string
  modelName: string
  source: BackgroundModelSource
  sourceLabel: string
  walletType: WalletType | ''
}

export interface BackgroundModelOverview {
  walletType: WalletType
  litellmKey: { id: string; label: string; backgroundModel: string } | null
  selected: string
  selectedOffered: boolean
  tasks: BackgroundTaskModel[]
  candidates: BackgroundModelCandidate[]
  canManagePlatform: boolean
}

export interface PlatformTaskModel {
  task: BackgroundTask
  label: string
  override: string
  inUse: BackgroundModelCandidate | null
  source: BackgroundModelSource
  sourceLabel: string
}

export interface PlatformBackgroundModels {
  default: string
  tasks: PlatformTaskModel[]
  candidates: BackgroundModelCandidate[]
}

export interface PlatformBackgroundModelsUpdate {
  default?: string
  overrides?: { task: BackgroundTask; model: string }[]
}
