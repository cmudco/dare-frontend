import { useEffect, useMemo, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

import { fetchVisionModels, startFileOcrRun } from '@/redux/asyncThunks/file'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { MyFile } from '@/redux/types/files'
import { Button } from '@/components/ui/button'
import VisionModelSelect from './VisionModelSelect'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OcrApprovalDialogProps {
  file: MyFile | null
  onClose: () => void
}

const formatEstimatedCost = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value)

const OcrApprovalDialog = ({ file, onClose }: OcrApprovalDialogProps) => {
  const dispatch = useAppDispatch()
  const plan = file?.ocr
  const visionModels = useAppSelector((state) => state.files.visionModels)
  const [pageLimit, setPageLimit] = useState(10)
  const [modelIdentifier, setModelIdentifier] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchVisionModels())
  }, [dispatch])

  useEffect(() => {
    if (plan) {
      setPageLimit(plan.pageLimit)
      setModelIdentifier(plan.modelIdentifier)
    }
    setError(null)
  }, [plan])

  const options = useMemo(() => {
    if (!plan) return []
    return [
      ...new Set([
        plan.pageLimit,
        plan.automaticPageLimit,
        10,
        25,
        50,
        100,
        plan.selectablePages,
      ]),
    ]
      .filter((value) => value > 0 && value <= plan.selectablePages)
      .sort((a, b) => a - b)
  }, [plan])

  if (!file || !plan) return null

  const isContinuation = plan.status === 'partial'
  const remainingPages =
    plan.remainingPages ??
    Math.max(plan.detectedPages - (plan.processedPages ?? 0), 0)
  const selectedModel = visionModels?.models.find(
    (model) => model.identifier === modelIdentifier
  )
  const costPerPage = Number(
    selectedModel?.estimatedCostPerPage ?? plan.estimatedCostPerPage
  )
  const estimate = costPerPage * pageLimit
  const deferredPages = Math.max(remainingPages - pageLimit, 0)

  const handleApprove = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await dispatch(
        startFileOcrRun({ fileId: file.id, pageLimit, modelIdentifier })
      ).unwrap()
      onClose()
    } catch (approvalError) {
      setError(
        typeof approvalError === 'string'
          ? approvalError
          : 'Could not start transcription.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted'>
            <FileText className='h-5 w-5 text-foreground' />
          </div>
          <DialogTitle>
            {isContinuation
              ? 'Continue scanned-page transcription'
              : 'Review scanned-page transcription'}
          </DialogTitle>
          <DialogDescription>
            {isContinuation ? (
              <>
                {plan.processedPages} of {plan.detectedPages} scanned pages are
                complete in{' '}
                <span className='font-medium text-foreground'>{file.name}</span>
                .
              </>
            ) : (
              <>
                Docling found {plan.detectedPages} pages without readable text
                in{' '}
                <span className='font-medium text-foreground'>{file.name}</span>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-baseline justify-between gap-3'>
              <label
                htmlFor='ocr-vision-model'
                className='text-sm font-medium text-foreground'
              >
                Vision model
              </label>
              <span className='text-xs text-muted-foreground'>
                {remainingPages} {remainingPages === 1 ? 'page' : 'pages'}{' '}
                remaining
              </span>
            </div>
            <VisionModelSelect
              id='ocr-vision-model'
              models={visionModels?.models ?? []}
              value={modelIdentifier}
              onChange={setModelIdentifier}
              disabled={!visionModels || isSubmitting}
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='ocr-page-limit'
              className='text-sm font-medium text-foreground'
            >
              {isContinuation
                ? 'Additional pages this run'
                : 'Pages to transcribe'}
            </label>
            <Select
              value={String(pageLimit)}
              onValueChange={(value) => setPageLimit(Number(value))}
            >
              <SelectTrigger id='ocr-page-limit' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {isContinuation ? 'Next' : 'First'} {option} unfinished{' '}
                    {option === 1 ? 'page' : 'pages'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              A single run is limited to {plan.maxPageLimit} pages. Only the
              next unfinished page images are sent after you confirm.
            </p>
          </div>

          {isContinuation && (
            <div className='rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
              The saved Docling structure and all {plan.processedPages}{' '}
              completed page results will be reused. They will not be parsed or
              sent to the vision model again.
            </div>
          )}

          <div className='rounded-lg border border-primary/30 bg-primary/5 p-4'>
            <div className='flex items-baseline justify-between gap-4'>
              <span className='text-sm text-muted-foreground'>
                {isContinuation ? 'This run estimate' : 'Selected estimate'}
              </span>
              <span className='text-xl font-semibold text-foreground'>
                {formatEstimatedCost(estimate)}
              </span>
            </div>
            {plan.selectablePages !== pageLimit && (
              <div className='mt-2 flex items-baseline justify-between gap-4 border-t border-primary/15 pt-2 text-sm'>
                <span className='text-muted-foreground'>
                  All {plan.selectablePages} remaining pages allowed this run
                </span>
                <span className='font-medium text-foreground'>
                  {formatEstimatedCost(costPerPage * plan.selectablePages)}
                </span>
              </div>
            )}
            <p className='mt-2 text-xs text-muted-foreground'>
              Estimate based on the selected model and expected tokens per page.
              The final charge follows actual token usage.
            </p>
          </div>

          {deferredPages > 0 && (
            <p className='text-sm text-muted-foreground'>
              {deferredPages} scanned pages will remain after this run. You can
              continue again later without reprocessing completed pages.
            </p>
          )}

          {error && <p className='text-sm text-destructive'>{error}</p>}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Not now
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isContinuation ? 'Continue with next' : 'Transcribe'} {pageLimit}{' '}
            {pageLimit === 1 ? 'page' : 'pages'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OcrApprovalDialog
