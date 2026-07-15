// Finite option sets + presentation metadata for the Research Workspace.

import type { McpConnection } from '@/redux/types/mcp'

export enum ResearchProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/**
 * Agent-run lifecycle. Values are IDENTICAL to the backend `AgentRunStatus`
 * (research/constants.py) — the single source of truth. Never compare run
 * statuses with string literals; use these members.
 */
export enum AgentRunStatus {
  STARTED = 'started',
  RUNNING = 'running',
  QUEUED = 'queued',
  WAITING_FOR_APPROVAL = 'waiting_for_approval',
  STOPPING = 'stopping',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  OUTCOME_UNKNOWN = 'outcome_unknown',
}

/** How far a cancellation got — mirrors the backend `cancellation.state`. */
export enum CancellationState {
  UNCONFIRMED = 'unconfirmed',
  ACKNOWLEDGED = 'acknowledged',
  CONFIRMED = 'confirmed',
}

/** Delegated agent roles — the backend run `role` slug. */
export enum AgentRunRole {
  SCOUT = 'scout',
  CRITIC = 'critic',
  PRESENTER = 'presenter',
}

/** Tool-call outcome — the backend tool-call `status`. */
export enum ToolCallStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Run states where the agent is still working (or a stop is not yet confirmed):
 * the UI keeps polling and shows a live indicator. Everything else is settled.
 */
export const IN_FLIGHT_RUN_STATUSES: AgentRunStatus[] = [
  AgentRunStatus.STARTED,
  AgentRunStatus.RUNNING,
  AgentRunStatus.QUEUED,
  AgentRunStatus.WAITING_FOR_APPROVAL,
  AgentRunStatus.STOPPING,
]

/** True while the agent is still working or a stop is not yet confirmed. */
export const isRunInFlight = (status: string): boolean =>
  (IN_FLIGHT_RUN_STATUSES as string[]).includes(status)

/**
 * True once a run will not change on its own — a real outcome, an honest
 * unknown, or any unrecognized terminal value. Used to stop polling so the UI
 * never spins forever on a state it does not explicitly know about.
 */
export const isRunSettled = (status: string): boolean => !isRunInFlight(status)

/**
 * The tools Scout may search are dynamic: they come from the MCP integrations
 * the user has connected (see `state.mcp.connections`), plus a small set of
 * built-ins below. A project's `enabledTools` therefore stores tool *slugs*
 * (MCP server slugs, or a built-in slug), not a fixed enum.
 */
export interface ResearchToolMeta {
  slug: string
  name: string
  description: string
}

/**
 * Reserved slug for DARE's own web search. Not an MCP *connection* the user
 * adds — it's a DARE-owned builtin. At run time Scout calls `mcp_dare_web_search`
 * and `mcp_dare_fetch_page` through DARE's audited MCP gateway (never the
 * runtime's native web_search/web_extract/browser tools).
 */
export const WEB_SEARCH_TOOL_SLUG = 'web'

/** Tools always available regardless of the user's MCP connections. */
export const BUILTIN_RESEARCH_TOOLS: ResearchToolMeta[] = [
  {
    slug: WEB_SEARCH_TOOL_SLUG,
    name: 'DARE Web Search',
    description:
      "DARE's own web search & page reader, via DARE's audited MCP gateway.",
  },
]

/** Map an active MCP connection to a selectable research tool. */
export const connectionToolMeta = (
  connection: McpConnection
): ResearchToolMeta => ({
  slug: connection.server.slug,
  name: connection.server.name,
  description: connection.server.description,
})

/**
 * Every tool the user may enable for a project: the built-ins plus their active
 * MCP connections.
 */
export const availableResearchTools = (
  connections: McpConnection[]
): ResearchToolMeta[] => [
  ...BUILTIN_RESEARCH_TOOLS,
  ...connections.filter((c) => c.isActive).map(connectionToolMeta),
]

/** Resolve a stored tool slug to display metadata, given the user's connections. */
export const resolveToolMeta = (
  slug: string,
  connections: McpConnection[]
): ResearchToolMeta => {
  const builtin = BUILTIN_RESEARCH_TOOLS.find((t) => t.slug === slug)
  if (builtin) return builtin
  const connection = connections.find((c) => c.server.slug === slug)
  if (connection) return connectionToolMeta(connection)
  return { slug, name: slug, description: '' }
}

/** Research-standards presets — the starting point for a project's soul file. */
export enum StandardsTemplate {
  RESEARCH_ETHICS = 'research-ethics',
  EMPIRICAL_RIGOR = 'empirical-rigor',
  CUSTOM = 'custom',
}

export interface StandardsPreset {
  key: StandardsTemplate
  name: string
  summary: string
  virtues: string[]
}

export const STANDARDS_PRESETS: StandardsPreset[] = [
  {
    key: StandardsTemplate.RESEARCH_ETHICS,
    name: 'Research Ethics',
    summary:
      'Careful, non-fabricating scholarship. A strong default for ethics, philosophy and policy work.',
    virtues: [
      'Never fabricate — every citation must be real and verifiable.',
      'Signal uncertainty honestly, not reflexively.',
      'Never overstate what a source actually supports.',
      'Preserve ethical nuance — respect for persons, beneficence, justice.',
    ],
  },
  {
    key: StandardsTemplate.EMPIRICAL_RIGOR,
    name: 'Empirical Rigor',
    summary:
      'Methods-first standards for data-heavy fields where reproducibility matters.',
    virtues: [
      'Prefer primary sources and pre-registered studies.',
      'Always surface sample size, method and effect size.',
      'Flag replication status where known.',
      'Distinguish correlation from causation explicitly.',
    ],
  },
  {
    key: StandardsTemplate.CUSTOM,
    name: 'Start blank',
    summary: 'Define your own standards later in the workspace soul file.',
    virtues: [],
  },
]

/**
 * Accepted source file extensions for a project. Kept deliberately broad —
 * documents, slides, spreadsheets, web/markup and data files. The backend
 * source pipeline is the authoritative gate on what can actually be ingested.
 */
export const ACCEPTED_SOURCE_EXTENSIONS = [
  // Documents
  'pdf',
  'doc',
  'docx',
  'rtf',
  'odt',
  'txt',
  'md',
  // Slides
  'ppt',
  'pptx',
  // Spreadsheets / data
  'csv',
  'tsv',
  'xls',
  'xlsx',
  'json',
  // Web / markup
  'html',
  'htm',
  // E-books
  'epub',
] as const
