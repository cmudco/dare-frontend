/**
 * Memory layer configuration
 *
 * Maps the backend's memory types onto the layered memory model the page
 * presents: what each layer holds, and what is meant to fetch it.
 *
 * Alignment note: the episodic layer is the conversation transcript itself
 * (searched word-for-word), not a class of extracted memories. Legacy
 * `event`-type items are therefore folded into Knowledge as dated facts.
 */
import {
  Library,
  MessagesSquare,
  UserRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { MemoryType } from '@/redux/types/memory'

export type LayerBadgeVariant = 'green' | 'blue' | 'yellow' | 'purple' | 'gray'

export interface MemoryLayerConfig {
  type: MemoryType
  label: string
  /** Layer classification, e.g. "Semantic · hot" */
  kind: string
  /** One-line description of what lives here */
  blurb: string
  /** How this layer reaches the model */
  fetchedBy: string
  icon: LucideIcon
  badge: LayerBadgeVariant
  tile: string
  iconColor: string
}

export const MEMORY_LAYERS: MemoryLayerConfig[] = [
  {
    type: MemoryType.PROFILE,
    label: 'Profile',
    kind: 'Semantic · hot',
    blurb: 'Your USER.md — identity, preferences, constraints.',
    fetchedBy: 'Carried into every conversation',
    icon: UserRound,
    badge: 'green',
    tile: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    type: MemoryType.KNOWLEDGE,
    label: 'Knowledge',
    kind: 'Semantic · cold',
    blurb: 'Facts about your world — including things that happened.',
    fetchedBy: 'Retrieved by the question',
    icon: Library,
    badge: 'blue',
    tile: 'bg-sky-50 dark:bg-sky-900/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    type: MemoryType.BEHAVIOR,
    label: 'Behaviors',
    kind: 'Procedural',
    blurb: 'How you like things done.',
    fetchedBy: 'Retrieved by the task',
    icon: Workflow,
    badge: 'yellow',
    tile: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
]

/**
 * The episodic layer: the conversation transcript itself, searched verbatim.
 * Not a memory bucket — nothing is extracted into it.
 */
export const SESSIONS_LAYER = {
  label: 'Sessions',
  kind: 'Episodic · transcript',
  blurb: 'Your conversations, verbatim — nothing extracted.',
  fetchedBy: 'Searched on demand — by the model, and by you, right here',
  icon: MessagesSquare,
  tile: 'bg-violet-50 dark:bg-violet-900/20',
  iconColor: 'text-violet-600 dark:text-violet-400',
} as const

/**
 * Collapse a raw memory type into the layer that displays it.
 * Legacy `event` items are dated facts and live under Knowledge.
 */
export const bucketForType = (memoryType: string): MemoryType => {
  if (memoryType === MemoryType.EVENT) return MemoryType.KNOWLEDGE
  if (memoryType === MemoryType.PROFILE) return MemoryType.PROFILE
  if (memoryType === MemoryType.BEHAVIOR) return MemoryType.BEHAVIOR
  return MemoryType.KNOWLEDGE
}

export const layerFor = (memoryType: string): MemoryLayerConfig | undefined => {
  const bucket = bucketForType(memoryType)
  return MEMORY_LAYERS.find((layer) => layer.type === bucket)
}

export const badgeVariantFor = (memoryType: string): LayerBadgeVariant =>
  layerFor(memoryType)?.badge ?? 'gray'

/** Rough token estimate used for the profile hot-layer budget preview. */
export const estimateTokens = (text: string): number =>
  Math.ceil(text.length / 4)

/** Target budget for the always-injected profile layer. */
export const PROFILE_TOKEN_BUDGET = 500
