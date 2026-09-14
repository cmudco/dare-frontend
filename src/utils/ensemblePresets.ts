import type { EnsembleBriefs } from '@/redux/types/conversation'
import { EMPTY_BRIEFS } from './ensemble'

/**
 * Briefs that ship with the picker. Angles are positional, so a preset
 * shapes whatever line-up is on the bench; seats past the list get none.
 */
export interface BuiltInPreset {
  id: string
  name: string
  briefs: EnsembleBriefs
}

export const BUILT_IN_PRESETS: BuiltInPreset[] = [
  { id: 'builtin:default', name: 'Default', briefs: EMPTY_BRIEFS },
  {
    id: 'builtin:debate',
    name: 'Debate',
    briefs: {
      ...EMPTY_BRIEFS,
      angles: [
        'Make the strongest honest case for the position most people hold.',
        'Make the strongest honest case against it; find what the consensus misses.',
        'Referee: name where the two sides actually disagree and what evidence would settle it.',
        'Take the long view: how does this look in ten years?',
      ],
    },
  },
  {
    id: 'builtin:research',
    name: 'Research deep-dive',
    briefs: {
      ...EMPTY_BRIEFS,
      angles: [
        'Lead with primary sources, numbers, and dates; cite what you use.',
        'Explain the history and precedent: how did we get here, what happened last time?',
        'Stress-test: risks, counterexamples, and what would have to be true for the popular view to be wrong.',
        'Practical implications: what should someone actually do with this?',
      ],
    },
  },
]
