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

/** Payload sent to the backend to create a project (files are uploaded separately). */
export interface CreateResearchProjectPayload {
  title: string
  question: string
  field: string
  enabledTools: string[]
  standardsTemplate: StandardsTemplate
}

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
