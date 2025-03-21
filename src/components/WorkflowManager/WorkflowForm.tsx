// WorkflowForm.tsx
import React from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { createOrUpdateWorkflow } from "../../redux/asyncThunks/workflow";
import WorkflowFields from "./WorkflowFields";
import WorkflowSteps from "./WorkflowSteps";
import WorkflowFooter from "./WorkflowFooter";
import { Step } from "@/redux/types/workflow";
import { closeModal } from "@/redux/workflowSlice";

const workflowValidationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string()
        .required("Description is required")
        .max(500, "Description cannot exceed 500 characters"),
    mode: Yup.number().required("Mode is required"),
    steps: Yup.array().of(
        Yup.object().shape({
            prompt: Yup.mixed().nullable().required("Prompt is required"),
            order: Yup.number().required("Order is required"),
        })
    ),
});

interface FormValues {
    title: string;
    description: string;
    mode: number;
    steps: Step[];
}

const WorkflowForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedWorkflow, loading, tempSteps, savedStepIds } = useSelector(
        (state: RootState) => state.workflow
    );
    const isEditMode = !!selectedWorkflow;

    const initialValues: FormValues = {
        title: selectedWorkflow?.title || "",
        description: selectedWorkflow?.description || "",
        mode: selectedWorkflow?.mode || 0,
        steps: tempSteps,
    };

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting }: FormikHelpers<FormValues>
    ) => {
        try {
            const allStepsSaved = values.steps.every(
                (step) => step.id && savedStepIds.includes(step.id)
            );
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
                        steps_ids: values.steps.map((step) => step.id as string), // Use step.id, not prompt.id
                    },
                })
            ).unwrap();

            dispatch(closeModal());
        } catch (error) {
            console.error("Failed to save workflow:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={workflowValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, errors, touched, handleChange, setFieldValue, isValid, dirty }) => (
                <Form className="space-y-4">
                    <WorkflowFields
                        values={values}
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        setFieldValue={setFieldValue}
                        isEditMode={isEditMode}
                    />
                    <WorkflowSteps />
                    <WorkflowFooter
                        loading={loading}
                        isValid={isValid}
                        dirty={dirty}
                        unsavedSteps={
                            values.steps.filter(
                                (step) => !step.id || !savedStepIds.includes(step.id)
                            ).length
                        }
                        stepsCount={values.steps.length}
                    />
                </Form>
            )}
        </Formik>
    );
};

export default WorkflowForm;