import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/workflow";
import {
    getWorkflows,
    getWorkflowById,
    createOrUpdateWorkflow,
    deleteWorkflow,
    updateStep,
    deleteStep,
    createStep,
} from "./asyncThunks/workflow";

const workflowSlice = createSlice({
    name: "workflows",
    initialState,
    reducers: {
        clearSelectedWorkflow: (state) => {
            state.selectedWorkflow = null;
        },
        clearWorkflowError: (state) => {
            state.error = null;
        },
        openModal: (state) => {
            state.isModalOpen = true;
        },
        openEditModal: (state, action: PayloadAction<string>) => {
            state.isModalOpen = true;
            state.selectedWorkflow =
                state.workflows.find(
                    (workflow) => workflow.id === action.payload
                ) || null;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
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
                if (workflow.steps && Array.isArray(workflow.steps)) {
                    const stepIndex = workflow.steps.findIndex(
                        (s) => s.id === updatedStep.id
                    );
                    if (stepIndex !== -1) {
                        workflow.steps[stepIndex] = updatedStep;
                    }
                }

                if (
                    workflow.stepsDetail &&
                    Array.isArray(workflow.stepsDetail)
                ) {
                    const stepDetailIndex = workflow.stepsDetail.findIndex(
                        (s) => s.id === updatedStep.id
                    );
                    if (stepDetailIndex !== -1) {
                        workflow.stepsDetail[stepDetailIndex] = updatedStep;
                    }
                }
            });

            if (state.selectedWorkflow) {
                if (
                    state.selectedWorkflow.steps &&
                    Array.isArray(state.selectedWorkflow.steps)
                ) {
                    const stepIndex = state.selectedWorkflow.steps.findIndex(
                        (s) => s.id === updatedStep.id
                    );
                    if (stepIndex !== -1) {
                        state.selectedWorkflow.steps[stepIndex] = updatedStep;
                    }
                }

                if (
                    state.selectedWorkflow.stepsDetail &&
                    Array.isArray(state.selectedWorkflow.stepsDetail)
                ) {
                    const stepDetailIndex =
                        state.selectedWorkflow.stepsDetail.findIndex(
                            (s) => s.id === updatedStep.id
                        );
                    if (stepDetailIndex !== -1) {
                        state.selectedWorkflow.stepsDetail[stepDetailIndex] =
                            updatedStep;
                    }
                }
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

            state.workflows.forEach((workflow) => {
                if (workflow.steps && Array.isArray(workflow.steps)) {
                    workflow.steps = workflow.steps.filter(
                        (s) => s.id !== stepId
                    );
                }

                if (
                    workflow.stepsDetail &&
                    Array.isArray(workflow.stepsDetail)
                ) {
                    workflow.stepsDetail = workflow.stepsDetail.filter(
                        (s) => s.id !== stepId
                    );
                }
            });

            if (state.selectedWorkflow) {
                if (
                    state.selectedWorkflow.steps &&
                    Array.isArray(state.selectedWorkflow.steps)
                ) {
                    state.selectedWorkflow.steps =
                        state.selectedWorkflow.steps.filter(
                            (s) => s.id !== stepId
                        );
                }

                if (
                    state.selectedWorkflow.stepsDetail &&
                    Array.isArray(state.selectedWorkflow.stepsDetail)
                ) {
                    state.selectedWorkflow.stepsDetail =
                        state.selectedWorkflow.stepsDetail.filter(
                            (s) => s.id !== stepId
                        );
                }
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
} = workflowSlice.actions;

export default workflowSlice.reducer;
