import { Agent } from '@/redux/types/agent'
import { AGENT_TABLE_HEADER_TO_KEY } from '@/utils/constants/agents'
import { SortDirection, SortDirectionEnum } from '@/utils/constants/sort'

/**
 * Get the property key from the agent table header
 */
export function getAgentProp(col: string): keyof Agent | null {
  return (
    (AGENT_TABLE_HEADER_TO_KEY as Record<string, keyof Agent | null>)[col] ??
    null
  )
}

/**
 * Sort agents by a specified column and direction
 */
export function sortAgents(
  agents: Agent[],
  sortColumn: string | null,
  sortDirection: SortDirection
): Agent[] {
  const sortedAgents = [...agents]

  if (!sortColumn) {
    // Default sort by createdAt descending
    return sortedAgents.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
  }

  const prop = getAgentProp(sortColumn)
  if (!prop) return sortedAgents

  return sortedAgents.sort((a, b) => {
    let aVal = a[prop]
    let bVal = b[prop]

    // Handle null/undefined values
    if (aVal === null || aVal === undefined) aVal = '' as never
    if (bVal === null || bVal === undefined) bVal = '' as never

    // Handle date fields
    if (prop === 'createdAt' || prop === 'updatedAt') {
      const aDate = aVal ? new Date(aVal as string).getTime() : 0
      const bDate = bVal ? new Date(bVal as string).getTime() : 0
      if (aDate < bDate) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aDate > bDate) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    // Handle string fields
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const aStr = aVal.toLowerCase()
      const bStr = bVal.toLowerCase()
      if (aStr < bStr) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aStr > bStr) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    // Handle number fields
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      if (aVal < bVal) return sortDirection === SortDirectionEnum.ASC ? -1 : 1
      if (aVal > bVal) return sortDirection === SortDirectionEnum.ASC ? 1 : -1
      return 0
    }

    // Fallback comparison
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    const comparison = aStr.localeCompare(bStr)
    return sortDirection === SortDirectionEnum.ASC ? comparison : -comparison
  })
}

/**
 * Filter agents by search query matching name or description
 */
export function filterAgents(agents: Agent[], searchQuery: string): Agent[] {
  if (!searchQuery) return agents

  return agents.filter((agent) => {
    const agentName = agent.name?.toLowerCase() || ''
    const agentDescription = agent.description?.toLowerCase() || ''
    const searchLower = searchQuery.toLowerCase()

    return (
      agentName.includes(searchLower) || agentDescription.includes(searchLower)
    )
  })
}
