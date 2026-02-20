import { useMemo, useState, useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { FileStatus } from '@/utils/constants/file'
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

interface BatchFileSelectDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (fileIds: number[]) => void
  isRunning: boolean
}

export default function BatchFileSelectDialog({
  isOpen,
  onClose,
  onConfirm,
  isRunning,
}: BatchFileSelectDialogProps) {
  const files = useAppSelector((s) => s.files.files)
  const user = useAppSelector((s) => s.user.user)

  const eligibleFiles = useMemo(() => {
    if (!user || user.vectorDb === undefined) {
      return []
    }

    return files.filter((file) => {
      const isProcessed = file.status === FileStatus.PROCESSED
      const isNotMedia = !file.isMedia
      const matchesVectorDb =
        file.vectorDbSource === undefined ||
        file.vectorDbSource === user.vectorDb
      return isProcessed && isNotMedia && matchesVectorDb
    })
  }, [files, user])

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([])
    }
  }, [isOpen])

  const allSelected =
    eligibleFiles.length > 0 && selectedIds.length === eligibleFiles.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleFiles.map((file) => file.id))
    }
  }

  const toggleFile = (fileId: number) => {
    if (selectedIds.includes(fileId)) {
      setSelectedIds(selectedIds.filter((id) => id !== fileId))
    } else {
      setSelectedIds([...selectedIds, fileId])
    }
  }

  const handleConfirm = () => {
    if (selectedIds.length === 0) return
    onConfirm(selectedIds)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Run Batch</DialogTitle>
          <DialogDescription>
            Select processed files to run this workflow once per file.
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4 rounded-lg border border-border'>
          <div className='flex items-center justify-between border-b border-border px-4 py-3'>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                disabled={eligibleFiles.length === 0}
              />
              <span className='text-sm font-medium'>Select all</span>
            </div>
            <span className='text-xs text-muted-foreground'>
              {selectedIds.length} selected
            </span>
          </div>

          <div className='max-h-[50vh] overflow-y-auto'>
            {eligibleFiles.length === 0 ? (
              <div className='flex flex-col items-center justify-center px-4 py-12 text-center text-sm text-muted-foreground'>
                <p>No eligible files found.</p>
                <p>
                  Only processed, non-media files are available for batch runs.
                </p>
              </div>
            ) : (
              <ul className='divide-y divide-border'>
                {eligibleFiles.map((file) => {
                  const checked = selectedIds.includes(file.id)
                  return (
                    <li
                      key={file.id}
                      className='flex items-center justify-between px-4 py-3'
                    >
                      <div className='flex items-center gap-3'>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleFile(file.id)}
                        />
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {file.name || 'Untitled file'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {file.fileType || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {Math.round(file.size / 1024)} KB
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className='mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-0'>
          <p className='text-xs text-muted-foreground'>
            Selected files will run sequentially in the background.
          </p>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0 || isRunning}
            >
              Run Batch ({selectedIds.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
