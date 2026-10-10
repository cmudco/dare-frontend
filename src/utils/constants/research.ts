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
 * Scout depth presets — mirror the backend scout job (research/tasks.py):
 * quick = max_searches 2 / max_candidates 3; deep = 5 / 10. Explanatory copy
 * for the "how it works" guide; keep in sync if the backend caps change.
 */
export const SCOUT_DEPTH = {
  quick: { searches: 2, findings: 3 },
  deep: { searches: 5, findings: 10 },
} as const

/** The agent-loop ceiling per run (Hermes runtime `agent.max_turns`). */
export const AGENT_LOOP_MAX_TURNS = 40

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
  // Notebooks
  'ipynb',
  // Web / markup
  'html',
  'htm',
  // E-books
  'epub',
] as const

/**
 * Memory layers — values IDENTICAL to the backend `MemoryLayer`. Researcher-wide
 * memory follows the scholar into every project; project memory never leaves
 * this one; procedures are learned methods the agent runs as skills.
 */
export const MEMORY_LAYERS = {
  researcher: {
    label: 'Researcher-wide',
    hint: 'How you work — follows you into every project',
  },
  project: {
    label: 'Project only',
    hint: "This inquiry's scope and framing — never leaves this project",
  },
  procedure: {
    label: 'Skill',
    hint: 'A method the agent follows step by step (a Hermes skill)',
  },
} as const

/** Quick-pick review reasons — values IDENTICAL to the backend `ReviewReasonTag`. */
export const REVIEW_REASON_TAGS = [
  { value: 'preprint', label: 'Preprint', on: 'reject' },
  { value: 'off_scope', label: 'Off scope', on: 'reject' },
  {
    value: 'conflict_of_interest',
    label: 'Conflict of interest',
    on: 'reject',
  },
  { value: 'weak_method', label: 'Weak method', on: 'reject' },
  { value: 'duplicate', label: 'Duplicate', on: 'reject' },
  { value: 'outdated', label: 'Outdated', on: 'reject' },
  { value: 'strong_evidence', label: 'Strong evidence', on: 'approve' },
] as const

/**
 * Quick-pick researcher-wide standards, grouped. Each `rule` is written as the
 * instruction the agent follows, because it is saved verbatim to the scholar's
 * researcher-wide memory (USER.md in every project).
 */
export const STANDARD_CATALOG = [
  {
    group: 'Evidence quality',
    options: [
      {
        label: 'Verify every citation',
        rule: 'Before staging, confirm each DOI or PMID resolves to the paper you describe; drop anything you cannot verify.',
      },
      {
        label: 'Peer-reviewed only',
        rule: 'Stage only peer-reviewed work. Set preprints aside and say how many, so I can ask to see them.',
      },
      {
        label: 'Strongest designs first',
        rule: 'Prefer systematic reviews, meta-analyses and RCTs; label observational studies as such and never present them as causal.',
      },
      {
        label: 'Check retractions',
        rule: 'Before staging a paper, check it has not been retracted or carries an expression of concern; say so if it has.',
      },
      {
        label: 'Flag conflicts of interest',
        rule: 'Flag industry funding, vendor authorship or white papers as a conflict of interest in the rationale.',
      },
      {
        label: 'Question the venue',
        rule: 'Treat papers from questionable or predatory venues with caution and say why in the rationale.',
      },
    ],
  },
  {
    group: 'Reporting',
    options: [
      {
        label: 'Numbers, not adjectives',
        rule: 'Always report sample size, design and effect size (with confidence intervals when given).',
      },
      {
        label: 'Quote the evidence',
        rule: 'Quote the exact passage that supports each claim; never paraphrase a finding without the quote.',
      },
      {
        label: 'Say what is missing',
        rule: 'When the evidence is thin or conflicting, say so plainly instead of smoothing it over.',
      },
      {
        label: 'Primary sources',
        rule: 'Cite the primary study, not a news article, blog or secondary summary of it.',
      },
    ],
  },
  {
    group: 'How I work',
    options: [
      {
        label: 'Recent work',
        rule: 'Prefer work from the last 10 years unless a source is foundational; mark older sources as such.',
      },
      {
        label: 'Short answers',
        rule: 'Answer briefly with the judgement first; offer detail rather than leading with it.',
      },
      {
        label: 'AI search is an adjunct',
        rule: 'Treat your searches as a supplement to my systematic search, never the search of record; say what databases you did not cover.',
      },
      {
        label: 'Look for disconfirmation',
        rule: 'For every claim I am building toward, actively look for the strongest evidence against it.',
      },
    ],
  },
] as const

export const CITATION_STYLES = [
  'APA 7',
  'Chicago (author-date)',
  'MLA 9',
  'Vancouver',
  'IEEE',
  'Harvard',
] as const

/** Scope fields; each value is one "Label: value" entry in MEMORY.md. */
export const PROJECT_SCOPE_FIELDS = [
  {
    key: 'population',
    label: 'Population or setting',
    placeholder: 'e.g. Adult patients in emergency departments',
  },
  {
    key: 'include',
    label: 'Include',
    placeholder:
      'e.g. Studies measuring under- or over-triage, mortality, time to treatment',
  },
  {
    key: 'exclude',
    label: 'Exclude',
    placeholder:
      'e.g. Radiology triage, paediatric-only studies, simulation-only studies',
  },
  {
    key: 'period',
    label: 'Time period',
    placeholder: 'e.g. 2015 onwards',
  },
  {
    key: 'designs',
    label: 'Study designs',
    placeholder: 'e.g. RCTs, prospective cohorts, stepped-wedge trials',
  },
  {
    key: 'geography',
    label: 'Geography or language',
    placeholder:
      'e.g. High-income health systems; English-language publications',
  },
] as const
