import { useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getTags, removeTag } from '@/redux/asyncThunks/tag'
import { getTagColor } from '@/utils/files'
import { toast } from '@/utils/toast'

interface ManageTagsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Every tag with how many files use it; the user's own tags can be deleted. */
const ManageTagsDialog = ({ open, onOpenChange }: ManageTagsDialogProps) => {
  const dispatch = useAppDispatch()
  const tags = useAppSelector((state) => state.tags.tags)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // File counts change with every tag, untag and delete; show current ones.
  useEffect(() => {
    if (open) dispatch(getTags())
  }, [open, dispatch])

  const handleDelete = async (id: number, label: string) => {
    setDeletingId(id)
    try {
      await dispatch(removeTag(id)).unwrap()
      toast.success(`Deleted the tag “${label}”`)
    } catch {
      toast.error(`Couldn't delete “${label}”.`)
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmingId(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Manage tags</DialogTitle>
          <DialogDescription>
            Deleting a tag takes it off every file. The files themselves stay.
          </DialogDescription>
        </DialogHeader>
        {tags.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            No tags yet.
          </p>
        ) : (
          <ul className='-mx-1 max-h-80 divide-y divide-border overflow-y-auto'>
            {tags.map((tag) => {
              const confirming = confirmingId === tag.id
              const count = tag.fileCount ?? 0
              return (
                <li key={tag.id} className='flex items-center gap-2 px-1 py-2'>
                  <Badge
                    variant={getTagColor(tag.label)}
                    selected={true}
                    className='max-w-[55%] truncate text-xs'
                  >
                    {tag.label}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>
                    {count} {count === 1 ? 'file' : 'files'}
                  </span>
                  <div className='ml-auto flex items-center gap-1'>
                    {tag.user === null ? (
                      <span className='text-xs text-muted-foreground'>
                        Shared
                      </span>
                    ) : confirming ? (
                      <>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 text-xs'
                          disabled={deletingId !== null}
                          onClick={() => setConfirmingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          className='h-7 text-xs'
                          disabled={deletingId !== null}
                          onClick={() => handleDelete(tag.id, tag.label)}
                        >
                          {deletingId === tag.id && (
                            <Loader2 className='h-3 w-3 animate-spin' />
                          )}
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-destructive'
                        aria-label={`Delete tag ${tag.label}`}
                        onClick={() => setConfirmingId(tag.id)}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ManageTagsDialog
