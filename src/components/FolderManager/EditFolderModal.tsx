import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { updateFolder } from '../../redux/asyncThunks/file'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface EditFolderModalProps {
  isOpen: boolean
  onClose: () => void
  folder: { id: number; name: string } | null
}

const EditFolderModal = ({ isOpen, onClose, folder }: EditFolderModalProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const [folderName, setFolderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name)
    }
  }, [folder])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!folder || !folderName.trim()) return

    setIsSubmitting(true)
    try {
      await dispatch(
        updateFolder({ id: folder.id, name: folderName.trim() })
      ).unwrap()
      onClose()
      setFolderName('')
    } catch (error) {
      console.error('Failed to update folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClose()
    setFolderName('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Folder Name</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='folder-name'>Folder Name</Label>
            <Input
              id='folder-name'
              type='text'
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder='Enter folder name'
              required
              className='w-full'
              autoFocus
            />
          </div>

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!folderName.trim() || isSubmitting}
              className='bg-dark-blue text-white hover:bg-dark-blue-hovered'
            >
              {isSubmitting ? 'Updating...' : 'Update Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditFolderModal
