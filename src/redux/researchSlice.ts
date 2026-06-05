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
    id: 'nordic-model',
    title: 'What Makes the Nordic Model Work',
    question:
      'When does the Nordic high-tax, high-trust model produce strong outcomes — and which parts actually transfer to other economies?',
    field: 'Political Economy',
    status: ResearchProjectStatus.ACTIVE,
    enabledTools: [
      ResearchTool.CONSENSUS,
      ResearchTool.SCITE,
      ResearchTool.WEB,
    ],
    standardsTemplate: StandardsTemplate.RESEARCH_ETHICS,
    pendingReviewCount: 0,
    approvedCount: 1,
    sourceCount: 3,
    updatedAt: 'Updated 2 days ago',
    createdAt: 'Created last month',
  },
  {
    id: 'dev-productivity-flow',
    title: 'AI Coding Assistants & Developer Flow',
    question:
      'Do AI coding assistants and flow-state practices actually raise sustained developer productivity?',
    field: 'Software Engineering · Productivity',
    status: ResearchProjectStatus.ACTIVE,
    enabledTools: [
      ResearchTool.SCITE,
      ResearchTool.CONSENSUS,
      ResearchTool.WEB,
    ],
    standardsTemplate: StandardsTemplate.EMPIRICAL_RIGOR,
    pendingReviewCount: 3,
    approvedCount: 5,
    sourceCount: 9,
    updatedAt: 'Updated yesterday',
    createdAt: 'Created 2 weeks ago',
  },
  {
    id: 'proportional-representation',
    title: 'Does Proportional Representation Improve Governance?',
    question:
      'Do proportional-representation electoral systems produce more representative and stable governance than first-past-the-post?',
    field: 'Political Science',
    status: ResearchProjectStatus.ARCHIVED,
    enabledTools: [ResearchTool.WEB, ResearchTool.CONSENSUS],
    standardsTemplate: StandardsTemplate.EMPIRICAL_RIGOR,
    pendingReviewCount: 0,
    approvedCount: 14,
    sourceCount: 19,
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
