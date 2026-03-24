import React, { useEffect } from 'react'
import { Users, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { closeManageDialog } from '@/redux/sharingSlice'
import { fetchRecipients, revokeShare } from '@/redux/asyncThunks/sharing'
import { toast } from '@/utils/toast'

const ManageSharesDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    manageDialogOpen,
    manageDialogEntity,
    recipients,
    recipientsLoading,
  } = useAppSelector((state) => state.sharing)

  useEffect(() => {
    if (manageDialogOpen && manageDialogEntity) {
      dispatch(
        fetchRecipients({
          type: manageDialogEntity.type,
          objectId: manageDialogEntity.id,
        })
      )
    }
  }, [manageDialogOpen, manageDialogEntity, dispatch])

  const handleClose = () => {
    dispatch(closeManageDialog())
  }

  const handleRevoke = async (shareId: number, email: string) => {
    try {
      await dispatch(revokeShare(shareId)).unwrap()
      toast.success(`Revoked access for ${email}`)
    } catch {
      toast.error('Failed to revoke access.')
    }
  }

  if (!manageDialogEntity) return null

  const entityLabel =
    manageDialogEntity.type.charAt(0).toUpperCase() +
    manageDialogEntity.type.slice(1)

  return (
    <Dialog open={manageDialogOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-primary' />
            Manage Sharing
          </DialogTitle>
          <DialogDescription>
            Users who have access to{' '}
            <span className='font-semibold text-foreground'>
              &ldquo;{manageDialogEntity.title}&rdquo;
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          {recipientsLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : recipients.length === 0 ? (
            <p className='py-4 text-center text-sm text-muted-foreground'>
              This {entityLabel.toLowerCase()} hasn&apos;t been shared with
              anyone yet.
            </p>
          ) : (
            <div className='space-y-2'>
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className='flex items-center justify-between rounded-md border border-border p-2.5'
                >
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      {recipient.email}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Shared {new Date(recipient.sharedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleRevoke(recipient.id, recipient.email)}
                    className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManageSharesDialog
