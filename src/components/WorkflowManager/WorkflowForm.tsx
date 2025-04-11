import React from 'react'
import { Formik, Form, FormikHelpers } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { createOrUpdateWorkflow } from '../../redux/asyncThunks/workflow'
import WorkflowFields from './WorkflowFields'
import WorkflowSteps from './WorkflowSteps'
import WorkflowFooter from './WorkflowFooter'
import { FormValues, workflowValidationSchema } from '@/redux/types/workflow'
import { closeModal } from '@/redux/workflowSlice'

const WorkflowForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedWorkflow, loading } = useSelector(
    (state: RootState) => state.workflow
  )
  const isEditMode = !!selectedWorkflow

  const initialValues: FormValues = {
    title: selectedWorkflow?.title || '',
    description: selectedWorkflow?.description || '',
    mode: selectedWorkflow?.mode || 0,
    steps: selectedWorkflow?.steps || [],
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
        file: step.file?.id || null,
        llm: step.llm?.id || null,
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
          <WorkflowSteps
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
