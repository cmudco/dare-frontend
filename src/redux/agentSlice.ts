import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from './initialState/agent'
import {
  getAgents,
  getAgentById,
  createOrUpdateAgent,
  deleteAgent,
  cloneAgent,
} from './asyncThunks/agent'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { sortAgents as sortAgentsList } from '@/utils/agentUtils'

const agentSlice = createSlice({
  name: 'agents',
  initialState: {
    ...initialState,
    isModalOpen: false,
  },
  reducers: {
    clearSelectedAgent: (state) => {
      state.selectedAgent = null
    },
    clearAgentError: (state) => {
      state.error = null
    },
    openModal: (state) => {
      state.isModalOpen = true
    },
    openEditModal: (state, action: PayloadAction<number>) => {
      state.isModalOpen = true
      state.selectedAgent =
        state.agents.find((agent) => agent.id === action.payload) || null
    },
    closeModal: (state) => {
      state.isModalOpen = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAgents.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getAgents.fulfilled, (state, action) => {
      state.loading = false
      state.agents = sortAgentsList(
        action.payload,
        null,
        SortDirectionEnum.DESC
      )
    })
    builder.addCase(getAgents.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(getAgentById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getAgentById.fulfilled, (state, action) => {
      state.loading = false
      state.selectedAgent = action.payload
    })
    builder.addCase(getAgentById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
    builder.addCase(createOrUpdateAgent.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createOrUpdateAgent.fulfilled, (state, action) => {
      state.loading = false
      const updatedAgent = action.payload

      const index = state.agents.findIndex(
        (agent) => agent.id === updatedAgent.id
      )

      if (index !== -1) {
        state.agents[index] = updatedAgent
      } else {
        state.agents.push(updatedAgent)
      }

      state.agents = sortAgentsList(state.agents, null, SortDirectionEnum.DESC)

      if (state.selectedAgent?.id === updatedAgent.id) {
        state.selectedAgent = updatedAgent
      }
    })
    builder.addCase(createOrUpdateAgent.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
    builder.addCase(cloneAgent.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(cloneAgent.fulfilled, (state, action) => {
      state.loading = false
      const clonedAgent = action.payload
      state.agents.push(clonedAgent)
      state.agents = sortAgentsList(state.agents, null, SortDirectionEnum.DESC)
    })
    builder.addCase(cloneAgent.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
    builder.addCase(deleteAgent.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteAgent.fulfilled, (state, action) => {
      state.loading = false
      // The server deletes the agent with every later version derived from it.
      const deleted = new Set([action.payload])
      let grew = true
      while (grew) {
        grew = false
        for (const agent of state.agents) {
          if (
            agent.parent &&
            deleted.has(agent.parent) &&
            !deleted.has(agent.id)
          ) {
            deleted.add(agent.id)
            grew = true
          }
        }
      }
      state.agents = state.agents.filter((agent) => !deleted.has(agent.id))
      if (state.selectedAgent && deleted.has(state.selectedAgent.id)) {
        state.selectedAgent = null
      }
    })
    builder.addCase(deleteAgent.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const {
  clearSelectedAgent,
  clearAgentError,
  openModal,
  openEditModal,
  closeModal,
} = agentSlice.actions

export default agentSlice.reducer
