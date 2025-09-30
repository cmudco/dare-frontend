import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  getWorkflows,
  getWorkflowById,
  createOrUpdateWorkflow,
  deleteWorkflow,
  startWorkflowRun,
  getWorkflowRunById,
} from './asyncThunks/workflow'
import { initialState } from './initialState/workflow'
import { WorkflowRun } from './types/workflow'
import { type Node, type Edge } from '@xyflow/react'

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
    setSelectedWorkflowRun: (
      state,
      action: PayloadAction<WorkflowRun | null>
    ) => {
      state.selectedWorkflowRun = action.payload
    },
    clearWorkflowError: (state) => {
      state.error = null
    },
    // LEGACY MODAL ACTIONS - COMMENTED OUT
    /*
    openModal: (state) => {
      state.selectedWorkflow = null
      state.tempSteps = []
      state.isModalOpen = true
    },
    openEditModal: (state, action: PayloadAction<number>) => {
      state.isModalOpen = true
      state.selectedWorkflow =
        state.workflows.find((workflow) => workflow.id === action.payload) ||
        null
    },
    closeModal: (state) => {
      state.isModalOpen = false
      state.selectedWorkflow = null
    },
    */
    setNodes: (state, action: PayloadAction<Node[]>) => {
      if (state.selectedWorkflow) {
        state.selectedWorkflow.nodes = action.payload
      }
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      if (state.selectedWorkflow) {
        state.selectedWorkflow.edges = action.payload
      }
    },
    selectWorkflowForView: (
      state,
      action: PayloadAction<{ workflowId: number; mode: 'run' | 'view' }>
    ) => {
      const { workflowId, mode } = action.payload
      const workflow = state.workflows.find((w) => w.id === workflowId)
      if (workflow) {
        state.selectedWorkflow = workflow
        if (mode === 'view' && workflow.latestRun) {
          state.selectedWorkflowRun = workflow.latestRun
        } else if (mode === 'view' && !workflow.latestRun) {
          state.selectedWorkflowRun = null
        }
      }
    },
    setSavedNodeIds: (state, action: PayloadAction<string[]>) => {
      state.savedNodeIds = action.payload
    },
    setTempNodes: (state, action: PayloadAction<Node[]>) => {
      state.tempNodes = action.payload
    },
    setTempEdges: (state, action: PayloadAction<Edge[]>) => {
      state.tempEdges = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWorkflows.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWorkflows.fulfilled, (state, action) => {
        state.loading = false
        state.workflows = action.payload
      })
      .addCase(getWorkflows.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getWorkflowById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWorkflowById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedWorkflow = action.payload
      })
      .addCase(getWorkflowById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createOrUpdateWorkflow.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrUpdateWorkflow.fulfilled, (state, action) => {
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
        // Clear any selected run after save so unrelated polling stops
        state.selectedWorkflowRun = null
      })
      .addCase(createOrUpdateWorkflow.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteWorkflow.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.loading = false
        const deletedWorkflowId = action.payload
        state.workflows = state.workflows.filter(
          (workflow) => workflow.id !== deletedWorkflowId
        )
        if (state.selectedWorkflow?.id === deletedWorkflowId) {
          state.selectedWorkflow = null
        }
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(startWorkflowRun.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startWorkflowRun.fulfilled, (state, action) => {
        state.loading = false
        const newRun = action.payload
        const existingRunIndex = state.workflowRuns.findIndex(
          (run) => run.id === newRun.id
        )
        if (existingRunIndex !== -1) {
          state.workflowRuns[existingRunIndex] = newRun
        } else {
          state.workflowRuns.push(newRun)
        }
        state.selectedWorkflowRun = newRun
        const workflow = state.workflows.find((w) => w.id === newRun.workflow)
        if (workflow) {
          workflow.latestRun = newRun
          workflow.lastRunId = newRun.id
        }
      })
      .addCase(startWorkflowRun.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getWorkflowRunById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWorkflowRunById.fulfilled, (state, action) => {
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
      .addCase(getWorkflowRunById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearSelectedWorkflow,
  clearSelectedWorkflowRun,
  setSelectedWorkflowRun,
  clearWorkflowError,
  // LEGACY MODAL ACTIONS - COMMENTED OUT
  // openModal,
  // openEditModal,
  // closeModal,
  setNodes,
  setEdges,
  selectWorkflowForView,
  setSavedNodeIds,
  setTempNodes,
  setTempEdges,
} = workflowSlice.actions

export default workflowSlice.reducer
