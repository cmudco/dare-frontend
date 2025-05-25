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
