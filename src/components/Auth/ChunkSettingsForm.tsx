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
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

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
  onSuccess?: () => void
}

export const ChunkSettingsForm: React.FC<ChunkSettingsFormProps> = ({
  className,
  onSuccess,
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
    onSubmit: async (values) => {
      try {
        await dispatch(updateChunkSettings(values))
        toast.success('Chunk settings saved.')
        onSuccess?.()
      } catch (error) {
        console.error('Error updating chunk settings:', error)
      }
    },
  })

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className ?? ''}`}>
        <form onSubmit={chunkFormik.handleSubmit} className='space-y-4 text-sm'>
          <div>
            <div className='flex items-center gap-2'>
              <Label
                className='text-xs font-medium uppercase'
                htmlFor='chunkSize'
              >
                Chunk Size
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-sm'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.chunking.chunkSize.title}
                    </p>
                    <p className='text-sm'>
                      {TOOLTIP_CONTENT.chunking.chunkSize.description}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      💡 {TOOLTIP_CONTENT.chunking.chunkSize.tip}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
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
            <div className='flex items-center gap-2'>
              <Label
                className='text-xs font-medium uppercase'
                htmlFor='overlapSize'
              >
                Overlap Size
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-sm'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.chunking.overlap.title}
                    </p>
                    <p className='text-sm'>
                      {TOOLTIP_CONTENT.chunking.overlap.description}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      💡 {TOOLTIP_CONTENT.chunking.overlap.tip}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
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

          <div className='mt-4 flex justify-end'>
            <Button
              type='submit'
              disabled={
                isLoading || chunkFormik.isSubmitting || !chunkFormik.isValid
              }
              variant='default'
              className='h-9 px-4 text-sm'
            >
              {chunkFormik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  )
}
