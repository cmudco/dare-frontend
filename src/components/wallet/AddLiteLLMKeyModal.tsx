import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AppDispatch } from '@/redux/store'
import { addLiteLLMKey } from '@/redux/asyncThunks/billing'
import { testLiteLLMUnsavedAPI } from '@/api/billing'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from '@/utils/toast'
import { BackgroundModelSelect } from './BackgroundModelSelect'

type Step =
  | { kind: 'connection'; error?: string }
  | { kind: 'model'; models: string[]; recommendedModels: string[] }

interface AddLiteLLMKeyModalProps {
  open: boolean
  onClose: () => void
}

const schema = Yup.object({
  label: Yup.string()
    .trim()
    .min(1, 'Label is required')
    .max(128, 'Label is too long')
    .required('Label is required'),
  baseUrl: Yup.string()
    .url('Must be a valid URL (e.g. https://litellm.example.com)')
    .required('Base URL is required'),
  apiKey: Yup.string().min(1).required('API key is required'),
})

interface FormValues {
  label: string
  baseUrl: string
  apiKey: string
  backgroundModel: string
}

const initialValues: FormValues = {
  label: '',
  baseUrl: '',
  apiKey: '',
  backgroundModel: '',
}

/**
 * Two steps: the connection is tested when the user continues, and the
 * background model is chosen from the models that test found. Saving a key
 * without a working connection is not possible.
 */
export const AddLiteLLMKeyModal: React.FC<AddLiteLLMKeyModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [step, setStep] = useState<Step>({ kind: 'connection' })
  const [testing, setTesting] = useState(false)

  const handleClose = () => {
    setStep({ kind: 'connection' })
    onClose()
  }

  const testConnection = async (values: FormValues) => {
    setTesting(true)
    try {
      const res = await testLiteLLMUnsavedAPI(values.baseUrl, values.apiKey)
      return res.ok
        ? { models: res.models, recommendedModels: res.recommendedModels }
        : { error: res.error || 'Connection failed — check the proxy.' }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Request failed.',
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {step.kind === 'connection'
              ? 'Add LiteLLM Key'
              : 'Choose a background model'}
          </DialogTitle>
          <DialogDescription>
            {step.kind === 'connection' ? (
              <>
                Route LLM calls through your LiteLLM proxy. Tip: include{' '}
                <code className='rounded-sm bg-muted px-1 py-0.5 text-[11px]'>
                  /v1
                </code>{' '}
                in the base URL (e.g. <code>http://host:4000/v1</code>). The key
                is encrypted at rest and never returned in API responses.
              </>
            ) : (
              'Used for titles, summaries, memory extraction, and retrieval query analysis. You can change it later from the wallet menu.'
            )}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await dispatch(addLiteLLMKey(values)).unwrap()
              toast.success('LiteLLM key added.')
              helpers.resetForm()
              handleClose()
            } catch (err) {
              toast.error(
                typeof err === 'string'
                  ? err
                  : 'Failed to add LiteLLM key. Please try again.'
              )
            }
          }}
        >
          {({
            errors,
            touched,
            isSubmitting,
            setFieldValue,
            values,
            validateForm,
            setTouched,
          }) => (
            <Form className='space-y-4'>
              {step.kind === 'connection' && (
                <>
                  <div className='space-y-1.5'>
                    <Label htmlFor='litellm-label'>Label</Label>
                    <Field
                      as={Input}
                      id='litellm-label'
                      name='label'
                      placeholder='Personal, PHIL 101 - Spring 2026, …'
                      autoFocus
                    />
                    {touched.label && errors.label && (
                      <p className='text-xs text-destructive'>{errors.label}</p>
                    )}
                  </div>

                  <div className='space-y-1.5'>
                    <Label htmlFor='litellm-base-url'>Base URL</Label>
                    <Field
                      as={Input}
                      id='litellm-base-url'
                      name='baseUrl'
                      type='url'
                      placeholder='https://litellm-proxy.example.com'
                    />
                    {touched.baseUrl && errors.baseUrl && (
                      <p className='text-xs text-destructive'>
                        {errors.baseUrl}
                      </p>
                    )}
                  </div>

                  <div className='space-y-1.5'>
                    <Label htmlFor='litellm-api-key'>API Key</Label>
                    <Field
                      as={Input}
                      id='litellm-api-key'
                      name='apiKey'
                      type='password'
                      autoComplete='new-password'
                      placeholder='sk-…'
                    />
                    {touched.apiKey && errors.apiKey && (
                      <p className='text-xs text-destructive'>
                        {errors.apiKey}
                      </p>
                    )}
                  </div>

                  {step.error && (
                    <div className='rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground'>
                      <p className='wrap-break-word'>{step.error}</p>
                    </div>
                  )}
                </>
              )}

              {step.kind === 'model' && (
                <>
                  <p className='inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3.5 w-3.5 shrink-0' />
                    Connected to {values.label} — {step.models.length}{' '}
                    {step.models.length === 1 ? 'model' : 'models'} available
                  </p>
                  <BackgroundModelSelect
                    id='litellm-background-model'
                    models={step.models}
                    recommendedModels={step.recommendedModels}
                    value={values.backgroundModel}
                    onChange={(model) =>
                      void setFieldValue('backgroundModel', model)
                    }
                  />
                </>
              )}

              <DialogFooter>
                {step.kind === 'connection' ? (
                  <>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleClose}
                      disabled={testing}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='button'
                      disabled={testing}
                      onClick={async () => {
                        const validation = await validateForm()
                        if (Object.keys(validation).length > 0) {
                          await setTouched({
                            label: true,
                            baseUrl: true,
                            apiKey: true,
                          })
                          return
                        }
                        const result = await testConnection(values)
                        if ('error' in result) {
                          setStep({ kind: 'connection', error: result.error })
                          return
                        }
                        if (!values.backgroundModel) {
                          await setFieldValue(
                            'backgroundModel',
                            result.recommendedModels[0] ?? ''
                          )
                        }
                        setStep({ kind: 'model', ...result })
                      }}
                    >
                      {testing ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <ArrowRight className='mr-2 h-4 w-4' />
                      )}
                      {testing ? 'Testing connection…' : 'Next'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setStep({ kind: 'connection' })}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className='mr-2 h-4 w-4' />
                      Back
                    </Button>
                    <Button type='submit' disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      Save
                    </Button>
                  </>
                )}
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
