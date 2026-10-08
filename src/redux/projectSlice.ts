import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { RootState } from './store'
import type { Conversation } from './types/conversation'
import type { Project } from './types/project'
import {
  cloneConversation,
  createConversation,
  deleteConversation,
  deleteMultipleConversations,
} from './asyncThunks/conversation'
import {
  createProject,
  deleteProject,
  fetchProjectChats,
  fetchProjects,
  moveConversationsToProject,
  updateProject,
} from './asyncThunks/project'
import { userLogin, userLogout } from './asyncThunks/user'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ProjectChats {
  status: RequestStatus
  conversations: Conversation[]
}

interface ProjectState {
  projects: Project[]
  status: RequestStatus
  error: string | null
  /** Each project's chats, fetched by project so none fall off the main list's page. */
  chats: Record<number, ProjectChats>
}

const initialState: ProjectState = {
  projects: [],
  status: 'idle',
  error: null,
  chats: {},
}

const upsert = (state: ProjectState, project: Project) => {
  const index = state.projects.findIndex((p) => p.id === project.id)
  if (index === -1) {
    state.projects.unshift(project)
  } else {
    state.projects[index] = project
  }
}

const dropChats = (state: ProjectState, conversationIds: string[]) => {
  Object.values(state.chats).forEach((chats) => {
    chats.conversations = chats.conversations.filter(
      (conversation) => !conversationIds.includes(conversation.conversationId)
    )
  })
}

const placeChat = (state: ProjectState, conversation: Conversation) => {
  dropChats(state, [conversation.conversationId])
  if (conversation.project !== null) {
    state.chats[conversation.project]?.conversations.unshift(conversation)
  }
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Projects are per account; the next user must never see the last one's.
      .addCase(userLogout.pending, () => initialState)
      .addCase(userLogin.pending, () => initialState)
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Could not load projects.'
      })
      .addCase(createProject.fulfilled, (state, action) => {
        upsert(state, action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        upsert(state, action.payload)
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload.projectId
        )
        delete state.chats[action.payload.projectId]
      })
      .addCase(fetchProjectChats.pending, (state, action) => {
        const projectId = action.meta.arg
        state.chats[projectId] = {
          status: 'loading',
          conversations: state.chats[projectId]?.conversations ?? [],
        }
      })
      .addCase(fetchProjectChats.fulfilled, (state, action) => {
        state.chats[action.meta.arg] = {
          status: 'succeeded',
          conversations: action.payload,
        }
      })
      .addCase(fetchProjectChats.rejected, (state, action) => {
        const chats = state.chats[action.meta.arg]
        if (chats) chats.status = 'failed'
      })
      .addCase(moveConversationsToProject.fulfilled, (state, action) => {
        action.payload.moved.forEach((conversation) =>
          placeChat(state, conversation)
        )
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        placeChat(state, action.payload)
      })
      .addCase(cloneConversation.fulfilled, (state, action) => {
        placeChat(state, action.payload)
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        dropChats(state, [action.payload])
      })
      .addCase(deleteMultipleConversations.fulfilled, (state, action) => {
        dropChats(state, action.payload)
      })
  },
})

export const selectProjects = (state: RootState) => state.project.projects
export const selectProjectsStatus = (state: RootState) => state.project.status
export const selectProjectsError = (state: RootState) => state.project.error

export const selectProjectById = createSelector(
  [
    selectProjects,
    (_: RootState, projectId: number | null | undefined) => projectId,
  ],
  (projects, projectId) =>
    projectId == null
      ? undefined
      : projects.find((project) => project.id === projectId)
)

export const selectProjectChats = (
  state: RootState,
  projectId: number
): ProjectChats | undefined => state.project.chats[projectId]

export default projectSlice.reducer
