import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Field, ErrorMessage } from 'formik'
import { AppDispatch, RootState } from '@/redux/store'
import {
  loadSignupOptions,
  requestAccess,
} from '@/redux/asyncThunks/accessRequest'
import { resetAccessRequest } from '@/redux/accessRequestSlice'
import { AccessRequestInput } from '@/redux/types/accessRequest'
import AuthCard from '@/components/Auth/AuthCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { requestAccessValidationSchema } from './validation'

const RequestAccessScreen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, response, options, optionsStatus } = useSelector(
    (state: RootState) => state.accessRequest
  )
  useEffect(() => {
    dispatch(resetAccessRequest())
    void dispatch(loadSignupOptions())
  }, [dispatch])
  const available = options?.approvalSignupEnabled === true
  const showForm = available && !response
  const handleSubmit = async (values: AccessRequestInput) => {
    if (!available || loading) return
    await dispatch(
      requestAccess({
        name: values.name.trim(),
        email: values.email.trim(),
        reason: values.reason.trim(),
      })
    )
  }
  return (
    <AuthCard<AccessRequestInput>
      title='Request access to DARE'
      subtitle={
        available
          ? 'An administrator will review your request. If approved, you will receive a single-use signup code. After registering, verify your email address.'
          : undefined
      }
      inputs={
        showForm
          ? [
              { name: 'name', label: 'Name', type: 'text' },
              { name: 'email', label: 'Email Address', type: 'email' },
            ]
          : []
      }
      formikConfig={{
        initialValues: { name: '', email: '', reason: '' },
        validationSchema: requestAccessValidationSchema,
        onSubmit: handleSubmit,
      }}
      buttonText={
        showForm ? (loading ? 'Submitting request…' : 'Request access') : ''
      }
      loading={loading}
      error={error}
      roleSelect={
        showForm && (
          <div className='mb-4 space-y-2'>
            <Label htmlFor='request-reason'>
              Why do you need access? (optional)
            </Label>
            <Field
              as='textarea'
              id='request-reason'
              name='reason'
              rows={3}
              maxLength={1000}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
            />
            <ErrorMessage
              name='reason'
              component='p'
              className='text-sm text-destructive'
            />
          </div>
        )
      }
      footer={
        <div className='flex flex-wrap justify-center gap-4 text-sm'>
          <Link to='/register' className='text-primary underline'>
            Register
          </Link>
          <Link to='/login' className='text-primary underline'>
            Back to login
          </Link>
        </div>
      }
    >
      {response ? (
        <div role='status' className='space-y-2 text-sm'>
          <p>{response.detail}</p>
          <p>
            You do not have an account yet. Wait for your invitation before
            registering.
          </p>
        </div>
      ) : (
        !available && (
          <div role='status' className='space-y-3 text-sm'>
            <p>
              {optionsStatus === 'failed'
                ? 'Could not check whether access requests are available.'
                : optionsStatus === 'succeeded'
                  ? 'Access requests are not enabled on this deployment.'
                  : 'Checking whether access requests are available…'}
            </p>
            {optionsStatus === 'failed' && (
              <Button
                variant='outline'
                onClick={() => {
                  void dispatch(loadSignupOptions())
                }}
              >
                Try again
              </Button>
            )}
          </div>
        )
      )}
    </AuthCard>
  )
}
export default RequestAccessScreen
