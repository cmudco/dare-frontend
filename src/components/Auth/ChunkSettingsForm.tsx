import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
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
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className='text-lg font-semibold'>
            Text Splitting & Chunking Preferences
          </h3>
          <p className='text-sm text-gray-600 mt-1'>
            Sometimes, you may want to change the default way that new documents are
            split and chunked before being inserted into your vector database. You
            should only modify this setting if you understand how text splitting
            works and it's side effects.
          </p>
          <p className='text-sm text-gray-600 mt-2'>
            <strong>Note:</strong> Changes here will only apply to newly embedded
            documents, not existing documents.
          </p>
        </div>

        <form onSubmit={chunkFormik.handleSubmit} className='space-y-6'>
        <div>
          <Label
            className='mb-2 flex flex-col text-base font-normal'
            htmlFor='chunkSize'
          >
            <span>Text Chunk Size</span>
            <span className='text-xs text-gray-500'>
              This is the maximum length of characters that can be present in a
              single vector.
            </span>
          </Label>
          <div className='flex max-w-md items-center space-x-4'>
            <Slider
              id='chunkSize'
              min={100}
              max={2000}
              step={10}
              value={[chunkFormik.values.chunkSize]}
              onValueChange={(value) =>
                chunkFormik.setFieldValue('chunkSize', value[0])
              }
              className='flex-grow cursor-pointer'
            />
            <Input
              type='number'
              min={100}
              max={2000}
              className='w-20'
              value={chunkFormik.values.chunkSize}
              onChange={chunkFormik.handleChange}
              name='chunkSize'
            />
          </div>
          {chunkFormik.touched.chunkSize && chunkFormik.errors.chunkSize && (
            <p className='mt-1 text-xs text-red-500'>
              {chunkFormik.errors.chunkSize}
            </p>
          )}
        </div>

        <div>
          <Label
            className='mb-2 flex flex-col text-base font-normal'
            htmlFor='overlapSize'
          >
            <span>Text Chunk Overlap</span>
            <span className='text-xs text-gray-500'>
              This is the maximum overlap of characters that occurs during
              chunking between two adjacent text chunks.
            </span>
          </Label>
          <div className='flex max-w-md items-center space-x-4'>
            <Slider
              id='overlapSize'
              min={0}
              max={200}
              step={5}
              value={[chunkFormik.values.overlapSize]}
              onValueChange={(value) =>
                chunkFormik.setFieldValue('overlapSize', value[0])
              }
              className='flex-grow cursor-pointer'
            />
            <Input
              type='number'
              min={0}
              max={200}
              className='w-20'
              value={chunkFormik.values.overlapSize}
              onChange={chunkFormik.handleChange}
              name='overlapSize'
            />
          </div>
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
