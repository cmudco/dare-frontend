import React, { useState } from "react";
import { Prompt } from "@/redux/types/prompt";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  ChevronsUpDown,
  GripVertical,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Step, StepError, StepTouched } from "@/redux/types/workflow";
import { LLMModel } from "@/redux/types/conversation";
import { MyFile } from "@/redux/types/files";

interface WorkflowStepProps {
  index: number;
  step: Step;
  prompts: Prompt[];
  files: MyFile[];
  llms: LLMModel[];
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onChange: (field: keyof Step, value: unknown) => void;
  error?: StepError;
  touched?: StepTouched;
  totalSteps?: number;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  index,
  step,
  prompts,
  files,
  llms,
  onRemove,
  onMove,
  onChange,
  error,
  touched,
  totalSteps,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePromptChange = (value: string) => {
    const newPrompt = prompts.find((p) => p.id == value);
    onChange("prompt", newPrompt || null);
  };

  const handleFileChange = (value: string) => {
    console.log(value)
    if (value === "none") {
      onChange("file", null);
    } else {
      const newFile = files.find((f) => f.id === parseInt(value));
      onChange("file", newFile || null);
    }
  };

  const handleLLMChange = (value: string) => {
    if (value === "none") {
      onChange("llm", null);
    } else {
      const newLLM = llms.find((l) => l.id === parseInt(value));
      onChange("llm", newLLM || null);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-md overflow-hidden bg-white"
    >
      <div className="flex items-center justify-between p-3 bg-gray-50">
        <div className="flex items-center">
          <div className="mr-3 cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <span className="font-medium text-sm">Step {index + 1}</span>
          {step.id && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove("up")}
            className="h-8 w-8 p-0"
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove("down")}
            className="h-8 w-8 p-0"
            disabled={index === totalSteps! - 1} // Note: steps not in props, adjust as needed
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="p-4 border-t space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Prompt</label>
            <Select
              value={step.prompt?.id.toString() || ""}
              onValueChange={handlePromptChange}
            >
              <SelectTrigger className={error?.prompt && touched?.prompt ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id.toString()}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error?.prompt && touched?.prompt && (
              <p className="text-red-500 text-xs mt-1">{error.prompt}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select File</label>
            <Select
              value={step.file?.id?.toString() || "none"}
              onValueChange={handleFileChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.id.toString()}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error?.file && touched?.file && (
              <p className="text-red-500 text-xs mt-1">{error.file}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select LLM</label>
            <Select
              value={step.llm?.id?.toString() || "none"}
              onValueChange={handleLLMChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an LLM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {llms.map((llm) => (
                  <SelectItem key={llm.id} value={llm.id.toString()}>
                    {llm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error?.llm && touched?.llm && (
              <p className="text-red-500 text-xs mt-1">{error.llm}</p>
            )}
          </div>

          {/* {selectedPrompt && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium">Prompt Preview</h4>
              <p className="text-xs text-gray-600 mt-1">
                {stripHtml(selectedPrompt.content).substring(0, 150)}
                {selectedPrompt.content.length > 150 ? "..." : ""}
              </p>
            </div>
          )} */}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};