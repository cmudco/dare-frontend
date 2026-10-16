import {
  CancellationState,
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
export type ProjectKind =
  | 'general'
  | 'academic'
  | 'work'
  | 'money'
  | 'personal'
  | 'news'

export interface ResearchProject {
  id: number
  title: string
  question: string
  field: string
  kind: ProjectKind
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
  /** What sort of source the Scout said this is (peer-reviewed, preprint…). */
  kind?: string
  query?: string
  retrievedAt?: string
  soulFileId?: number | null
  soulFileVersion?: number | null
  role?: string
  runId?: number
  /** DARE's check of the source before staging; `flags` are what to look at. */
  check?: {
    flags: string[]
    read?: boolean
    quoteFound?: boolean
    doiMatches?: boolean
  }
}

/** A finding a Scout staged for review. */
export interface ReviewItem {
  id: number
  title: string
  authors: string
  year: number | null
  venue: string
  doi: string
  url: string
  abstract: string
  /** What the source establishes for the Scout's task. Empty on older items. */
  finding: string
  /** Why it matters and its limits. */
  rationale: string
  confidence: number | null // 0.0–1.0
  evidenceLabel: string // supporting|disputing|partial|tangential|unverifiable
  /** The sentence on the page that backs the finding. */
  citationContext: string
  provenance: Provenance
  status: string // staged|approved|rejected|later
  rejectionReason: string
  laterReason: string
  criticMetadata: Record<string, unknown>
  reviewMetadata: ReviewMetadata
  /** The chat thread whose Scout staged this item, if any. */
  threadId: number | null
  /** The Scout's short label and full task: the question this answers. */
  focus: string
  task: string
  createdAt: string
}

/** The scholar's decision on a staged item and why. */
export interface ReviewMetadata {
  decision?: string
  note?: string
  tags?: ReviewReasonTag[]
  decidedAt?: string
}

export type ReviewReasonTag =
  | 'preprint'
  | 'off_scope'
  | 'conflict_of_interest'
  | 'weak_method'
  | 'duplicate'
  | 'outdated'
  | 'strong_evidence'

/** Approved durable knowledge (display fields read from the source staging item). */
export interface KnowledgeItem extends ReviewItem {
  /** The staging item it was approved from (`id` is the knowledge id). */
  stagingItemId: number | null
  usedIn: string[]
  approvedAt: string | null
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
/** Where an approved memory lives: every project, this project, or a method. */
export type MemoryLayer = 'researcher' | 'project' | 'procedure'

export type MemoryProposalOrigin = 'foreground' | 'background_review' | 'legacy'

/** A review note a memory proposal drew on. */
export interface MemoryEvidence {
  itemId: number | null
  title: string
  decision: string
  note: string
  tags: string[]
  at: string
}

export interface MemoryProposal {
  id: number
  role: string
  content: string
  memoryType: string
  layer: MemoryLayer
  origin: MemoryProposalOrigin
  why: string
  evidence: MemoryEvidence[]
  thread: number | null
  status: string
  proposedAt: string
}

export interface ScoutsLaunchedPayload {
  scouts: { runId: number; focus: string; task: string }[]
}

export interface ReviewDecisionPayload {
  itemId: number
  title: string
  decision: 'approve' | 'reject' | 'later'
  note: string
  tags: ReviewReasonTag[]
  runId: number
}

interface ThreadRowBase {
  id: number
  content: string
  run: number | null
  createdAt: string
}

/** A scholar or agent message in a thread. */
export interface ThreadTextRow extends ThreadRowBase {
  role: 'user' | 'assistant'
  eventType: ''
}

/** A DARE event in a thread; `payload` is typed by `eventType`. */
export type ThreadEventRow = ThreadRowBase & { role: 'event' } & (
    | { eventType: 'scouts_launched'; payload: ScoutsLaunchedPayload }
    | { eventType: 'scout_finished'; payload: ScoutSummary }
    | { eventType: 'review_decision'; payload: ReviewDecisionPayload }
    | { eventType: 'memory_proposed'; payload: ThreadProposal }
    | { eventType: 'memory_decided'; payload: ThreadProposal }
  )

/** One row of a chat thread: a message, or a DARE event. */
export type ChatMessage = ThreadTextRow | ThreadEventRow

/** A chat thread in the thread list. */
export interface ResearchThread {
  id: number
  title: string
  preview: string
  messageCount: number
  lastRunAt: string | null
  createdAt: string
}

/** What a run did because of the scholar's approved memory. */
export interface LearningApplied {
  memory: string
  effect: string
}

export interface LearningSetAside {
  title: string
  url: string
  reason: string
}

/** A Scout launched from a thread, with what it staged so far. */
export interface ScoutSummary {
  runId: number
  focus: string
  status: string
  statusDetail: string
  staged: number
  /** USD this Scout cost, priced from DARE's model rates. */
  cost: number
  titles: string[]
  applied: LearningApplied[]
  setAside: LearningSetAside[]
  /** Each search and page read so far, oldest first. */
  activity: ScoutActivity[]
}

export interface ScoutActivity {
  verb: string
  tool: string
  detail: string
  ok: boolean
  error: string
  at: string
}

/** A memory proposal as it appears inline in a thread. */
export interface ThreadProposal {
  proposalId: number
  layer: MemoryLayer
  content: string
  why: string
  origin: MemoryProposalOrigin
  status: string
  action: string
}

export interface ThreadDetail {
  thread: ResearchThread
  messages: ChatMessage[]
  scouts: ScoutSummary[]
  proposals: Record<string, ThreadProposal>
  activeTurn: ThreadTurnState | null
  /** The thread's latest agent turn failed or its outcome is unconfirmed. */
  lastTurnFailed: ThreadTurnState | null
  /** USD spent on this thread's agent runs so far. */
  cost: number
}

export interface ThreadTurnState {
  runId: number
  followup: boolean
  status: string
}

/** One row of the decision timeline in the Learning view. */
export interface LearningTimelineRow {
  id: number
  content: string
  layer: MemoryLayer
  status: string
  origin: MemoryProposalOrigin
  why: string
  evidence: MemoryEvidence[]
  action: string
  threadId: number | null
  projectId: number
  proposedAt: string
  decidedAt: string | null
}

export interface LearnedProcedure {
  id: number
  name: string
  description: string
  content: string
  version: number
  scope: 'researcher' | 'project'
  approvedAt: string
}

/** How much correcting one Scout run needed — a point on the learning chart. */
export interface CorrectionPoint {
  runId: number
  task: string
  at: string
  staged: number
  decided: number
  rejected: number
  notes: number
  applied: number
  setAside: number
}

export interface LearningOverview {
  procedures: LearnedProcedure[]
  pending: LearningTimelineRow[]
  timeline: LearningTimelineRow[]
  corrections: CorrectionPoint[]
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

/**
 * Cancellation record for a run the user asked to stop. Present only once a
 * cancellation was requested (otherwise null). `state` reflects how far the
 * stop got: `unconfirmed` (requested, no ack), `acknowledged` (Hermes ack'd,
 * outcome not yet terminal), `confirmed` (Hermes reports terminal `cancelled`).
 */
export interface AgentRunCancellation {
  state: CancellationState
  requestedAt: string | null
  lastAttemptAt: string | null
  attemptCount: number
  acknowledgedAt: string | null
  confirmedAt: string | null
  stopHttpStatus: number | null
  errorCode: string
  errorDetail: string
}

/** One delegated run from DARE to Hermes — the Runs/activity record. */
export interface AgentRun {
  id: number
  role: string // slug, e.g. 'scout' | 'critic'
  mode: string // 'scout' | 'chat'
  task: string
  // started | running | queued | waiting_for_approval | stopping | completed
  // | failed | cancelled | outcome_unknown
  status: string
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
  toolCallCount: number
  cancellation: AgentRunCancellation | null
  /** The chat thread this run belongs to or was launched from. */
  thread: number | null
  learning: { applied?: LearningApplied[]; setAside?: LearningSetAside[] }
  /** Short label a thread gave this Scout. */
  focus: string
  /** Scouts only: how wide it looked. */
  coverage: { searches: number; reads: number } | null
}

/** One earlier turn sent to the agent as conversation history. */
export interface RunPromptTurn {
  role: 'user' | 'assistant'
  content: string
}

/** Exactly what a run was sent (the profile files it loaded, then the rest). */
export interface RunPrompt {
  instructions: string
  input: string
  history: RunPromptTurn[]
  files: {
    'SOUL.md': string
    'MEMORY.md': string
    'USER.md': string
    skills: string[]
  }
}

/** One role's brief, as a run of that role is given it. */
export interface PromptBrief {
  key: 'chat' | 'scout-now' | 'follow-up' | 'scout' | 'critic' | 'presenter'
  label: string
  /** Where it goes in the run: the instructions, or the input. */
  part: 'instructions' | 'input'
  when: string
  text: string
}

/** One run's full audit, from the single-run endpoint. */
export interface AgentRunDetail extends AgentRun {
  toolCalls: AgentRunToolCall[]
  /** Null for runs from before prompts were recorded. */
  prompt: RunPrompt | null
  rawOutput: string
}

/** Working state for the create/edit wizard before it becomes a project. */
export interface ProjectDraft {
  title: string
  question: string
  field: string
  kind: ProjectKind
  files: ProjectDraftFile[]
  enabledTools: string[]
  standardsTemplate: StandardsTemplate
  /** The project's SOUL.md. Null until the Standards step first opens. */
  soulContent: string | null
  /** The project's MEMORY.md. Null until the Standards step first opens. */
  memoryContent: string | null
}

/** Payload sent to the backend to create a project. */
export interface CreateResearchProjectPayload {
  title: string
  question: string
  field: string
  kind: ProjectKind
  enabledTools: string[]
  standardsTemplate: StandardsTemplate
  /** Source-file metadata to attach on create. */
  sources?: CreateProjectSourceInput[]
  /** The SOUL.md built in the Standards step. */
  soulContent?: string
  /** The project's MEMORY.md entries, e.g. "Exclude: radiology triage". */
  projectMemory?: string[]
}

/** Editable project fields for `PATCH /api/research/projects/{id}/`. */
export type UpdateResearchProjectPayload = Partial<
  Omit<
    CreateResearchProjectPayload,
    'sources' | 'soulContent' | 'projectMemory'
  >
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
  /** The run open on the run-details page (fetched + polled via thunks). */
  currentRun: AgentRunDetail | null
  okfBundle: OkfBundle | null
  okfBundleLoading: boolean
  okfBundleError: string | null
  thesisSourceLinks: Record<number, ThesisSourceLink[]>
  thesisSourceLinksLoading: boolean
  thesisSourceLinksError: string | null
}

/** Result of a delegated agent run kickoff (poll the run for status). */
export interface ScoutResult {
  runId: number
  status: string
}

/** A typed thesis → source link backing the OKF "Supported by / Disputed by" sections. */
export interface ThesisSourceLink {
  sourceId: number
  stance: string
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
