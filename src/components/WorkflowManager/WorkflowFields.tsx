// WorkflowFields.tsx
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { WORKFLOW_MODES } from "../../utils/constants/workflows";
import { ListOrdered, Layers, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";

interface WorkflowFieldsProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  isEditMode: boolean;
}

const WorkflowFields: React.FC<WorkflowFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  isEditMode,
}) => (
  <>
    <DialogHeader>
      <DialogTitle className="text-lg text-left font-semibold text-gray-900">
        {isEditMode ? "Edit Workflow" : "Create New Workflow"}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-500">
        {isEditMode
          ? "Update your workflow details and steps below."
          : "Create steps first, then save your workflow."}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        name="title"
        value={values.title}
        onChange={handleChange}
        placeholder="Enter workflow title"
        className={errors.title && touched.title ? "border-red-500" : ""}
      />
      {errors.title && touched.title && (
        <p className="text-red-500 text-xs mt-1">{errors.title}</p>
      )}
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={values.description}
        onChange={handleChange}
        placeholder="Enter your description here."
        className={errors.description && touched.description ? "border-red-500" : ""}
        maxLength={500}
        rows={3}
      />
      <div className="flex justify-between">
        {errors.description && touched.description ? (
          <p className="text-red-500 text-xs">{errors.description}</p>
        ) : (
          <span />
        )}
        <span className="text-xs text-gray-500">{values.description.length}/500</span>
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="mode">Mode</Label>
      <TooltipProvider>
        <Select
          value={values.mode ? values.mode.toString() : ""}
          onValueChange={(value) => setFieldValue("mode", parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Mode" />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOW_MODES.map((mode) => (
              <div key={mode.id} className="relative flex">
                <SelectItem value={mode.id.toString()} className="flex-grow pr-8">
                  <div className="flex items-center">
                    {mode.id === 1 ? (
                      <ListOrdered className="h-4 w-4 mr-2" />
                    ) : (
                      <Layers className="h-4 w-4 mr-2" />
                    )}
                    <span>{mode.name}</span>
                  </div>
                </SelectItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 h-5 w-5 p-0 cursor-help"
                      onClick={(e) => e.preventDefault()}
                    >
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-50">
                    <p className="w-[280px] text-xs">
                      {mode.id === 1
                        ? "Tasks execute one after another, ensuring each step completes before the next begins."
                        : "Tasks execute simultaneously, allowing multiple steps to run concurrently for faster processing."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </SelectContent>
        </Select>
      </TooltipProvider>
      {errors.mode && touched.mode && (
        <p className="text-red-500 text-xs mt-1">{errors.mode}</p>
      )}
    </div>
  </>
);

export default WorkflowFields;