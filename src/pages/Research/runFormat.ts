// Presentation helpers for agent runs — the API returns canonical values
// (slugs, ISO timestamps, numeric cost/duration); these format them for display.

import { formatRelativeDate } from '@/utils/dateUtils'
import { AgentRunStatus } from '@/utils/constants/research'

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray'

/** Title-case a role slug, e.g. 'scout' -> 'Scout'. */
export const roleLabel = (role: string): string =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Agent'

export const runStatusBadge = (
  status: string
): { variant: BadgeVariant; label: string } => {
  switch (status) {
    case AgentRunStatus.COMPLETED:
      return { variant: 'green', label: 'Completed' }
    case AgentRunStatus.RUNNING:
      return { variant: 'yellow', label: 'Running' }
    case AgentRunStatus.FAILED:
      return { variant: 'red', label: 'Failed' }
    case AgentRunStatus.QUEUED:
      return { variant: 'gray', label: 'Queued' }
    case AgentRunStatus.STARTED:
      return { variant: 'yellow', label: 'Started' }
    case AgentRunStatus.WAITING_FOR_APPROVAL:
      return { variant: 'yellow', label: 'Awaiting approval' }
    case AgentRunStatus.STOPPING:
      return { variant: 'yellow', label: 'Stopping…' }
    case AgentRunStatus.CANCELLED:
      return { variant: 'gray', label: 'Cancelled' }
    case AgentRunStatus.OUTCOME_UNKNOWN:
      return { variant: 'yellow', label: 'Outcome unknown' }
    default:
      return { variant: 'gray', label: roleLabel(status) }
  }
}

/** Wall-clock duration of a run, e.g. "26s" / "1m 08s" / "—" while running. */
export const formatRunDuration = (
  startedAt: string | null,
  completedAt: string | null
): string => {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export const formatCost = (cost: number): string =>
  cost > 0 ? `$${cost.toFixed(2)}` : '—'

/** Total tokens a run consumed, e.g. "14.6k tokens". */
export const formatTokens = (totalTokens?: number | null): string => {
  if (!totalTokens) return '—'
  return totalTokens < 1000
    ? `${totalTokens} tokens`
    : `${(totalTokens / 1000).toFixed(1)}k tokens`
}

export const formatToolCallDuration = (durationMs: number | null): string => {
  if (durationMs == null) return '—'
  return durationMs < 1000
    ? `${durationMs}ms`
    : `${(durationMs / 1000).toFixed(1)}s`
}

/** Relative time a run was kicked off, e.g. "2 hours ago". */
export const formatRanAt = (ranAt: string): string => formatRelativeDate(ranAt)
