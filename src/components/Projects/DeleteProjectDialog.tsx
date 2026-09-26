import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Project } from '@/redux/types/project'

interface Props {
  open: boolean
  /** Kept while closing so the content does not blank mid-animation. */
  project: Project | null
  onOpenChange: (open: boolean) => void
  onConfirm: (deleteConversations: boolean) => Promise<void>
}

const pluralizeChats = (count: number) =>
  `${count} ${count === 1 ? 'chat' : 'chats'}`

const DeleteConfirmBody = ({
  project,
  onConfirm,
  onClose,
}: {
  project: Project
  onConfirm: Props['onConfirm']
  onClose: () => void
}) => {
  const [deleteConversations, setDeleteConversations] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatCount = project.conversationCount

  const handleConfirm = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onConfirm(deleteConversations)
      onClose()
    } catch (rejection) {
      setError(
        typeof rejection === 'string' && rejection
          ? rejection
          : 'Could not delete the project. Try again.'
      )
      setDeleting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete “{project.name}”?</DialogTitle>
        <DialogDescription>
          {chatCount === 0
            ? 'The project has no chats. Its instructions and source list will be removed.'
            : deleteConversations
              ? `The project and its ${pluralizeChats(chatCount)} will be permanently deleted.`
              : `Its ${pluralizeChats(chatCount)} will move back to your main conversation list.`}
        </DialogDescription>
      </DialogHeader>

      {chatCount > 0 && (
        <div className='flex items-start gap-3 rounded-lg border border-border p-3'>
          <Checkbox
            id='delete-project-chats'
            checked={deleteConversations}
            onCheckedChange={(checked) =>
              setDeleteConversations(checked === true)
            }
            className='mt-0.5'
          />
          <Label
            htmlFor='delete-project-chats'
            className='flex flex-col gap-0.5 font-normal'
          >
            <span className='font-medium'>
              Also delete its {pluralizeChats(chatCount)}
            </span>
            <span className='text-muted-foreground'>
              This cannot be undone.
            </span>
          </Label>
        </div>
      )}

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant='outline' onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          variant='destructive'
          onClick={handleConfirm}
          disabled={deleting}
        >
          {deleting && <Loader2 className='h-4 w-4 animate-spin' />}
          {deleteConversations ? 'Delete project and chats' : 'Delete project'}
        </Button>
      </DialogFooter>
    </>
  )
}

const DeleteProjectDialog = ({
  open,
  project,
  onOpenChange,
  onConfirm,
}: Props) => (
  <Dialog open={open && project !== null} onOpenChange={onOpenChange}>
    <DialogContent className='max-w-md'>
      {project && (
        <DeleteConfirmBody
          project={project}
          onConfirm={onConfirm}
          onClose={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
)

export default DeleteProjectDialog
