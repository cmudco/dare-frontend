import React from 'react'
import { useDispatch } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AppDispatch } from '@/redux/store'
import { addLiteLLMKey } from '@/redux/asyncThunks/billing'
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
import { Loader2 } from 'lucide-react'
import { toast } from '@/utils/toast'

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add LiteLLM Key</DialogTitle>
          <DialogDescription>
            Route LLM calls through your LiteLLM proxy. The key is encrypted at
            rest and never returned in API responses.
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
              onClose()
            } catch (err) {
              toast.error(
                typeof err === 'string'
                  ? err
                  : 'Failed to add LiteLLM key. Please try again.'
              )
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
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

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
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
