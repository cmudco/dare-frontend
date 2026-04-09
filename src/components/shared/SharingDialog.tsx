import React, { useState, useEffect } from 'react'
import {
  Share2,
  X,
  Loader2,
  Users,
  Trash2,
  Globe,
  Lock,
  UsersRound,
  ChevronDown,
  ChevronUp,
  UserX,
} from 'lucide-react'
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
import { Switch } from '../ui/switch'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { closeSharing } from '@/redux/sharingSlice'
import {
  fetchMyGroup,
  shareItem,
  shareWithGroup,
  fetchRecipients,
  revokeShare,
  toggleEntityVisibility,
} from '@/redux/asyncThunks/sharing'
import { toast } from '@/utils/toast'

const SharingDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    isOpen,
    entity,
    loading,
    recipients,
    recipientsLoading,
    groupInfo,
    groupInfoLoading,
  } = useAppSelector((state) => state.sharing)

  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'share' | 'manage'>('share')
  const [groupExpanded, setGroupExpanded] = useState(false)

  useEffect(() => {
    if (isOpen && entity) {
      dispatch(
        fetchRecipients({
          type: entity.type,
          objectId: entity.id,
        })
      )
      dispatch(fetchMyGroup())
    }
  }, [isOpen, entity, dispatch])

  const hasGroup = groupInfo?.hasGroup ?? false

  const handleClose = () => {
    setEmailInput('')
    setEmails([])
    setMessage('')
    setActiveTab('share')
    setGroupExpanded(false)
    dispatch(closeSharing())
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

    if (!entity) return

    try {
      const result = await dispatch(
        shareItem({
          contentType: entity.type,
          objectId: entity.id,
          emails: finalEmails,
          message,
        })
      ).unwrap()

      if (result.shared.length > 0) {
        toast.success(
          `Shared with ${result.shared.length} user${result.shared.length > 1 ? 's' : ''} successfully.`
        )
        // Refresh recipients list
        dispatch(
          fetchRecipients({
            type: entity.type,
            objectId: entity.id,
          })
        )
      }

      if (result.failed.length > 0 && result.shared.length === 0) {
        toast.error(result.failed[0]?.reason || 'Failed to share item.')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to share item.')
    }
  }

  const handleShareWithGroup = async () => {
    if (!entity) return
    try {
      await dispatch(
        shareWithGroup({
          contentType: entity.type,
          objectId: entity.id,
          message,
        })
      ).unwrap()
      toast.success('Shared with your access code group.')
      dispatch(fetchRecipients({ type: entity.type, objectId: entity.id }))
    } catch (error) {
      toast.error((error as Error).message || 'Failed to share with group.')
    }
  }

  const handleToggleVisibility = async () => {
    if (!entity) return
    try {
      await dispatch(toggleEntityVisibility(entity)).unwrap()
      toast.success(
        `${entityLabel} is now ${!entity.isPublished ? 'Public' : 'Private'}`
      )
    } catch (error) {
      toast.error((error as Error).message || 'Failed to update visibility')
    }
  }

  const handleRevoke = async (shareId: number, email: string) => {
    try {
      await dispatch(revokeShare(shareId)).unwrap()
      toast.success(`Revoked access for ${email}`)
    } catch {
      toast.error('Failed to revoke access.')
    }
  }

  if (!entity) return null

  const entityLabel = entity.type.charAt(0).toUpperCase() + entity.type.slice(1)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Share2 className='h-5 w-5 text-primary' />
            Access for {entity.title || 'Untitled'}
          </DialogTitle>
          <DialogDescription>
            Manage who can view and edit this {entity.type}.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* ── Tier 1: General Access ── */}
          <div className='flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-full bg-background p-2'>
                {entity.isPublished ? (
                  <Globe className='h-5 w-5 text-blue-500' />
                ) : (
                  <Lock className='h-5 w-5 text-muted-foreground' />
                )}
              </div>
              <div>
                <p className='text-sm font-semibold'>General Access</p>
                <p className='text-xs text-muted-foreground'>
                  {entity.isPublished
                    ? 'Anyone in the library can find and use this.'
                    : 'Only you and invited collaborators can access.'}
                </p>
              </div>
            </div>
            {entity.canPublish !== false && (
              <Switch
                checked={entity.isPublished}
                onCheckedChange={handleToggleVisibility}
                disabled={loading}
              />
            )}
          </div>

          {/* ── Tier 2: Access Code Group ── */}
          <div className='rounded-lg border border-border bg-muted/30'>
            <div className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-background p-2'>
                  {hasGroup ? (
                    <UsersRound className='h-5 w-5 text-primary' />
                  ) : (
                    <UserX className='h-5 w-5 text-muted-foreground' />
                  )}
                </div>
                <div>
                  <p className='text-sm font-semibold'>Access Code Group</p>
                  {groupInfoLoading ? (
                    <p className='text-xs text-muted-foreground'>Loading...</p>
                  ) : hasGroup ? (
                    <p className='text-xs text-muted-foreground'>
                      <span className='font-medium text-foreground'>
                        {groupInfo!.group!.accessCode}
                      </span>
                      {' · '}
                      {groupInfo!.group!.memberCount} member
                      {groupInfo!.group!.memberCount !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className='text-xs text-muted-foreground'>
                      You are not part of an access code group.
                    </p>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {hasGroup && (
                  <>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setGroupExpanded(!groupExpanded)}
                      className='text-muted-foreground'
                    >
                      {groupExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleShareWithGroup}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <UsersRound className='mr-1.5 h-4 w-4' />
                      )}
                      Share with Group
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Expandable member list */}
            {hasGroup && groupExpanded && (
              <div className='border-t border-border px-4 pb-3 pt-2'>
                <p className='mb-2 text-xs font-medium text-muted-foreground'>
                  Group Members
                </p>
                {groupInfo!.members.length === 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    No other members in this group yet.
                  </p>
                ) : (
                  <div className='max-h-[150px] space-y-1.5 overflow-y-auto'>
                    {groupInfo!.members.map((member) => (
                      <div
                        key={member.email}
                        className='flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50'
                      >
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary'>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-xs font-medium'>
                            {member.name}
                          </p>
                          <p className='truncate text-[10px] text-muted-foreground'>
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='border-t border-border' />

          {/* ── Tier 3: Individual People ── */}
          {/* Tabs for Sharing vs Managing */}
          <div className='flex border-b border-border'>
            <button
              onClick={() => setActiveTab('share')}
              className={`pb-2 pr-4 text-sm font-medium transition-colors ${
                activeTab === 'share'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Share with People
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Who has access ({recipients.length})
            </button>
          </div>

          {activeTab === 'share' ? (
            <div className='space-y-4'>
              {/* Email input with tags */}
              <div>
                <label className='mb-1.5 block text-sm font-medium'>
                  Add collaborators
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
                  Individual access grants permission even if not published.
                </p>
              </div>

              {/* Optional message */}
              <div>
                <label className='mb-1.5 block text-sm font-medium'>
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

              <div className='flex justify-end pt-2'>
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
                  Send Invites
                </Button>
              </div>
            </div>
          ) : (
            /* Manage Recipients Section */
            <div className='space-y-4'>
              {recipientsLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
              ) : recipients.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center text-muted-foreground'>
                  <Users className='mb-2 h-8 w-8 opacity-20' />
                  <p className='text-sm'>
                    Not shared with any individuals yet.
                  </p>
                </div>
              ) : (
                <div className='max-h-[300px] space-y-2 overflow-y-auto px-1'>
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className='flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted/30'
                    >
                      <div className='flex items-center gap-2'>
                        {recipient.isGroupShare ? (
                          <UsersRound className='h-4 w-4 shrink-0 text-primary' />
                        ) : null}
                        <div>
                          <p className='text-sm font-medium'>
                            {recipient.isGroupShare
                              ? `Access code group: ${recipient.groupAccessCode}`
                              : recipient.email}
                          </p>
                          <p className='text-[10px] text-muted-foreground'>
                            Shared on{' '}
                            {new Date(recipient.sharedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          handleRevoke(
                            recipient.id,
                            recipient.isGroupShare
                              ? `group ${recipient.groupAccessCode}`
                              : (recipient.email ?? '')
                          )
                        }
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                        disabled={loading}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className='border-t border-border pt-4'>
          <Button variant='outline' onClick={handleClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SharingDialog
