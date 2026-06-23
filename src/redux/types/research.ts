import {
  ResearchProjectStatus,
  StandardsTemplate,
} from '@/utils/constants/research'

/** A source file brought into a project (staged client-side in the prototype). */
export interface ProjectDraftFile {
  id: string
  name: string
  sizeLabel: string
  kind: string
}

/**
 * A research project — the container for one line of inquiry. A scholar can
 * run several. Counts are denormalised summaries for the project list; the
 * full workspace lives behind the detail route. Maps to the backend
 * `camelCase` response.
 */
export interface ResearchProject {
  id: number
  title: string
  question: string
  field: string
  status: ResearchProjectStatus
  enabledTools: string[]
  standardsTemplate: StandardsTemplate
  pendingReviewCount: number
  approvedCount: number
  sourceCount: number
  /** ISO 8601 timestamp from the backend; formatted for display in the UI. */
  updatedAt: string
  /** ISO 8601 timestamp from the backend; formatted for display in the UI. */
  createdAt: string
  /** Agent runs — present only in the single-project detail payload. */
  runs?: AgentRun[]
  /** Sources — present only in the single-project detail payload. */
  sources?: ResearchSource[]
  /** Active soul file — present only in the single-project detail payload. */
  soulFile?: SoulFile | null
  /** Project memory snapshots — present only in the detail payload. */
  projectMemory?: ProjectMemory[]
  /** Pending agent memory proposals — present only in the detail payload. */
  memoryProposals?: MemoryProposal[]
  /** Staged review candidates — present only in the detail payload. */
  reviewItems?: ReviewItem[]
  /** Approved durable knowledge — present only in the detail payload. */
  knowledgeItems?: KnowledgeItem[]
  /** Generated artifacts — present only in the detail payload. */
  artifacts?: ResearchArtifact[]
}

/** A renderable artifact (artifactType drives the renderer registry). */
export interface ResearchArtifact {
  id: number
  artifactType: string // diagram | html | svg | excalidraw | …
  title: string
  content: string
  source: string // 'hermes' | 'dare'
  provenance: Record<string, unknown>
  createdAt: string
}

/** Where/how a staged item was retrieved (the §11 provenance contract). */
export interface Provenance {
  tool: string
  query?: string
  retrievedAt?: string
  soulFileId?: number | null
  soulFileVersion?: number | null
  role?: string
  runId?: number
}

/** A staged review candidate (the canonical §11 shape). */
export interface ReviewItem {
  id: number
  title: string
  authors: string
  year: number | null
  venue: string
  doi: string
  url: string
  abstract: string
  rationale: string
  confidence: number | null // 0.0–1.0
  confidenceRationale: string
  evidenceLabel: string // supporting|disputing|partial|tangential|unverifiable
  citationContext: string
  provenance: Provenance
  status: string // staged|approved|rejected|later
  rejectionReason: string
  laterReason: string
  criticMetadata: Record<string, unknown>
  reviewMetadata: Record<string, unknown>
  createdAt: string
}

/** Approved durable knowledge (display fields read from the source staging item). */
export interface KnowledgeItem {
  id: number
  title: string
  authors: string
  year: number | null
  venue: string
  url: string
  rationale: string
  confidence: number | null
  evidenceLabel: string
  citationContext: string
  provenance: Provenance
  soulFileVersion: string
  usedIn: string[]
  approvedAt: string | null
  createdAt: string
}

/** A durable project-memory snapshot (working thesis, open question, …). */
export interface ProjectMemory {
  id: number
  label: string
  detail: string
  source: string
  capturedAt: string
}

/** An agent-proposed memory awaiting the scholar's decision. */
export interface MemoryProposal {
  id: number
  role: string
  content: string
  memoryType: string
  status: string
  proposedAt: string
}

/** One message in the hands-on chat transcript. */
export interface ChatMessage {
  id: number
  role: string // 'user' | 'assistant'
  content: string
  createdAt: string
}

/** The current version of a project's soul file (standards document). */
export interface SoulFile {
  id: number
  version: number
  content: string
  origin: string
  updatedAt: string
}

