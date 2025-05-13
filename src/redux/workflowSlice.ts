import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  getWorkflows,
  getWorkflowById,
  createOrUpdateWorkflow,
  deleteWorkflow,
  startWorkflowRun,
  getWorkflowRunById,
  getWorkflowRuns,
  getLatestWorkflowRun,
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
    clearSelectedWorkflowRun: (state) => {
      state.selectedWorkflowRun = null
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
        state.selectedWorkflow.steps = action.payload
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

    builder.addCase(startWorkflowRun.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(startWorkflowRun.fulfilled, (state, action) => {
      state.loading = false
      state.workflowRuns.push(action.payload)
      state.selectedWorkflowRun = action.payload
    })
    builder.addCase(startWorkflowRun.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(getWorkflowRunById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getWorkflowRunById.fulfilled, (state, action) => {
      state.loading = false
      const updatedRun = action.payload
      const index = state.workflowRuns.findIndex(
        (run) => run.id === updatedRun.id
      )
      if (index !== -1) {
        state.workflowRuns[index] = updatedRun
      } else {
        state.workflowRuns.push(updatedRun)
      }
      state.selectedWorkflowRun = updatedRun
    })
    builder.addCase(getWorkflowRunById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(getWorkflowRuns.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getWorkflowRuns.fulfilled, (state, action) => {
      state.loading = false
      state.workflowRuns = action.payload
    })
    builder.addCase(getWorkflowRuns.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(getLatestWorkflowRun.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getLatestWorkflowRun.fulfilled, (state, action) => {
      state.loading = false

      if (action.payload.run) {
        const workflowIndex = state.workflows.findIndex(
          (workflow) => workflow.id === action.payload.workflowId
        )

        if (workflowIndex !== -1) {
          state.workflows[workflowIndex].lastRunId = action.payload.run.id
        }

        const runExists = state.workflowRuns.some(
          (run) => run.id === action.payload.run?.id
        )
        if (!runExists && action.payload.run) {
          state.workflowRuns.push(action.payload.run)
        }
      }
    })
    builder.addCase(getLatestWorkflowRun.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const {
  clearSelectedWorkflow,
  clearSelectedWorkflowRun,
  clearWorkflowError,
  openModal,
  openEditModal,
  closeModal,
  setSteps,
} = workflowSlice.actions

export default workflowSlice.reducer
