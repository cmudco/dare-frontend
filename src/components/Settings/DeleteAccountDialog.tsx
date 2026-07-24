import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bot,
  Database,
  Download,
  GraduationCap,
  Loader2,
  MessagesSquare,
  Share2,
  ShieldAlert,
  Trash2,
  Workflow,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { deleteAccount } from '@/redux/asyncThunks/accountDeletion'
import { downloadDataExport } from '@/redux/asyncThunks/dataExport'
import { AppDispatch, RootState } from '@/redux/store'
import { DataExportScope } from '@/utils/constants/dataExport'

const CONFIRMATION_PHRASE = 'DELETE'

interface DeletionItem {
  icon: typeof MessagesSquare
  title: string
  description: string
}

const deletionItems: DeletionItem[] = [
  {
    icon: MessagesSquare,
    title: 'Every conversation',
    description:
      'Each question you asked, each answer you received — every thread, gone in full.',
  },
  {
    icon: Share2,
    title: 'Everything you shared',
    description:
      'Shared conversations and links stop working for everyone, everywhere, instantly.',
  },
  {
    icon: Workflow,
    title: 'All your workflows',
    description:
      'Each workflow you built — steps, runs, and their entire history — dismantled.',
  },
  {
    icon: Bot,
    title: 'Every agent',
    description:
      'The agents you configured and taught are permanently retired.',
  },
  {
    icon: GraduationCap,
    title: 'Your Socratic Bots account',
    description:
      'It rides on this account — tutoring history and all, it goes too.',
  },
  {
    icon: Database,
    title: 'Everything vectorized',
    description:
      'Uploaded files and every embedding computed from them, wiped from the vector store.',
  },
]

const DeleteAccountDialog = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'review' | 'confirm'>('review')
  const [confirmation, setConfirmation] = useState('')
  const { deleting } = useSelector((state: RootState) => state.accountDeletion)
  const { fullDownloading } = useSelector(
    (state: RootState) => state.dataExport
  )

  const confirmed = confirmation.trim() === CONFIRMATION_PHRASE

  const handleOpenChange = (nextOpen: boolean) => {
    if (deleting) return
    setOpen(nextOpen)
    if (!nextOpen) {
      setStep('review')
      setConfirmation('')
    }
  }

  const handleExport = async () => {
    const result = await dispatch(downloadDataExport(DataExportScope.FULL))
    if (downloadDataExport.fulfilled.match(result)) {
      toast({
        title: 'Export downloaded',
        description: `${result.payload.filename} — keep it somewhere safe.`,
      })
      return
    }
    toast({
      title: 'Export failed',
      description:
        (result.payload as string) || 'Unable to download your data export.',
      variant: 'destructive',
    })
  }

  const handleDelete = async () => {
    if (!confirmed) return
    const result = await dispatch(deleteAccount(CONFIRMATION_PHRASE))
    if (deleteAccount.fulfilled.match(result)) {
      window.location.assign('/login')
      return
    }
    toast({
      title: 'Deletion failed',
      description:
        (result.payload as string) ||
        'Your account was not deleted. Nothing has been removed.',
      variant: 'destructive',
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300'
        >
          <Trash2 className='h-4 w-4' />
          Delete My Account
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        {step === 'review' ? (
          <>
            <DialogHeader>
              <div className='mx-auto mb-2 rounded-full bg-red-50 p-3 dark:bg-red-900/20'>
                <ShieldAlert className='h-7 w-7 text-red-600 dark:text-red-400' />
              </div>
              <DialogTitle className='text-center text-xl'>
                This is the end of the line
              </DialogTitle>
              <DialogDescription className='text-center'>
                Deleting your account erases everything you have ever made here.
                Here is exactly what leaves with you:
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-2'>
              {deletionItems.map((item) => (
                <div
                  key={item.title}
                  className='flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3'
                >
                  <div className='mt-0.5 rounded-md bg-red-50 p-1.5 dark:bg-red-900/20'>
                    <item.icon className='h-4 w-4 text-red-600 dark:text-red-400' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      {item.title}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className='rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'>
              This is not a soft delete. There is no trash can, no 30-day grace
              period, no undo. When we say deleted, we mean expunged.
            </p>

            <div className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
              <Button
                variant='outline'
                onClick={handleExport}
                disabled={fullDownloading || deleting}
                className='justify-center gap-2'
              >
                {fullDownloading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Download className='h-4 w-4' />
                )}
                Export my data first
              </Button>
              <Button
                variant='destructive'
                onClick={() => setStep('confirm')}
                className='justify-center gap-2'
              >
                I understand, continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='text-xl'>
                Last chance to turn back
              </DialogTitle>
              <DialogDescription>
                Type <span className='font-mono font-semibold'>DELETE</span> to
                confirm you want your account and everything in it gone forever.
              </DialogDescription>
            </DialogHeader>

            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder='Type DELETE to confirm'
              autoFocus
              disabled={deleting}
            />

            <div className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
              <Button
                variant='outline'
                onClick={() => {
                  setStep('review')
                  setConfirmation('')
                }}
                disabled={deleting}
                className='justify-center'
              >
                Go back
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={!confirmed || deleting}
                className='justify-center gap-2'
              >
                {deleting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
                Delete everything, forever
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAccountDialog
