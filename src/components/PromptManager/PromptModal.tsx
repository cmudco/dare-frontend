import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { createOrUpdatePrompt } from '../../redux/asyncThunks/prompt'
import { clearSelectedPrompt, closeModal } from '../../redux/promptSlice'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import Tiptap from '../Tiptap'
import { getUserData } from '@/redux/asyncThunks/user'
import { Switch } from '@/components/ui/switch'

const promptValidationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  content: Yup.string().required('Content is required'),
})

const PromptUploadModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedPrompt, loading, isModalOpen } = useSelector(
    (state: RootState) => state.prompt
  )
  const user = useSelector((state: RootState) => state.user.user)
  const isEditMode = !!selectedPrompt

  const initialValues = {
    title: selectedPrompt?.title || '',
    content: selectedPrompt?.content || '',
    isDefault: isEditMode && selectedPrompt?.id === user?.defaultPrompt?.id,
  }

  const handleClose = () => {
    dispatch(closeModal())
    if (selectedPrompt) {
      dispatch(clearSelectedPrompt())
    }
  }

  const handleSubmit = async (
    values: { title: string; content: string; isDefault: boolean },
    { bumpVersion = false }: { bumpVersion?: boolean }
  ) => {
    try {
      const promptData = {
        title: values.title,
        content: values.content,
        isDefault:
          values.isDefault ||
          (isEditMode &&
            selectedPrompt?.id === user?.defaultPrompt?.id &&
            bumpVersion),
      }
      await dispatch(
        createOrUpdatePrompt({
          id: isEditMode ? selectedPrompt?.id : undefined,
          promptData,
          bumpVersion,
        })
      )
        .unwrap()
        .then(() => {
          dispatch(getUserData())
          handleClose()
        })
    } catch (error) {
      console.error('Failed to save prompt:', error)
    }
  }

  const currentDefaultTitle = user?.defaultPrompt?.title || null

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='mx-auto w-auto min-w-[50vw] max-w-[90vw] rounded-lg bg-background p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-foreground'>
            {isEditMode ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {isEditMode
              ? 'Update your prompt details below.'
              : 'Fill in the details to create a new prompt.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={promptValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmit(values, { bumpVersion: false })
            setSubmitting(false)
          }}
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
              <div className='space-y-2'>
                <Label htmlFor='title'>Prompt Title</Label>
                {isEditMode && selectedPrompt && (
                  <span className='ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                    v{selectedPrompt.version || 1}
                  </span>
                )}
                <Input
                  id='title'
                  name='title'
                  value={values.title}
                  onChange={handleChange}
                  placeholder='Enter prompt title'
                  className={
                    errors.title && touched.title ? 'border-red-500' : ''
                  }
                />
                {errors.title && touched.title && (
                  <p className='mt-1 text-xs text-red-500'>{errors.title}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='content'>Prompt Content</Label>
                <div
                  className={
                    errors.content && touched.content
                      ? 'max-h-[50vh] overflow-y-scroll rounded-md border border-red-500'
                      : 'max-h-[50vh] overflow-y-scroll'
                  }
                >
                  <Tiptap
                    content={values.content}
                    onChange={(newContent) =>
                      setFieldValue('content', newContent)
                    }
                  />
                </div>
                {errors.content && touched.content && (
                  <p className='mt-1 text-xs text-red-500'>{errors.content}</p>
                )}
              </div>

              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Label htmlFor='isDefault'>Set as Default Prompt</Label>
                  <Switch
                    id='isDefault'
                    name='isDefault'
                    checked={values.isDefault}
                    onCheckedChange={(checked) =>
                      setFieldValue('isDefault', checked)
                    }
                  />
                </div>
                {currentDefaultTitle && values.isDefault && (
                  <p className='text-xs text-yellow-600'>
                    You already have '{currentDefaultTitle}' as default prompt.
                    Setting this will override it.
                  </p>
                )}
              </div>

              <DialogFooter className='flex justify-end gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button type='submit' disabled={!(isValid && dirty) || loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                {isEditMode && (
                  <Button
                    type='button'
                    onClick={() => handleSubmit(values, { bumpVersion: true })}
                    disabled={loading}
                    variant='secondary'
                  >
                    {loading ? 'Saving...' : 'Save & Bump Version'}
                  </Button>
                )}
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default PromptUploadModal
