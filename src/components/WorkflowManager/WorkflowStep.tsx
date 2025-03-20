import React, { useState, useEffect } from "react";
import { Prompt } from "@/redux/types/prompt";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem
} from "../ui/select";
import { Button } from "../ui/button";
import { ChevronUp, ChevronDown, Trash2, ChevronsUpDown, GripVertical, Save } from "lucide-react";
import { stripHtml } from "@/utils/textUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createStep, updateStep } from "@/redux/asyncThunks/workflow";

interface WorkflowStepProps {
    index: number;
    step: {
        id?: string;
        prompt: string;
        order: number;
    };
    prompts: Prompt[];
    onRemove: () => void;
    onMove: (direction: 'up' | 'down') => void;
    onChange: (field: string, value: string | number) => void;
    onStepSaved: (stepId: string) => void;
    error?: any;
    touched?: any;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
    index,
    step,
    prompts,
    onRemove,
    onMove,
    onChange,
    onStepSaved,
    error,
    touched,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);
    const [promptChanged, setPromptChanged] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const selectedPrompt = prompts.find(p => p.id === step.prompt);
    const hasError = error && touched;

    const handlePromptChange = (value: string) => {
        onChange('prompt', value);
        setPromptChanged(true);
        setSaveError(null);
    };

    const handleSaveStep = async () => {
        if (!step.prompt) return;

        setSaving(true);
        setSaveError(null);

        try {
            if (step.id) {
                const result = await dispatch(updateStep({
                    stepId: step.id,
                    stepData: {
                        prompt: step.prompt,
                        order: step.order
                    }
                })).unwrap();

                onStepSaved(result.id);
            } else {
                const result = await dispatch(createStep({
                    promptId: step.prompt,
                    order: step.order,
                })).unwrap();

                onStepSaved(result.id);
            }
            setPromptChanged(false);
        } catch (error) {
            console.error("Failed to save step:", error);
            setSaveError("Failed to save step. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const getPromptTitle = () => {
        if (!step.prompt) return "Select a prompt";
        const prompt = prompts.find(p => p.id === step.prompt);
        return prompt ? prompt.title : "Select a prompt";
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
                        onClick={() => onMove('up')}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onMove('down')}
                        className="h-8 w-8 p-0"
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
                <div className="p-4 border-t">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Select Prompt
                        </label>
                        <Select
                            value={step.prompt}
                            onValueChange={handlePromptChange}
                        >
                            <SelectTrigger
                                className={hasError?.prompt || saveError ? "border-red-500" : ""}
                            >
                                <span className="truncate max-w-full">
                                    {selectedPrompt ? selectedPrompt.title : "Select a prompt"}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {prompts.map((prompt) => (
                                    <SelectItem key={prompt.id} value={prompt.id}>
                                        {prompt.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError?.prompt && (
                            <p className="text-red-500 text-xs mt-1">{error?.prompt}</p>
                        )}
                        {saveError && (
                            <p className="text-red-500 text-xs mt-1">{saveError}</p>
                        )}
                    </div>

                    {selectedPrompt && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <h4 className="text-sm font-medium">Prompt Preview</h4>
                            <p className="text-xs text-gray-600 mt-1">
                                {stripHtml(selectedPrompt.content).substring(0, 150)}
                                {selectedPrompt.content.length > 150 ? '...' : ''}
                            </p>
                        </div>
                    )}

                    <div className="mt-3 flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveStep}
                            disabled={!promptChanged || saving || !step.prompt}
                            className="flex items-center"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {saving ? "Saving..." : "Save Step"}
                        </Button>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
