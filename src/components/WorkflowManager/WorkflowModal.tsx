import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { createOrUpdateWorkflow } from "../../redux/asyncThunks/workflow";
import { clearSelectedWorkflow, closeModal } from "../../redux/workflowSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "../ui/select";
import { WORKFLOW_MODES } from "../../utils/constants/workflows";
import { ListOrdered, Layers, Plus, HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "../ui/tooltip";

import { getPrompts } from "../../redux/aynscThunks/prompt";
import { WorkflowStep } from "./WorkflowStep";

const workflowValidationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required").max(500, "Description cannot exceed 500 characters"),
    mode: Yup.number().required("Mode is required"),
    steps: Yup.array().of(
        Yup.object().shape({
            prompt: Yup.string().required("Prompt is required"),
            order: Yup.number().required("Order is required"),
        })
    ),
});

interface FormValues {
    title: string;
    description: string;
    mode: number;
    steps: {
        id?: string;
        prompt: string;
        order: number;
    }[];
}

const WorkflowModal: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedWorkflow, loading, isModalOpen } = useSelector((state: RootState) => state.workflow);
    const { prompts } = useSelector((state: RootState) => state.prompt);
    const isEditMode = !!selectedWorkflow;
    const [savedSteps, setSavedSteps] = useState<string[]>([]);

    useEffect(() => {
        dispatch(getPrompts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedWorkflow) {
            const steps = selectedWorkflow.steps || selectedWorkflow.stepsDetail || [];
            const stepIds = steps.map(step => step.id);
            setSavedSteps(stepIds);
        } else {
            setSavedSteps([]);
        }
    }, [selectedWorkflow]);

    const initialValues: FormValues = {
        title: selectedWorkflow?.title || "",
        description: selectedWorkflow?.description || "",
        mode: selectedWorkflow?.mode || 0,
        steps: selectedWorkflow
            ? (selectedWorkflow.steps || selectedWorkflow.stepsDetail || []).map(step => ({
                id: step.id,
                prompt: step.prompt || step.prompt_detail?.id || "",
                order: step.order
            }))
            : [],
    };

    const handleClose = () => {
        dispatch(closeModal());
        if (selectedWorkflow) {
            dispatch(clearSelectedWorkflow());
        }
        setSavedSteps([]);
    };

    const handleStepSaved = (stepId: string) => {
        setSavedSteps(prev => [...prev, stepId]);
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const allStepsSaved = values.steps.every(step => step.id && savedSteps.includes(step.id));

            if (!allStepsSaved) {
                alert("Please save all steps before creating the workflow");
                setSubmitting(false);
                return;
            }

            await dispatch(
                createOrUpdateWorkflow({
                    id: isEditMode ? selectedWorkflow?.id : undefined,
                    workflowData: {
                        title: values.title,
                        description: values.description,
                        mode: values.mode,
                        steps_ids: values.steps.map(step => step.id as string),
                    },
                })
            ).unwrap();
            handleClose();
        } catch (error) {
            console.error("Failed to save workflow:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getModeIcon = (mode: number) => {
        switch (mode) {
            case 1:
                return <ListOrdered className="h-4 w-4 mr-2" />;
            case 2:
                return <Layers className="h-4 w-4 mr-2" />;
            default:
                return null;
        }
    };

    const getModeTooltip = (mode: number) => {
        switch (mode) {
            case 1:
                return "Tasks execute one after another, ensuring each step completes before the next begins.";
            case 2:
                return "Tasks execute simultaneously, allowing multiple steps to run concurrently for faster processing.";
            default:
                return "";
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="p-6 mx-auto w-[90vw] max-w-2xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
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

                <Formik
                    initialValues={initialValues}
                    validationSchema={workflowValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        setFieldValue,
                        isValid,
                        dirty,
                    }) => {
                        const unsavedSteps = values.steps.filter(step => !step.id || !savedSteps.includes(step.id)).length;

                        return (
                            <Form className="space-y-4">
                                {/* Title field */}
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

                                {/* Description field */}
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
                                        <span className="text-xs text-gray-500">
                                            {values.description.length}/500
                                        </span>
                                    </div>
                                </div>

                                {/* Mode field */}
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
                                                        <SelectItem
                                                            value={mode.id.toString()}
                                                            className="flex-grow pr-8"
                                                        >
                                                            <div className="flex items-center">
                                                                {mode.id === 1 ?
                                                                    <ListOrdered className="h-4 w-4 mr-2" /> :
                                                                    <Layers className="h-4 w-4 mr-2" />}
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

                                {/* Steps */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newOrder = values.steps.length > 0
                                                    ? Math.max(...values.steps.map(s => s.order)) + 1
                                                    : 1;

                                                setFieldValue("steps", [
                                                    ...values.steps,
                                                    { prompt: "", order: newOrder }
                                                ]);
                                            }}
                                            className="flex items-center"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Step
                                        </Button>

                                        {unsavedSteps > 0 && (
                                            <div className="text-amber-600 text-xs font-medium">
                                                {unsavedSteps} unsaved step{unsavedSteps > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>

                                    <FieldArray name="steps">
                                        {({ remove, move }) => (
                                            <div className="space-y-3">
                                                {values.steps.length === 0 ? (
                                                    <div className="text-center py-8 border border-dashed rounded-md text-gray-500">
                                                        No steps added yet. Click "Add Step" to begin.
                                                    </div>
                                                ) : (
                                                    values.steps.map((step, index) => (
                                                        <WorkflowStep
                                                            key={`step-${step.id || `new-${index}`}`}
                                                            index={index}
                                                            step={step}
                                                            prompts={prompts}
                                                            onRemove={() => remove(index)}
                                                            onMove={(dir) => {
                                                                if (dir === 'up' && index > 0) {
                                                                    move(index, index - 1);
                                                                } else if (dir === 'down' && index < values.steps.length - 1) {
                                                                    move(index, index + 1);
                                                                }
                                                            }}
                                                            onChange={(field, value) => {
                                                                setFieldValue(`steps[${index}].${field}`, value);
                                                            }}
                                                            onStepSaved={(stepId) => {
                                                                setFieldValue(`steps[${index}].id`, stepId);
                                                                handleStepSaved(stepId);
                                                            }}
                                                            error={
                                                                errors.steps &&
                                                                Array.isArray(errors.steps) &&
                                                                errors.steps[index]
                                                            }
                                                            touched={
                                                                touched.steps &&
                                                                Array.isArray(touched.steps) &&
                                                                touched.steps[index]
                                                            }
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                <DialogFooter className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            !(isValid && dirty) ||
                                            loading ||
                                            unsavedSteps > 0 ||
                                            values.steps.length === 0
                                        }
                                    >
                                        {loading ? "Saving..." : "Save"}
                                    </Button>
                                </DialogFooter>
                            </Form>
                        );
                    }}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default WorkflowModal;
