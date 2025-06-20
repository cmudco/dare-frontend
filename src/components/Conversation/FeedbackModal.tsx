import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: string) => void
  isLike?: boolean
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLike = false,
}) => {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(feedback)
    setFeedback('')
    onClose()
  }

  const handleClose = () => {
    setFeedback('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            {isLike
              ? 'Help us improve by sharing what you liked about this response.'
              : "Help us improve by sharing why you didn't like this response."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='feedback'>Your feedback (Optional)</Label>
            <Textarea
              id='feedback'
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                isLike
                  ? 'Please share what you liked to help us continue providing great responses...'
                  : 'Please share your feedback to help us improve...'
              }
              rows={4}
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit'>Submit Feedback</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackModal
