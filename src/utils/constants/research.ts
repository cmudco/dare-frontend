// Finite option sets + presentation metadata for the Research Workspace.

import type { McpConnection } from '@/redux/types/mcp'

export enum ResearchProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

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

/** Reserved slug for web search — handled by Hermes for now, not an MCP connection. */
export const WEB_SEARCH_TOOL_SLUG = 'web'

/** Tools always available regardless of the user's MCP connections. */
export const BUILTIN_RESEARCH_TOOLS: ResearchToolMeta[] = [
  {
    slug: WEB_SEARCH_TOOL_SLUG,
    name: 'Web search',
    description: 'Open-web search & fetch — handled by Hermes for now.',
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