/** A source in the project's library (uploaded file or discovered record). */
export interface ResearchSource {
  id: number
  name: string
  kind: string
  sizeLabel: string
  pageCount: number | null
  sourceType: string
  title: string
  authors: string
  year: number | null
  venue: string
  doi: string
  url: string
  createdAt: string
}

/** File metadata attached on project create (from the wizard). */
export interface CreateProjectSourceInput {
  name: string
  kind: string
  sizeLabel: string
}

/** A single tool invocation within a run (from the run audit). */
export interface AgentRunToolCall {
  tool: string
  query: string
  url?: string
  status: string // 'success' | 'error'
  durationMs: number | null
  resultTokens?: number | null
  resultSummary?: string
  error?: string
}

/** Token usage the agent runtime reported for a run. */
export interface AgentRunUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

/** One delegated run from DARE to Hermes — the Runs/activity record. */
export interface AgentRun {
  id: number
  role: string // slug, e.g. 'scout' | 'critic'
  mode: string // 'scout' | 'chat'
  task: string
  status: string // started | running | queued | completed | failed
  statusDetail: string // live progress line, e.g. 'Searching the web…'
  soulFileVersion: string
  tools: string[]
  stagedCount: number
  cost: number
  usage: AgentRunUsage
  startedAt: string | null
  completedAt: string | null
  ranAt: string
  hermesRunId: string
  toolCalls: AgentRunToolCall[]
}

/** Working state for the create/edit wizard before it becomes a project. */
export interface ProjectDraft {
  title: string
  question: string
  field: string
  files: ProjectDraftFile[]
  enabledTools: string[]
  standardsTemplate: StandardsTemplate
}

/** Payload sent to the backend to create a project. */
export interface CreateResearchProjectPayload {
  title: string
  question: string
  field: string
  enabledTools: string[]
  standardsTemplate: StandardsTemplate
  /** Source-file metadata to attach on create. */
  sources?: CreateProjectSourceInput[]
}

/** Editable project fields for `PATCH /api/research/projects/{id}/`. */
export type UpdateResearchProjectPayload = Partial<
  Omit<CreateResearchProjectPayload, 'sources'>
>

/** Paginated list response from `GET /api/research/projects/`. */
export interface ResearchProjectsResponse {
  count: number
  next: string | null
  previous: string | null
  results: ResearchProject[]
}

export interface ResearchState {
  projects: ResearchProject[]
  loading: boolean
  error: string | null
}

/** A node in the project's evidence graph (`GET .../graph/`). */
export interface EvidenceGraphNode {
  id: string
  kind: 'question' | 'source' | 'request'
  label: string
  stagingItemId?: number
  authors?: string
  year?: number | null
  venue?: string
  doi?: string
  url?: string
  status?: string
  confidence?: number
  evidenceLabel?: string
  rationale?: string
  sourceTool?: string
  runId?: number
}

/** An edge in the evidence graph — every kind is observed, never inferred. */
export interface EvidenceGraphEdge {
  source: string
  target: string
  kind: 'evidence' | 'request' | 'mention'
  label?: string
  weight?: number
}

export interface EvidenceGraph {
  nodes: EvidenceGraphNode[]
  edges: EvidenceGraphEdge[]
}

/** One concept file in the project's OKF bundle (`GET .../okf-bundle/`). */
export interface OkfBundleFile {
  path: string
  conceptId: string
  kind: 'index' | 'log' | 'thesis' | 'source'
  type: string
  title: string
  description: string
  /** Verbatim YAML frontmatter — keys are snake_case as in the .md file. */
  frontmatter: Record<string, unknown>
  body: string
  links: { to: string; text: string }[]
  evidenceLabel: string
  confidence: number | null
}

export interface OkfBundleGraphNode {
  id: string
  kind: 'thesis' | 'source'
  type: string
  label: string
  evidenceLabel: string
  confidence: number | null
}

export interface OkfBundleGraphEdge {
  source: string
  target: string
  kind: 'cites'
}

/** The durable-knowledge bundle for the Maps tab's OKF viewer. */
export interface OkfBundle {
  files: OkfBundleFile[]
  graph: { nodes: OkfBundleGraphNode[]; edges: OkfBundleGraphEdge[] }
}
