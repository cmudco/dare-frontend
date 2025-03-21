// WorkflowFooter.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { closeModal } from "../../redux/workflowSlice";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

interface WorkflowFooterProps {
  loading: boolean;
  isValid: boolean;
  dirty: boolean;
  unsavedSteps: number;
  stepsCount: number;
}

const WorkflowFooter: React.FC<WorkflowFooterProps> = ({
  loading,
  isValid,
  dirty,
  unsavedSteps,
  stepsCount,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <DialogFooter className="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => dispatch(closeModal())}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={
          !(isValid && dirty) || loading || unsavedSteps > 0 || stepsCount === 0
        }
      >
        {loading ? "Saving..." : "Save"}
      </Button>
    </DialogFooter>
  );
};

export default WorkflowFooter;