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
import { CheckCircle2, Loader2, Plug, XCircle } from 'lucide-react'
import { toast } from '@/utils/toast'

type ProbeState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'ok'; models: string[] }
  | { kind: 'fail'; error: string }

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
}

const initialValues: FormValues = { label: '', baseUrl: '', apiKey: '' }

export const AddLiteLLMKeyModal: React.FC<AddLiteLLMKeyModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [probe, setProbe] = useState<ProbeState>({ kind: 'idle' })

  const reset = () => setProbe({ kind: 'idle' })
  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add LiteLLM Key</DialogTitle>
          <DialogDescription>
            Route LLM calls through your LiteLLM proxy. Tip: include{' '}
            <code className='rounded bg-muted px-1 py-0.5 text-[11px]'>
              /v1
            </code>{' '}
            in the base URL (e.g. <code>http://host:4000/v1</code>). The key is
            encrypted at rest and never returned in API responses.
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
          {({ errors, touched, isSubmitting, values }) => (
            <Form className='space-y-4'>
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
                  <p className='text-xs text-destructive'>{errors.baseUrl}</p>
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
                  <p className='text-xs text-destructive'>{errors.apiKey}</p>
                )}
              </div>

              <div className='flex items-center justify-between gap-2 border-t pt-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={
                    isSubmitting ||
                    probe.kind === 'pending' ||
                    !values.baseUrl ||
                    !values.apiKey
                  }
                  onClick={async () => {
                    setProbe({ kind: 'pending' })
                    try {
                      const res = await testLiteLLMUnsavedAPI(
                        values.baseUrl,
                        values.apiKey
                      )
                      if (res.ok) setProbe({ kind: 'ok', models: res.models })
                      else setProbe({ kind: 'fail', error: res.error })
                    } catch (err) {
                      setProbe({
                        kind: 'fail',
                        error:
                          err instanceof Error
                            ? err.message
                            : 'Request failed.',
                      })
                    }
                  }}
                >
                  {probe.kind === 'pending' ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Plug className='mr-2 h-4 w-4' />
                  )}
                  Test connection
                </Button>
                {probe.kind === 'ok' && (
                  <span className='inline-flex items-center gap-1 truncate text-xs font-medium text-emerald-700 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3.5 w-3.5 shrink-0' />
                    {probe.models.length}{' '}
                    {probe.models.length === 1 ? 'model' : 'models'} found
                  </span>
                )}
                {probe.kind === 'fail' && (
                  <span className='inline-flex items-center gap-1 truncate text-xs font-medium text-destructive'>
                    <XCircle className='h-3.5 w-3.5 shrink-0' />
                    Connection failed
                  </span>
                )}
              </div>

              {probe.kind === 'ok' && probe.models.length > 0 && (
                <div className='rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-muted-foreground'>
                  <p className='break-words'>
                    {probe.models.slice(0, 8).join(', ')}
                    {probe.models.length > 8 &&
                      ` + ${probe.models.length - 8} more`}
                  </p>
                </div>
              )}
              {probe.kind === 'fail' && (
                <div className='rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground'>
                  <p className='break-words'>
                    {probe.error || 'Unknown error.'}
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
