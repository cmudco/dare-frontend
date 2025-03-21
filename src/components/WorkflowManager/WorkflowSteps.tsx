// WorkflowSteps.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
    addTempStep,
    removeTempStep,
    moveTempStep,
    updateTempStep,
    saveStepId,
} from "../../redux/workflowSlice";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { WorkflowStep } from "./WorkflowStep";
import { useAppSelector } from "@/redux/hooks";

const WorkflowSteps: React.FC = () => {
    const dispatch = useDispatch();
    const { tempSteps, savedStepIds } = useAppSelector(
        (state) => state.workflow
    );
    const prompts = useSelector((state: RootState) => state.prompt.prompts);
    const unsavedSteps = tempSteps.filter(
        (step) => !step.id || !savedStepIds.includes(step.id)
    ).length;

    return (
        <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(addTempStep())}
                    className="flex items-center"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                </Button>
                {unsavedSteps > 0 && (
                    <div className="text-amber-600 text-xs font-medium">
                        {unsavedSteps} unsaved step{unsavedSteps > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {tempSteps.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-md text-gray-500">
                        No steps added yet. Click "Add Step" to begin.
                    </div>
                ) : (
                    tempSteps.map((step, index) => (
                        <WorkflowStep
                            key={`step-${step.id || `new-${index}`}`}
                            index={index}
                            step={step}
                            prompts={prompts}
                            onRemove={() => dispatch(removeTempStep(index))}
                            onMove={(dir) => {
                                if (dir === "up" && index > 0) {
                                    dispatch(moveTempStep({ from: index, to: index - 1 }));
                                } else if (dir === "down" && index < tempSteps.length - 1) {
                                    dispatch(moveTempStep({ from: index, to: index + 1 }));
                                }
                            }}
                            onChange={(field, value) =>
                                dispatch(updateTempStep({ index, field, value }))
                            }
                            onStepSaved={(stepId) => dispatch(saveStepId(stepId))}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkflowSteps;