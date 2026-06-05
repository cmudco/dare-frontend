import {
  ResearchAgentOutputDestination,
  ResearchAgentRole,
  ResearchAgentRunStatus,
  ResearchAgentToolCallStatus,
  ResearchEvidenceLabel,
  ResearchProjectStatus,
  ResearchReviewStatus,
  ResearchSourceKind,
  ResearchStagingItemType,
  ResearchTool,
  StandardsTemplate,
} from '@/utils/constants/research'

/** A source file brought into a project (staged client-side in the prototype). */
export interface ProjectDraftFile {
  id: string
  name: string
  sizeLabel: string
  kind: string
}

export interface ResearchProject {
  id: number
  title: string
  question: string
  field: string
  status: ResearchProjectStatus
  enabledTools: ResearchTool[]
  standardsTemplate: StandardsTemplate
  activeSoulFile: number | null
  activeSoulFileVersion: number | null
  activeSoulFileTitle: string
  activeSoulFileVersionNumber: number | null
  pendingReviewCount: number
  approvedCount: number
  sourceCount: number
  updatedAt: string
  createdAt: string
}

export interface ResearchSource {
  id: number
  project: number
  kind: ResearchSourceKind
  title: string
  citation: string
  url: string
  doi: string
  authors: string
  venue: string
  year: number | null
  abstract: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ResearchSourceDraft {
  kind: ResearchSourceKind
  title: string
  citation?: string
  url?: string
  doi?: string
  authors?: string
  venue?: string
  year?: number | null
  abstract?: string
  notes?: string
}

export interface ResearchProvenance {
  tool?: string
  query?: string
  retrievedAt?: string
  retrievalDepth?: string
  role?: string
  runId?: string
}

export interface ResearchRunSelectedContext {
  knowledgeItemIds: number[]
  stagingItemIds: number[]
  sourceIds: number[]
  conversationIds: string[]
  notes: string
}

export interface ResearchRunCapabilityPolicy {
  canCreateStaging: boolean
  canUpdateReviewMetadata: boolean
  canProposeMemory: boolean
  canProposeArtifacts: boolean
  canApproveKnowledge: boolean
}

export interface ResearchAgentToolCall {
  id: number
  run: number
  toolName: string
  status: ResearchAgentToolCallStatus
  inputSummary: string
  outputSummary: string
  errorMessage: string
  costUsd: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ResearchAgentRun {
  id: number
  runId: string
  project: number
  role: ResearchAgentRole
  status: ResearchAgentRunStatus
  task: string
  selectedContext: ResearchRunSelectedContext
  allowedTools: ResearchTool[]
  capabilityPolicy: ResearchRunCapabilityPolicy
  outputDestination: ResearchAgentOutputDestination
  soulFileVersion: number | null
  soulFileTitle: string
  soulFileVersionNumber: number | null
  externalRunId: string
  statusMessage: string
  errorMessage: string
  costUsd: string
  queuedAt: string
  startedAt: string | null
  completedAt: string | null
  toolCalls: ResearchAgentToolCall[]
  createdAt: string
  updatedAt: string
}

export interface ResearchAgentRunDraft {
  project: number
  role: ResearchAgentRole
  task: string
  selectedContext?: ResearchRunSelectedContext
  allowedTools?: ResearchTool[]
  outputDestination?: ResearchAgentOutputDestination
}

export interface ResearchStagingItem {
  id: number
  project: number
  source: number | null
  soulFileVersion: number | null
  soulFileTitle: string
  soulFileVersionNumber: number | null
  itemType: ResearchStagingItemType
  title: string
  authors: string
  venue: string
  year: number | null
  url: string
  doi: string
  content: string
  rationale: string
  confidence: number
  confidenceRationale: string
  evidenceLabel: ResearchEvidenceLabel
  citationContext: string
  provenance: ResearchProvenance
  status: ResearchReviewStatus
  rejectionReason: string
  laterReason: string
  reviewedBy: number | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ResearchStagingItemDraft {
  project: number
  source?: number | null
  itemType: ResearchStagingItemType
  title: string
  authors?: string
  venue?: string
  year?: number | null
  url?: string
  doi?: string
  content?: string
  rationale?: string
  confidence?: number
  confidenceRationale?: string
  evidenceLabel?: ResearchEvidenceLabel
  citationContext?: string
  provenance?: ResearchProvenance
}

export interface ResearchKnowledgeItem {
  id: number
  project: number
  stagingItem: number
  source: number | null
  soulFileVersion: number | null
  soulFileTitle: string
  soulFileVersionNumber: number | null
  title: string
  authors: string
  venue: string
  year: number | null
  url: string
  doi: string
  content: string
  rationale: string
  confidence: number
  confidenceRationale: string
  evidenceLabel: ResearchEvidenceLabel
  citationContext: string
  provenance: ResearchProvenance
  approvedBy: number
  approvedAt: string
  createdAt: string
  updatedAt: string
}

export interface ResearchReviewResponse {
  stagingItem: ResearchStagingItem
  knowledgeItem: ResearchKnowledgeItem
}

export interface ResearchReviewReasonPayload {
  id: number
  reason: string
}

export interface ResearchSoulFileVersion {
  id: number
  soulFile: number
  versionNumber: number
  title: string
  description: string
  templateKey: StandardsTemplate
  body: string
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

export interface ResearchSoulFile {
  id: number
  title: string
  description: string
  templateKey: StandardsTemplate
  isDefault: boolean
  currentVersion: ResearchSoulFileVersion | null
  versionCount: number
  createdAt: string
  updatedAt: string
}

export interface ResearchSoulFileDraft {
  title: string
  description?: string
  templateKey: StandardsTemplate
  body: string
  isDefault?: boolean
}

export interface ResearchSoulFileUpdateMutation {
  id: number
  soulFile: ResearchSoulFileDraft
}

export interface ResearchProjectSoulFileSelection {
  projectId: number
  soulFileId: number
}

/** Working state for the create/edit wizard before it becomes a project. */
export interface ProjectDraft {
  title: string
  question: string
  field: string
  files: ProjectDraftFile[]
  enabledTools: ResearchTool[]
  standardsTemplate: StandardsTemplate
}

export interface ResearchProjectPayload {
  title: string
  question: string
  field: string
  enabledTools: ResearchTool[]
  standardsTemplate: StandardsTemplate
}

export interface ResearchProjectMutation {
  project: ResearchProjectPayload
  sources: ResearchSourceDraft[]
}

export interface ResearchProjectUpdateMutation extends ResearchProjectMutation {
  id: number
}

export interface ResearchRoleMetadata {
  key: string
  name: string
  status: string
  description: string
}

export interface ResearchRuntimeMetadata {
  key: string
  status: string
  message: string
}

export interface ResearchSoulFileTemplateMetadata {
  key: StandardsTemplate
  name: string
  description: string
  body: string
}

export interface ResearchMetadata {
  roles: ResearchRoleMetadata[]
  runtime: ResearchRuntimeMetadata
  soulFileTemplates: ResearchSoulFileTemplateMetadata[]
}

export interface PaginatedResearchResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ResearchState {
  projects: ResearchProject[]
  sources: ResearchSource[]
  stagingItems: ResearchStagingItem[]
  knowledgeItems: ResearchKnowledgeItem[]
  agentRuns: ResearchAgentRun[]
  soulFiles: ResearchSoulFile[]
  soulFileVersions: ResearchSoulFileVersion[]
  metadata: ResearchMetadata | null
  isLoading: boolean
  isLoadingRuns: boolean
  isSaving: boolean
  isReviewing: boolean
  isSavingSoulFile: boolean
  error: string | null
  hasLoadedProjects: boolean
}
