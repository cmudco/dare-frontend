import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { AppDispatch, RootState } from '@/redux/store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingFormValues, onboardingValidationSchema } from './validation'
import { updateUserAPI } from '@/api/user'
import { getUserData } from '@/redux/asyncThunks/user'

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialValues: OnboardingFormValues = {
    role: user?.role || '',
    industry: user?.industry || '',
    purpose: user?.purpose || '',
    referralSource: user?.referralSource || '',
  }

  useEffect(() => {
    // Using this to ensure user obj is updated
    if (user?.isOnboardingCompleted) {
      navigate('/dashboard', { replace: true })
    }
  }, [user?.isOnboardingCompleted, navigate])

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Update user via API
      await updateUserAPI({
        email: user!.email,
        vectorDb: user!.vectorDb,
        ...values,
      })

      // Refresh user data to get updated isOnboardingCompleted status
      await dispatch(getUserData()).unwrap()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to complete onboarding. Please try again.'
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='w-full max-w-2xl'>
        <div className='rounded-lg border bg-card p-8 shadow-xs'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-foreground'>
              Tell us about yourself
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              Help us personalize your DARE experience
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={onboardingValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className='space-y-6'>
                {/* Role/Profession/Student */}
                <div>
                  <Label htmlFor='role'>Role/Profession/Student *</Label>
                  <Field
                    as={Input}
                    id='role'
                    name='role'
                    placeholder='e.g., Graduate Student, Professor, Researcher'
                    className={
                      errors.role && touched.role ? 'border-red-500' : ''
                    }
                  />
                  <ErrorMessage
                    name='role'
                    component='div'
                    className='mt-1 text-sm text-red-600'
                  />
                </div>

                {/* Industry/Major */}
                <div>
                  <Label htmlFor='industry'>Industry/Major *</Label>
                  <Field
                    as={Input}
                    id='industry'
                    name='industry'
                    placeholder='e.g., Computer Science, Public Health, Biology'
                    className={
                      errors.industry && touched.industry
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  <ErrorMessage
                    name='industry'
                    component='div'
                    className='mt-1 text-sm text-red-600'
                  />
                </div>

                {/* Goals */}
                <div>
                  <Label htmlFor='purpose'>Goals of using DARE *</Label>
                  <Field
                    as={Textarea}
                    id='purpose'
                    name='purpose'
                    rows={3}
                    placeholder='Tell us what you hope to accomplish with DARE'
                    className={
                      errors.purpose && touched.purpose ? 'border-red-500' : ''
                    }
                  />
                  <ErrorMessage
                    name='purpose'
                    component='div'
                    className='mt-1 text-sm text-red-600'
                  />
                </div>

                {/* Referral Source */}
                <div>
                  <Label htmlFor='referralSource'>
                    Where did you hear about DARE? / What class were you
                    assigned access? *
                  </Label>
                  <Field
                    as={Textarea}
                    id='referralSource'
                    name='referralSource'
                    rows={2}
                    placeholder='e.g., Professor recommendation, course assignment, colleague'
                    className={
                      errors.referralSource && touched.referralSource
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  <ErrorMessage
                    name='referralSource'
                    component='div'
                    className='mt-1 text-sm text-red-600'
                  />
                </div>

                {error && (
                  <div className='rounded-md bg-destructive/10 p-4'>
                    <p className='text-sm text-destructive'>{error}</p>
                  </div>
                )}

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Completing...' : 'Complete Onboarding'}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default OnboardingScreen
