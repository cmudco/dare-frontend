import React from 'react'
import { Formik, Form, FormikHelpers } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { createOrUpdateWorkflow } from '../../redux/asyncThunks/workflow'
import WorkflowFields from './WorkflowFields'
import WorkflowFooter from './WorkflowFooter'
import { FormValues } from '@/redux/types/workflow'
import { closeModal } from '@/redux/workflowSlice'
import { workflowValidationSchema } from '@/pages/Workflows/validation'
import WorkflowAddSteps from './WorkflowCreateSteps'

const WorkflowForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflow, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const isEditMode = !!selectedWorkflow

  const initialSteps = selectedWorkflow?.steps || []
  const defaultFirstStep = {
    prompt: null,
    files: [],
    embeddings: [],
    usePreviousStepFiles: false,
    usePreviousStepEmbeddings: false,
    llm: null,
    order: 1,
  }

  const initialValues: FormValues = {
    title: selectedWorkflow?.title || '',
    description: selectedWorkflow?.description || '',
    mode: selectedWorkflow?.mode || 0,
    steps:
      isEditMode || initialSteps.length > 0 ? initialSteps : [defaultFirstStep],
  }

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const stepsPayload = values.steps.map((step) => ({
        id: step.id,
        order: step.order,
        prompt: step.prompt?.id || null,
        files: step.files?.map((f) => f.id) || [],
        embeddings: step.embeddings?.map((f) => f.id) || [],
        usePreviousStepFiles: step.usePreviousStepFiles || false,
        usePreviousStepEmbeddings: step.usePreviousStepEmbeddings || false,
        llm: step.llm?.id || null,
        max_tokens: step.maxTokens,
        temperature: step.temperature,
        max_context_snippets: step.maxContextSnippets,
        document_similarity_threshold: step.documentSimilarityThreshold,
      }))

      await dispatch(
        createOrUpdateWorkflow({
          id: isEditMode ? selectedWorkflow?.id : undefined,
          workflowData: {
            title: values.title,
            description: values.description,
            mode: values.mode,
            steps: stepsPayload,
          },
        })
      ).unwrap()

      dispatch(closeModal())
    } catch (error) {
      console.error('Failed to save workflow:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
      }) => (
        <Form className='space-y-4'>
          <WorkflowFields
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            isEditMode={isEditMode}
          />
          <WorkflowAddSteps
            steps={values.steps}
            setSteps={(newSteps) => setFieldValue('steps', newSteps)}
            errors={errors}
            touched={touched}
          />
          <WorkflowFooter
            loading={loading}
            isValid={isValid}
            dirty={dirty || isEditMode}
            unsavedSteps={0}
            stepsCount={values.steps.length}
          />
        </Form>
      )}
    </Formik>
  )
}

export default WorkflowForm
