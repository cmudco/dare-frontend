import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  fetchChunkSettings,
  updateChunkSettings,
} from '@/redux/asyncThunks/user'
import { ChunkSettings } from '@/redux/types/user'

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

export const ChunkSettingsForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoading = useSelector((state: RootState) => state.user.loading)
  const error = useSelector((state: RootState) => state.user.error)
  const [success, setSuccess] = useState(false)

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
    onSubmit: async (values) => {
      try {
        const resultAction = await dispatch(updateChunkSettings(values))

        if (updateChunkSettings.fulfilled.match(resultAction)) {
          setSuccess(true)
          setTimeout(() => {
            setSuccess(false)
          }, 3000)
        }
      } catch (error) {
        console.error('Error updating chunk settings:', error)
      }
    },
  })

  return (
    <Card className='p-6'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold'>Chunk Settings</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Configure how your documents are split into chunks for processing.
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Smaller chunks provide more precise search results, while larger
            chunks maintain more context.
          </p>
        </div>

        <form onSubmit={chunkFormik.handleSubmit} className='space-y-4'>
          <div>
            <Label className='text-base font-normal' htmlFor='chunkSize'>
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
            <Label className='text-base font-normal' htmlFor='overlapSize'>
              Overlap Size
            </Label>
            <div className='mt-1 flex items-center gap-2'>
              <span className='text-xs text-muted-foreground'>
                Recommended: 50-200 characters
              </span>
            </div>
            <Input
              className={`mt-1 h-10 max-w-md ${
                chunkFormik.touched.overlapSize &&
                chunkFormik.errors.overlapSize
                  ? 'border-red-500'
                  : ''
              }`}
              id='overlapSize'
              type='number'
              placeholder='Enter overlap size (e.g., 100)'
              {...chunkFormik.getFieldProps('overlapSize')}
            />
            {chunkFormik.touched.overlapSize &&
              chunkFormik.errors.overlapSize && (
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

          {success && (
            <div className='mt-2'>
              <p className='text-xs font-medium text-green-500'>
                Chunking settings updated successfully!
              </p>
            </div>
          )}

          <Button
            type='submit'
            disabled={isLoading || !chunkFormik.isValid || !chunkFormik.dirty}
            variant='default'
            className='mt-4 h-[38px] text-base font-normal'
          >
            {isLoading ? 'Updating...' : 'Update Chunking Settings'}
          </Button>
        </form>
      </div>
    </Card>
  )
}
