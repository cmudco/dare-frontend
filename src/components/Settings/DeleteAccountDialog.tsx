/**
 * DeleteAccountDialog
 *
 * Two steps on purpose: the first shows what is about to be lost, the second
 * asks the person to type the word. The export offer sits inside the first
 * step because that is the last moment it is still possible.
 */
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bot,
  Brain,
  Database,
  Download,
  GraduationCap,
  Loader2,
  MessagesSquare,
  Share2,
  Trash2,
  Workflow,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  deleteAccount,
  exportAccountData,
} from '@/redux/asyncThunks/accountData'
import { ExportScope } from '@/redux/types/accountData'
import { AppDispatch, RootState } from '@/redux/store'
import { toast } from '@/utils/toast'

const CONFIRMATION_PHRASE = 'DELETE'

const LOSSES = [
  {
    icon: MessagesSquare,
    title: 'Every conversation',
    description: 'Each question you asked and each answer you received.',
  },
  {
    icon: Brain,
    title: 'Everything DARE remembers',
    description: 'Your memory store and the profile written from it.',
  },
  {
    icon: Workflow,
    title: 'All your workflows',
    description: 'Every workflow you built, its steps and its run history.',
  },
  {
    icon: Bot,
    title: 'Every agent and prompt',
    description: 'The agents and prompt templates you configured.',
  },
  {
    icon: Share2,
    title: 'Everything you shared',
    description: 'Shared links stop working for everyone, immediately.',
  },
  {
    icon: GraduationCap,
    title: 'Your Socratic Books account',
    description: 'It rides on this account, so it goes too.',
  },
  {
    icon: Database,
    title: 'Everything vectorized',
    description: 'Uploaded files and every embedding computed from them.',
  },
]

const DeleteAccountDialog = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'review' | 'confirm'>('review')
  const [confirmation, setConfirmation] = useState('')
  const { deleting, exportingScope } = useSelector(
    (state: RootState) => state.accountData
  )

  const confirmed = confirmation.trim() === CONFIRMATION_PHRASE

  const reset = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setStep('review')
      setConfirmation('')
    }
  }

  const handleExportFirst = () => {
    dispatch(exportAccountData(ExportScope.FULL))
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteAccount(CONFIRMATION_PHRASE))
    if (deleteAccount.fulfilled.match(result)) {
      toast.success(result.payload.detail)
      result.payload.warnings.forEach((warning) => toast.info(warning))
      localStorage.clear()
      window.location.href = '/'
      return
    }
    toast.error(
      (result.payload as string) || 'Your account could not be deleted.'
    )
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button variant='destructive' className='justify-center gap-2'>
          <Trash2 className='h-4 w-4' />
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {step === 'review'
              ? 'Delete your account permanently'
              : 'Last chance'}
          </DialogTitle>
          <DialogDescription>
            {step === 'review'
              ? 'This cannot be undone. Here is what disappears.'
              : `Type ${CONFIRMATION_PHRASE} to erase your account and everything in it.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'review' ? (
          <div className='space-y-4'>
            <ul className='max-h-64 space-y-3 overflow-y-auto pr-1'>
              {LOSSES.map(({ icon: Icon, title, description }) => (
                <li key={title} className='flex gap-3'>
                  <Icon className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      {title}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className='rounded-lg border border-border p-3'>
              <p className='mb-2 text-sm text-muted-foreground'>
                You can take everything with you first, and restore it into a
                new account later.
              </p>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={handleExportFirst}
                disabled={exportingScope !== null}
              >
                {exportingScope === ExportScope.FULL ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Download className='h-4 w-4' />
                )}
                Export my data first
              </Button>
            </div>
          </div>
        ) : (
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={CONFIRMATION_PHRASE}
            aria-label={`Type ${CONFIRMATION_PHRASE} to confirm`}
            autoComplete='off'
          />
        )}

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={() => reset(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          {step === 'review' ? (
            <Button variant='destructive' onClick={() => setStep('confirm')}>
              Continue
            </Button>
          ) : (
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={!confirmed || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting
                </>
              ) : (
                'Delete my account'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAccountDialog
