import React, { useState, useEffect } from 'react'
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
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    feedback: string,
    source: 'thumbs' | 'manual' | 'auto',
    thumbSelection?: boolean
  ) => void
  isLike?: boolean
  source: 'thumbs' | 'manual' | 'auto'
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLike,
  source,
}) => {
  const [feedback, setFeedback] = useState('')
  const [selectedThumb, setSelectedThumb] = useState<boolean | undefined>(
    isLike
  )

  useEffect(() => {
    setSelectedThumb(isLike)
  }, [isLike])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(feedback, source, selectedThumb)
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
            {isLike === true
              ? 'Help us improve by sharing what you liked about this response.'
              : isLike === false
                ? "Help us improve by sharing why you didn't like this response."
                : 'Help us improve by sharing your thoughts about this response.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {isLike === undefined && (
            <div className='space-y-2'>
              <Label>How would you rate this response? (Optional)</Label>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    setSelectedThumb(selectedThumb === true ? undefined : true)
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded border p-3 transition-colors ${
                    selectedThumb === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <ThumbsUp className='h-4 w-4' />
                  <span>Helpful</span>
                </button>
                <button
                  type='button'
                  onClick={() =>
                    setSelectedThumb(
                      selectedThumb === false ? undefined : false
                    )
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded border p-3 transition-colors ${
                    selectedThumb === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <ThumbsDown className='h-4 w-4' />
                  <span>Not Helpful</span>
                </button>
              </div>
            </div>
          )}
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
