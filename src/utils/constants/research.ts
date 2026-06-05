// Finite option sets + presentation metadata for the Research Workspace.

export enum ResearchProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/** Tools Scout can be pointed at when gathering sources. */
export enum ResearchTool {
  PUBMED = 'pubmed',
  SCITE = 'scite',
  CONSENSUS = 'consensus',
  WEB = 'web',
}

export enum ResearchSourceKind {
  FILE = 'file',
  URL = 'url',
  DOI = 'doi',
  MANUAL = 'manual',
}

export enum ResearchReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  LATER = 'later',
}

export enum ResearchEvidenceLabel {
  SUPPORTING = 'supporting',
  DISPUTING = 'disputing',
  PARTIAL = 'partial',
  TANGENTIAL = 'tangential',
  WEAK = 'weak',
  UNVERIFIABLE = 'unverifiable',
}

export enum ResearchStagingItemType {
  SOURCE_CANDIDATE = 'source_candidate',
  CLAIM = 'claim',
  NOTE = 'note',
}

export enum ResearchAgentRole {
  MAIN_ASSISTANT = 'main_assistant',
  SCOUT = 'scout',
  LIBRARIAN = 'librarian',
  PAPER_ASSISTANT = 'paper_assistant',
  CRITIC = 'critic',
  PRESENTATION_ASSISTANT = 'presentation_assistant',
}

export enum ResearchAgentRunStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ResearchAgentOutputDestination {
  RUN_LOG = 'run_log',
  STAGING = 'staging',
  REVIEW_METADATA = 'review_metadata',
  MEMORY_PROPOSALS = 'memory_proposals',
  ARTIFACT_PROPOSALS = 'artifact_proposals',
}

export enum ResearchAgentToolCallStatus {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface ResearchToolMeta {
  key: ResearchTool
  name: string
  description: string
}

export const RESEARCH_TOOLS: ResearchToolMeta[] = [
  {
    key: ResearchTool.PUBMED,
    name: 'PubMed',
    description: 'Biomedical and life-sciences literature.',
  },
  {
    key: ResearchTool.SCITE,
    name: 'Scite',
    description: 'Citation context — supporting vs. disputing signals.',
  },
  {
    key: ResearchTool.CONSENSUS,
    name: 'Consensus',
    description: 'Evidence-weighted answers synthesised across papers.',
  },
  {
    key: ResearchTool.WEB,
    name: 'Web search',
    description: 'Open-web fallback for grey literature and preprints.',
  },
]

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

/** Accepted source file extensions for a project. */
export const ACCEPTED_SOURCE_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'txt',
  'md',
] as const
