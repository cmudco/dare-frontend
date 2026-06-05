import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

const ReviewReasonDialog = ({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: Props) => {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder='Add the reason you want preserved with this review state.'
          rows={4}
        />
        <DialogFooter>
          <Button
            variant='outline'
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => onConfirm(reason.trim())}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewReasonDialog
