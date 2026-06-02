import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  ResearchProjectStatus,
  ResearchTool,
  StandardsTemplate,
} from '@/utils/constants/research'
import type { ResearchProject, ResearchState } from './types/research'

// Mock seed data for the prototype. Replaced by an async-thunk fetch once the
// backend exists (see the API integration cycle in docs/RULES.md). The first
// project matches the demo workspace rendered at the detail route.
const seedProjects: ResearchProject[] = [
  {
    id: 'distributed-governance',
    title: 'Distributed Governance in AI Research',
    question:
      'When does institutional oversight strengthen rather than compromise researcher autonomy in AI-enabled studies?',
    field: 'AI & Research Ethics',
    status: ResearchProjectStatus.ACTIVE,
    enabledTools: [
      ResearchTool.PUBMED,
      ResearchTool.SCITE,
      ResearchTool.CONSENSUS,
    ],
    standardsTemplate: StandardsTemplate.RESEARCH_ETHICS,
    pendingReviewCount: 0,
    approvedCount: 1,
    sourceCount: 3,
    updatedAt: 'Updated 2 days ago',
    createdAt: 'Created last month',
  },
  {
    id: 'informed-consent-llms',
    title: 'Informed Consent in LLM-Mediated Clinical Trials',
    question:
      'How should informed consent be re-conceived when a conversational model mediates trial enrollment?',
    field: 'Bioethics',
    status: ResearchProjectStatus.ACTIVE,
    enabledTools: [ResearchTool.PUBMED, ResearchTool.CONSENSUS],
    standardsTemplate: StandardsTemplate.RESEARCH_ETHICS,
    pendingReviewCount: 4,
    approvedCount: 7,
    sourceCount: 12,
    updatedAt: 'Updated yesterday',
    createdAt: 'Created 2 weeks ago',
  },
  {
    id: 'algorithmic-fairness-justice',
    title: 'Algorithmic Fairness and Theories of Justice',
    question:
      'Which conceptions of distributive justice are presupposed by common algorithmic fairness metrics?',
    field: 'Philosophy',
    status: ResearchProjectStatus.ARCHIVED,
    enabledTools: [ResearchTool.WEB],
    standardsTemplate: StandardsTemplate.EMPIRICAL_RIGOR,
    pendingReviewCount: 0,
    approvedCount: 23,
    sourceCount: 31,
    updatedAt: 'Updated last month',
    createdAt: 'Created 3 months ago',
  },
]

const initialState: ResearchState = {
  projects: seedProjects,
}

const researchSlice = createSlice({
  name: 'research',
  initialState,
  reducers: {
    addResearchProject(state, action: PayloadAction<ResearchProject>) {
      state.projects.unshift(action.payload)
    },
    updateResearchProject(state, action: PayloadAction<ResearchProject>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    deleteResearchProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
    },
  },
})

export const {
  addResearchProject,
  updateResearchProject,
  deleteResearchProject,
} = researchSlice.actions

export default researchSlice.reducer
