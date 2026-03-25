import React, { useState } from 'react'
import { Share2, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { closeShareDialog } from '@/redux/sharingSlice'
import { shareItem } from '@/redux/asyncThunks/sharing'
import { toast } from '@/utils/toast'

const ShareDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const { shareDialogOpen, shareDialogEntity, loading, lastShareResult } =
    useAppSelector((state) => state.sharing)

  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const handleClose = () => {
    setEmailInput('')
    setEmails([])
    setMessage('')
    dispatch(closeShareDialog())
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase()
    if (trimmed && isValidEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed])
      setEmailInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault()
      addEmail()
    }
    if (e.key === 'Backspace' && !emailInput && emails.length > 0) {
      setEmails(emails.slice(0, -1))
    }
  }

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email))
  }

  const handleShare = async () => {
    let finalEmails = [...emails]
    const trimmed = emailInput.trim().toLowerCase()

    if (trimmed && !isValidEmail(trimmed)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (trimmed && !finalEmails.includes(trimmed)) {
      finalEmails = [...finalEmails, trimmed]
    }

    if (finalEmails.length === 0) {
      toast.error('Please enter at least one email address.')
      return
    }

    if (!shareDialogEntity) return

    try {
      const result = await dispatch(
        shareItem({
          contentType: shareDialogEntity.type,
          objectId: shareDialogEntity.id,
          emails: finalEmails,
          message,
        })
      ).unwrap()

      if (result.shared.length > 0) {
        toast.success(
          `Shared with ${result.shared.length} user${result.shared.length > 1 ? 's' : ''} successfully.`
        )
      }

      if (result.failed.length > 0 && result.shared.length === 0) {
        toast.error(result.failed[0]?.reason || 'Failed to share item.')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to share item.')
    }
  }

  if (!shareDialogEntity) return null

  const entityLabel =
    shareDialogEntity.type.charAt(0).toUpperCase() +
    shareDialogEntity.type.slice(1)

  return (
    <Dialog open={shareDialogOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Share2 className='h-5 w-5 text-primary' />
            Share {entityLabel}
          </DialogTitle>
          <DialogDescription>
            Share{' '}
            <span className='font-semibold text-foreground'>
              &ldquo;{shareDialogEntity.title}&rdquo;
            </span>{' '}
            with specific users by entering their email addresses.
          </DialogDescription>
        </DialogHeader>

        {!lastShareResult ? (
          <div className='space-y-4 py-4'>
            {/* Email input with tags */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-foreground'>
                Email addresses
              </label>
              <div className='flex min-h-[42px] flex-wrap gap-1.5 rounded-md border border-input bg-background p-2 focus-within:ring-1 focus-within:ring-ring'>
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {email}
                    <button
                      type='button'
                      onClick={() => removeEmail(email)}
                      className='ml-0.5 rounded-full hover:bg-muted-foreground/20'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
                <Input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={addEmail}
                  placeholder={
                    emails.length === 0 ? 'Enter email and press Enter' : ''
                  }
                  className='min-w-[180px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0'
                />
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                Press Enter, comma, or space to add an email
              </p>
            </div>

            {/* Optional message */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-foreground'>
                Message (optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Add a note for the recipients...'
                rows={2}
                maxLength={500}
              />
            </div>
          </div>
        ) : (
          /* Results display */
          <div className='space-y-3 py-4'>
            {lastShareResult.shared.length > 0 && (
              <div className='space-y-1.5'>
                <p className='text-sm font-medium text-green-600'>
                  Successfully shared with:
                </p>
                {lastShareResult.shared.map((s) => (
                  <div
                    key={s.email}
                    className='flex items-center gap-2 text-sm text-muted-foreground'
                  >
                    <Check className='h-4 w-4 text-green-600' />
                    {s.email}
                  </div>
                ))}
              </div>
            )}
            {lastShareResult.failed.length > 0 && (
              <div className='space-y-1.5'>
                <p className='text-sm font-medium text-destructive'>Failed:</p>
                {lastShareResult.failed.map((f) => (
                  <div
                    key={f.email}
                    className='flex items-center gap-2 text-sm text-muted-foreground'
                  >
                    <AlertCircle className='h-4 w-4 text-destructive' />
                    {f.email} — {f.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {lastShareResult ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={
                  loading || (emails.length === 0 && !emailInput.trim())
                }
              >
                {loading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Share2 className='mr-2 h-4 w-4' />
                )}
                Share
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShareDialog
