import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  fetchChunkSettings,
  updateChunkSettings,
} from '@/redux/asyncThunks/user'
import { ChunkSettings } from '@/redux/types/user'
import { toast } from '@/utils/toast'

const chunkSettingsValidationSchema = Yup.object({
  chunkSize: Yup.number()
    .min(100, 'Chunk size must be at least 100 characters')
    .max(2000, 'Chunk size cannot exceed 2000 characters')
    .required('Chunk size is required'),
  overlapSize: Yup.number()
    .min(0, 'Overlap must be at least 0 characters')
    .max(200, 'Overlap cannot exceed 200 characters')
    .required('Chunk overlap is required')
    .test(
      'overlap-less-than-size',
      'Overlap must be less than chunk size',
      function (value) {
        return value < this.parent.chunkSize
      }
    ),
})

interface ChunkSettingsFormProps {
  className?: string
}

export const ChunkSettingsForm: React.FC<ChunkSettingsFormProps> = ({
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoading = useSelector((state: RootState) => state.user.loading)
  const error = useSelector((state: RootState) => state.user.error)

  useEffect(() => {
    dispatch(fetchChunkSettings())
  }, [dispatch])

  const chunkSettings = useSelector(
    (state: RootState) => state.user.chunkSettings
  )

  const chunkFormik = useFormik<ChunkSettings>({
    initialValues: {
      chunkSize: chunkSettings?.chunkSize || 1000,
      overlapSize: chunkSettings?.overlapSize || 20,
    },
    enableReinitialize: true,
    validationSchema: chunkSettingsValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const resultAction = await dispatch(updateChunkSettings(values))

        if (updateChunkSettings.fulfilled.match(resultAction)) {
          toast.success('Chunk settings saved.')
          helpers.setSubmitting(false)
          helpers.resetForm({ values })
          dispatch(fetchChunkSettings())
        } else {
          helpers.setSubmitting(false)
        }
      } catch (error) {
        console.error('Error updating chunk settings:', error)
        helpers.setSubmitting(false)
      }
    },
  })

  const submitButtonLabel = 'Save'

  const formContent = (
    <form onSubmit={chunkFormik.handleSubmit} className='space-y-4 text-sm'>
      <div>
        <Label className='text-xs font-medium uppercase' htmlFor='chunkSize'>
          Chunk Size
        </Label>
        <div className='mt-1 flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>
            Recommended: 500-1000 characters
          </span>
        </div>
        <Input
          className={`mt-1 h-10 max-w-md ${
            chunkFormik.touched.chunkSize && chunkFormik.errors.chunkSize
              ? 'border-red-500'
              : ''
          }`}
          id='chunkSize'
          type='number'
          placeholder='Enter chunk size (e.g., 500)'
          {...chunkFormik.getFieldProps('chunkSize')}
        />
        {chunkFormik.touched.chunkSize && chunkFormik.errors.chunkSize && (
          <p className='mt-1 text-xs text-red-500'>
            {chunkFormik.errors.chunkSize}
          </p>
        )}
      </div>

      <div>
        <Label className='text-xs font-medium uppercase' htmlFor='overlapSize'>
          Overlap Size
        </Label>
        <div className='mt-1 flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>
            Recommended: 50-200 characters
          </span>
        </div>
        <Input
          className={`mt-1 h-10 max-w-md ${
            chunkFormik.touched.overlapSize && chunkFormik.errors.overlapSize
              ? 'border-red-500'
              : ''
          }`}
          id='overlapSize'
          type='number'
          placeholder='Enter overlap size (e.g., 100)'
          {...chunkFormik.getFieldProps('overlapSize')}
        />
        {chunkFormik.touched.overlapSize && chunkFormik.errors.overlapSize && (
          <p className='mt-1 text-xs text-red-500'>
            {chunkFormik.errors.overlapSize}
          </p>
        )}
      </div>

      {error && (
        <div className='mt-2'>
          <p className='text-xs font-medium text-red-500'>{error}</p>
        </div>
      )}

      <div className='mt-4 flex justify-end'>
        <Button
          type='submit'
          disabled={
            isLoading || chunkFormik.isSubmitting || !chunkFormik.isValid
          }
          variant='default'
          className='h-9 px-4 text-sm'
        >
          {chunkFormik.isSubmitting ? 'Saving...' : submitButtonLabel}
        </Button>
      </div>
    </form>
  )

  return <div className={`space-y-4 ${className ?? ''}`}>{formContent}</div>
}
