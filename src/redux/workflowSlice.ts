// redux/workflowSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkflowState, Step } from "./types/workflow"; // Adjust path as needed
import {
  getWorkflows,
  getWorkflowById,
  createOrUpdateWorkflow,
  deleteWorkflow,
  updateStep,
  deleteStep,
  createStep,
} from "./asyncThunks/workflow";
import { initialState } from "./initialState/workflow";



const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    clearSelectedWorkflow: (state) => {
      state.selectedWorkflow = null;
      state.savedStepIds = [];
      state.tempSteps = [];
    },
    clearWorkflowError: (state) => {
      state.error = null;
    },
    openModal: (state) => {
      state.isModalOpen = true;
      state.tempSteps = [];
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.isModalOpen = true;
      state.selectedWorkflow =
        state.workflows.find((workflow) => workflow.id === action.payload) || null;
      state.savedStepIds = (
        state.selectedWorkflow?.steps || state.selectedWorkflow?.stepsDetail || []
      ).map((step) => step.id!);
      state.tempSteps = (
        state.selectedWorkflow?.steps || state.selectedWorkflow?.stepsDetail || []
      ).map((step) => ({
        id: step.id,
        prompt: step.prompt, // Already a Prompt object from the API
        order: step.order,
      }));
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.savedStepIds = [];
      state.tempSteps = [];
    },
    addTempStep: (state) => {
      const newOrder =
        state.tempSteps.length > 0
          ? Math.max(...state.tempSteps.map((s) => s.order)) + 1
          : 1;
      state.tempSteps.push({ prompt: null, order: newOrder }); // Initialize prompt as null
    },
    updateTempStep: (
      state,
      action: PayloadAction<{ index: number; field: string; value: any }>
    ) => {
      const { index, field, value } = action.payload;
      state.tempSteps[index] = { ...state.tempSteps[index], [field]: value };
    },
    removeTempStep: (state, action: PayloadAction<number>) => {
      state.tempSteps.splice(action.payload, 1);
    },
    moveTempStep: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const [movedStep] = state.tempSteps.splice(from, 1);
      state.tempSteps.splice(to, 0, movedStep);
    },
    saveStepId: (state, action: PayloadAction<string>) => {
      if (!state.savedStepIds.includes(action.payload)) {
        state.savedStepIds.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkflows.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getWorkflows.fulfilled, (state, action) => {
      state.loading = false;
      state.workflows = action.payload;
    });
    builder.addCase(getWorkflows.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(getWorkflowById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getWorkflowById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedWorkflow = action.payload;
    });
    builder.addCase(getWorkflowById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createOrUpdateWorkflow.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createOrUpdateWorkflow.fulfilled, (state, action) => {
      state.loading = false;
      const updatedWorkflow = action.payload;
      const index = state.workflows.findIndex(
        (workflow) => workflow.id === updatedWorkflow.id
      );
      if (index !== -1) {
        state.workflows[index] = updatedWorkflow;
      } else {
        state.workflows.push(updatedWorkflow);
      }
      if (state.selectedWorkflow?.id === updatedWorkflow.id) {
        state.selectedWorkflow = updatedWorkflow;
      }
      state.savedStepIds = [];
      state.tempSteps = [];
    });
    builder.addCase(createOrUpdateWorkflow.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteWorkflow.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteWorkflow.fulfilled, (state, action) => {
      state.loading = false;
      const deletedWorkflowId = action.payload;
      state.workflows = state.workflows.filter(
        (workflow) => workflow.id !== deletedWorkflowId
      );
      if (state.selectedWorkflow?.id === deletedWorkflowId) {
        state.selectedWorkflow = null;
      }
    });
    builder.addCase(deleteWorkflow.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createStep.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createStep.fulfilled, (state, action) => {
      state.loading = false;
      const newStep = action.payload;
      state.savedStepIds.push(newStep.id!);
      const stepIndex = state.tempSteps.findIndex(
        (s) => s.order === newStep.order && !s.id
      );
      if (stepIndex !== -1) {
        state.tempSteps[stepIndex] = newStep; // Replace with full step object
      }
    });
    builder.addCase(createStep.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateStep.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStep.fulfilled, (state, action) => {
      state.loading = false;
      const updatedStep = action.payload;
      state.workflows.forEach((workflow) => {
        if (workflow.steps) {
          const stepIndex = workflow.steps.findIndex((s) => s.id === updatedStep.id);
          if (stepIndex !== -1) workflow.steps[stepIndex] = updatedStep;
        }
        if (workflow.stepsDetail) {
          const stepDetailIndex = workflow.stepsDetail.findIndex(
            (s) => s.id === updatedStep.id
          );
          if (stepDetailIndex !== -1) workflow.stepsDetail[stepDetailIndex] = updatedStep;
        }
      });
      if (state.selectedWorkflow) {
        if (state.selectedWorkflow.steps) {
          const stepIndex = state.selectedWorkflow.steps.findIndex(
            (s) => s.id === updatedStep.id
          );
          if (stepIndex !== -1) state.selectedWorkflow.steps[stepIndex] = updatedStep;
        }
        if (state.selectedWorkflow.stepsDetail) {
          const stepDetailIndex = state.selectedWorkflow.stepsDetail.findIndex(
            (s) => s.id === updatedStep.id
          );
          if (stepDetailIndex !== -1)
            state.selectedWorkflow.stepsDetail[stepDetailIndex] = updatedStep;
        }
      }
      const tempStepIndex = state.tempSteps.findIndex((s) => s.id === updatedStep.id);
      if (tempStepIndex !== -1) {
        state.tempSteps[tempStepIndex] = updatedStep;
      }
    });
    builder.addCase(updateStep.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteStep.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteStep.fulfilled, (state, action) => {
      state.loading = false;
      const { stepId } = action.payload;
      state.savedStepIds = state.savedStepIds.filter((id) => id !== stepId);
      state.tempSteps = state.tempSteps.filter((step) => step.id !== stepId);
      state.workflows.forEach((workflow) => {
        if (workflow.steps) workflow.steps = workflow.steps.filter((s) => s.id !== stepId);
        if (workflow.stepsDetail)
          workflow.stepsDetail = workflow.stepsDetail.filter((s) => s.id !== stepId);
      });
      if (state.selectedWorkflow) {
        if (state.selectedWorkflow.steps)
          state.selectedWorkflow.steps = state.selectedWorkflow.steps.filter(
            (s) => s.id !== stepId
          );
        if (state.selectedWorkflow.stepsDetail)
          state.selectedWorkflow.stepsDetail =
            state.selectedWorkflow.stepsDetail.filter((s) => s.id !== stepId);
      }
    });
    builder.addCase(deleteStep.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearSelectedWorkflow,
  clearWorkflowError,
  openModal,
  openEditModal,
  closeModal,
  addTempStep,
  updateTempStep,
  removeTempStep,
  moveTempStep,
  saveStepId,
} = workflowSlice.actions;

export default workflowSlice.reducer;