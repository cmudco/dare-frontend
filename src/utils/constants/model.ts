export enum ModelTier {
  Premium = 'premium',
  Advanced = 'advanced',
  Flash = 'flash',
}

export const ModelTierLabels = {
  [ModelTier.Premium]: 'Premium',
  [ModelTier.Advanced]: 'Advanced',
  [ModelTier.Flash]: 'Flash',
}

export const ModelTierDescriptions = {
  [ModelTier.Premium]: 'Flagship models with highest capability',
  [ModelTier.Advanced]: 'Balanced performance and cost',
  [ModelTier.Flash]: 'Fast, cost-optimized models',
}

export const ModelTierColors = {
  [ModelTier.Premium]: {
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900',
    icon: 'text-amber-500',
    dot: 'bg-amber-500',
    ring: 'ring-amber-200 dark:ring-amber-800',
    gradient: 'from-amber-500/10 to-transparent',
  },
  [ModelTier.Advanced]: {
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900',
    icon: 'text-blue-500',
    dot: 'bg-blue-500',
    ring: 'ring-blue-200 dark:ring-blue-800',
    gradient: 'from-blue-500/10 to-transparent',
  },
  [ModelTier.Flash]: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
    icon: 'text-emerald-500',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
    gradient: 'from-emerald-500/10 to-transparent',
  },
}

export const ModelTierOrder = [
  ModelTier.Premium,
  ModelTier.Advanced,
  ModelTier.Flash,
]

export enum ReasoningStatus {
  Yes = 'yes',
  No = 'no',
}

export const ReasoningStatusColors = {
  [ReasoningStatus.Yes]: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
    icon: 'text-emerald-500',
  },
  [ReasoningStatus.No]: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    icon: 'text-slate-500',
  },
}
