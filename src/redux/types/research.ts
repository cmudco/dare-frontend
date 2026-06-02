import {
  ResearchProjectStatus,
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

/**
 * A research project — the container for one line of inquiry. A scholar can
 * run several. Counts are denormalised summaries for the project list; the
 * full workspace lives behind the detail route. Maps to the backend
 * `camelCase` response when wired.
 */
export interface ResearchProject {
  id: string
  title: string
  question: string
  field: string
  status: ResearchProjectStatus
  enabledTools: ResearchTool[]
  standardsTemplate: StandardsTemplate
  pendingReviewCount: number
  approvedCount: number
  sourceCount: number
  updatedAt: string
  createdAt: string
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

export interface ResearchState {
  projects: ResearchProject[]
}
