import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  getWorkflows,
  getWorkflowById,
  createOrUpdateWorkflow,
  deleteWorkflow,
} from './asyncThunks/workflow'
import { initialState } from './initialState/workflow'
import { Step } from './types/workflow'

const workflowSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    clearSelectedWorkflow: (state) => {
      state.selectedWorkflow = null
    },
    clearWorkflowError: (state) => {
      state.error = null
    },
    openModal: (state) => {
      state.isModalOpen = true
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.isModalOpen = true
      state.selectedWorkflow =
        state.workflows.find((workflow) => workflow.id === action.payload) ||
        null
    },
    closeModal: (state) => {
      state.isModalOpen = false
      state.selectedWorkflow = null
    },
    setSteps: (state, action: PayloadAction<Step[]>) => {
      if (state.selectedWorkflow) {
        if (state.selectedWorkflow.steps) {
          state.selectedWorkflow.steps = action.payload
        } else if (state.selectedWorkflow.steps) {
          state.selectedWorkflow.steps = action.payload
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkflows.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getWorkflows.fulfilled, (state, action) => {
      state.loading = false
      state.workflows = action.payload
    })
    builder.addCase(getWorkflows.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(getWorkflowById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getWorkflowById.fulfilled, (state, action) => {
      state.loading = false
      state.selectedWorkflow = action.payload
    })
    builder.addCase(getWorkflowById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(createOrUpdateWorkflow.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createOrUpdateWorkflow.fulfilled, (state, action) => {
      state.loading = false
      const updatedWorkflow = action.payload
      const index = state.workflows.findIndex(
        (workflow) => workflow.id === updatedWorkflow.id
      )
      if (index !== -1) {
        state.workflows[index] = updatedWorkflow
      } else {
        state.workflows.push(updatedWorkflow)
      }
      state.selectedWorkflow = updatedWorkflow
    })
    builder.addCase(createOrUpdateWorkflow.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(deleteWorkflow.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteWorkflow.fulfilled, (state, action) => {
      state.loading = false
      const deletedWorkflowId = action.payload
      state.workflows = state.workflows.filter(
        (workflow) => workflow.id !== deletedWorkflowId
      )
      if (state.selectedWorkflow?.id === deletedWorkflowId) {
        state.selectedWorkflow = null
      }
    })
    builder.addCase(deleteWorkflow.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const {
  clearSelectedWorkflow,
  clearWorkflowError,
  openModal,
  openEditModal,
  closeModal,
  setSteps,
} = workflowSlice.actions

export default workflowSlice.reducer
