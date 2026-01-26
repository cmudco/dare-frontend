import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  getWorkflows,
  getWorkflowById,
  createOrUpdateWorkflow,
  deleteWorkflow,
  getWorkflowRunById,
  updateWorkflowDisplayOrder,
} from './asyncThunks/workflow'
import { initialState } from './initialState/workflow'
import { type Node, type Edge } from '@xyflow/react'

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
    setSavedNodeIds: (state, action: PayloadAction<string[]>) => {
      state.savedNodeIds = action.payload
    },
    setTempNodes: (state, action: PayloadAction<Node[]>) => {
      state.tempNodes = action.payload
    },
    setTempEdges: (state, action: PayloadAction<Edge[]>) => {
      state.tempEdges = action.payload
    },
    updateWorkflowOrder: (state, action: PayloadAction<number[]>) => {
      const orderedWorkflows: typeof state.workflows = []
      action.payload.forEach((workflowId, index) => {
        const workflow = state.workflows.find((w) => w.id === workflowId)
        if (workflow) {
          const updatedWorkflow = {
            ...workflow,
            displayOrder: (index + 1) * 10,
          }
          orderedWorkflows.push(updatedWorkflow)
        }
      })
      state.workflows = orderedWorkflows
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
      })
      .addCase(getWorkflowRunById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateWorkflowDisplayOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateWorkflowDisplayOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearSelectedWorkflow,
  clearWorkflowError,
  setNodes,
  setEdges,
  setSavedNodeIds,
  setTempNodes,
  setTempEdges,
  updateWorkflowOrder,
} = workflowSlice.actions

export default workflowSlice.reducer
