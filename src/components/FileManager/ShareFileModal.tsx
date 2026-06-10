import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import { closeShareModal } from '../../redux/fileSlice'
import {
  shareFileWithUser,
  togglePublicShare,
} from '../../redux/asyncThunks/file'
import { getFileSharesAPI, unshareFileAPI, FileShare } from '../../api/files'
import { toast } from '@/utils/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Globe, Send, Users, X, Loader2 } from 'lucide-react'

const ShareFileModal = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { shareModalFileId, shareModalFileName, files } = useSelector(
    (state: RootState) => state.files
  )

  const currentFile = files.find((f) => f.id === shareModalFileId)
  const isSharedPublicly = currentFile?.isSharedPublicly ?? false

  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTogglingPublic, setIsTogglingPublic] = useState(false)
  const [shares, setShares] = useState<FileShare[]>([])
  const [sharesLoading, setSharesLoading] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)

  const isOpen = shareModalFileId !== null

  // Fetch existing shares whenever the modal opens for a file
  useEffect(() => {
    if (!shareModalFileId) {
      setShares([])
      return
    }
    const fetchShares = async () => {
      setSharesLoading(true)
      try {
        const response = await getFileSharesAPI(shareModalFileId)
        setShares(response.shares)
      } catch {
        // Silently fail — shares list is non-critical
      } finally {
        setSharesLoading(false)
      }
    }
    fetchShares()
  }, [shareModalFileId])

  const handleClose = () => {
    setEmail('')
    setShares([])
    dispatch(closeShareModal())
  }

  const handlePublicToggle = async (checked: boolean) => {
    if (!shareModalFileId) return
    setIsTogglingPublic(true)
    try {
      await dispatch(
        togglePublicShare({
          fileId: shareModalFileId,
          shareWithEveryone: checked,
        })
      ).unwrap()
      toast.success(
        checked
          ? `"${shareModalFileName}" is now shared with everyone`
          : `"${shareModalFileName}" is no longer public`
      )
    } catch {
      toast.error('Failed to update sharing settings')
    } finally {
      setIsTogglingPublic(false)
    }
  }

  const handleSend = async () => {
    if (!email.trim() || !shareModalFileId) return
    const trimmedEmail = email.trim()
    setIsSending(true)
    try {
      await dispatch(
        shareFileWithUser({ fileId: shareModalFileId, email: trimmedEmail })
      ).unwrap()
      toast.success(`"${shareModalFileName}" shared with ${trimmedEmail}`)
      // Optimistically add to the shares list if not already present
      setShares((prev) =>
        prev.some((s) => s.email === trimmedEmail)
          ? prev
          : [
              ...prev,
              { id: Date.now(), email: trimmedEmail, name: trimmedEmail },
            ]
      )
      setEmail('')
    } catch {
      toast.error('Failed to share file. Please check the email address.')
    } finally {
      setIsSending(false)
    }
  }

  const handleUnshare = async (shareEmail: string) => {
    if (!shareModalFileId) return
    setRemovingEmail(shareEmail)
    try {
      await unshareFileAPI(shareModalFileId, shareEmail)
      setShares((prev) => prev.filter((s) => s.email !== shareEmail))
      toast.success(`Access removed for ${shareEmail}`)
    } catch {
      toast.error(`Failed to remove access for ${shareEmail}`)
    } finally {
      setRemovingEmail(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  const getInitials = (share: FileShare) => {
    if (share.name && share.name !== share.email) {
      return share.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return share.email[0].toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-primary' />
            Share &quot;{shareModalFileName}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3 pt-2'>
          {/* Share with everyone toggle */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <Globe className='h-5 w-5 text-muted-foreground' />
              <span className='text-sm font-medium'>Share with everyone</span>
            </div>
            <Switch
              checked={isSharedPublicly}
              onCheckedChange={handlePublicToggle}
              disabled={isTogglingPublic}
            />
          </div>

          {/* Share with specific user by email */}
          <div className='flex items-center gap-2'>
            <Input
              type='email'
              placeholder='Enter email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className='flex-1'
              disabled={isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!email.trim() || isSending}
              className='shrink-0 bg-primary hover:bg-primary/90'
              size='icon'
            >
              {isSending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </div>

          {/* Current shares list */}
          {sharesLoading ? (
            <div className='flex items-center justify-center py-3 text-sm text-muted-foreground'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loading shares...
            </div>
          ) : shares.length > 0 ? (
            <div className='flex flex-col gap-1.5'>
              <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                Shared with
              </p>
              <div className='flex max-h-44 flex-col gap-0.5 overflow-y-auto rounded-lg border p-1.5'>
                {shares.map((share) => (
                  <div
                    key={share.email}
                    className='flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted'
                  >
                    <div className='flex min-w-0 items-center gap-2'>
                      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted-foreground text-xs font-semibold text-background'>
                        {getInitials(share)}
                      </div>
                      <div className='min-w-0'>
                        {share.name && share.name !== share.email && (
                          <p className='truncate text-sm font-medium'>
                            {share.name}
                          </p>
                        )}
                        <p className='truncate text-xs text-muted-foreground'>
                          {share.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 shrink-0 text-muted-foreground hover:text-red-500'
                      disabled={removingEmail === share.email}
                      onClick={() => handleUnshare(share.email)}
                    >
                      {removingEmail === share.email ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <X className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareFileModal
