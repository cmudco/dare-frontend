import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, RotateCcw, Loader2, ImagePlus } from 'lucide-react'

import { AppDispatch, RootState } from '@/redux/store'
import { updateUserProfile } from '@/redux/asyncThunks/user'
import { uploadProfilePicture } from '@/api/auth'
import { Avatar } from '@/components/Layout/Avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { AvatarType } from '@/utils/constants/user'
import { cn } from '@/lib/utils'

// Available preset avatars - these should match files in /public/avatars/
const PRESET_AVATARS = [
  { id: 'avatar-1', label: 'Professional' },
  { id: 'avatar-2', label: 'Glasses' },
  { id: 'avatar-3', label: 'Wavy Hair' },
  { id: 'avatar-4', label: 'Beard' },
  { id: 'avatar-5', label: 'Curly' },
  { id: 'avatar-6', label: 'Hoodie' },
  { id: 'avatar-7', label: 'Friendly' },
  { id: 'avatar-8', label: 'Headphones' },
  { id: 'avatar-9', label: 'Bob Cut' },
  { id: 'avatar-10', label: 'Mohawk' },
  { id: 'avatar-11', label: 'Braids' },
  { id: 'avatar-12', label: 'Cap' },
]

const AvatarSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user.user)
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    user?.avatarPreset || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentAvatarType = user?.avatarType || AvatarType.INITIALS
  const hasCustomAvatar = user?.avatarUrl && user.avatarUrl.length > 0

  const handleSelectPreset = async (presetId: string) => {
    setLoading(true)
    setSelectedPreset(presetId)

    try {
      await dispatch(
        updateUserProfile({
          avatarType: AvatarType.PRESET,
          avatarPreset: presetId,
        })
      ).unwrap()
      toast.success('Avatar updated!')
    } catch (error) {
      console.error('Failed to update avatar:', error)
      toast.error('Failed to update avatar. Please try again.')
      setSelectedPreset(user?.avatarPreset || null)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustom = async () => {
    if (!user?.avatarUrl) return

    setLoading(true)
    setSelectedPreset(null)

    try {
      await dispatch(
        updateUserProfile({
          avatarType: AvatarType.CUSTOM,
        })
      ).unwrap()
      toast.success('Avatar updated!')
    } catch (error) {
      console.error('Failed to select custom avatar:', error)
      toast.error('Failed to update avatar. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetToInitials = async () => {
    setLoading(true)
    setSelectedPreset(null)

    try {
      await dispatch(
        updateUserProfile({
          avatarType: AvatarType.INITIALS,
          avatarPreset: null,
        })
      ).unwrap()
      toast.success('Reset to initials!')
    } catch (error) {
      console.error('Failed to reset avatar:', error)
      toast.error('Failed to reset avatar. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const result = await uploadProfilePicture(formData)

      // Update Redux state with new avatar
      await dispatch(
        updateUserProfile({
          avatarType: AvatarType.CUSTOM,
          avatarUrl: result.avatar_url,
        })
      ).unwrap()

      setSelectedPreset(null)
      toast.success('Avatar uploaded!')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const isLoading = loading || uploadLoading

  return (
    <Card className='p-6'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold text-foreground'>Avatar</h3>
          <p className='text-sm text-muted-foreground'>
            Choose how you appear across the platform
          </p>
        </div>

        {/* Current Avatar Preview */}
        <div className='flex items-center gap-4'>
          <Avatar user={user} size='xl' />
          <div>
            <p className='text-sm font-medium text-foreground'>
              {user?.name || 'User'}
            </p>
            <p className='text-xs text-muted-foreground'>
              {currentAvatarType === AvatarType.INITIALS
                ? 'Using initials'
                : currentAvatarType === AvatarType.PRESET
                  ? 'Using preset avatar'
                  : 'Using custom avatar'}
            </p>
          </div>
        </div>

        {/* Avatar Library */}
        <div className='space-y-3'>
          <p className='text-sm font-medium text-foreground'>Avatar Library</p>
          <div className='flex flex-wrap gap-3'>
            {/* Upload New Button */}
            <button
              onClick={handleUploadClick}
              disabled={isLoading}
              className={cn(
                'group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
              title='Upload new avatar'
            >
              <div className='relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/50 transition-colors group-hover:border-primary/50 group-hover:bg-muted'>
                {uploadLoading ? (
                  <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                ) : (
                  <ImagePlus className='h-5 w-5 text-muted-foreground group-hover:text-primary' />
                )}
              </div>
              <span className='text-[10px] text-muted-foreground'>
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </span>
            </button>

            {/* User's Custom Upload (if exists) */}
            {hasCustomAvatar && (
              <button
                onClick={handleSelectCustom}
                disabled={isLoading}
                className={cn(
                  'group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  currentAvatarType === AvatarType.CUSTOM &&
                    'bg-muted ring-2 ring-primary ring-offset-2',
                  isLoading && 'cursor-not-allowed opacity-50'
                )}
                title='Your uploaded avatar'
              >
                <div className='relative'>
                  <img
                    src={user?.avatarUrl || ''}
                    alt='Your upload'
                    className='h-14 w-14 rounded-full object-cover transition-transform group-hover:scale-105'
                  />
                  {currentAvatarType === AvatarType.CUSTOM && (
                    <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-primary p-1'>
                      <Check className='h-3 w-3 text-white' />
                    </div>
                  )}
                </div>
                <span className='text-[10px] text-muted-foreground'>
                  My Upload
                </span>
              </button>
            )}

            {/* Divider */}
            {hasCustomAvatar && (
              <div className='mx-1 flex items-center'>
                <div className='h-12 w-px bg-border' />
              </div>
            )}

            {/* Preset Avatars */}
            {PRESET_AVATARS.map((preset) => {
              const isSelected =
                currentAvatarType === AvatarType.PRESET &&
                (selectedPreset === preset.id ||
                  user?.avatarPreset === preset.id)

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  disabled={isLoading}
                  className={cn(
                    'group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected && 'bg-muted ring-2 ring-primary ring-offset-2',
                    isLoading && 'cursor-not-allowed opacity-50'
                  )}
                  title={preset.label}
                >
                  <div className='relative'>
                    <img
                      src={`/avatars/${preset.id}.png`}
                      alt={preset.label}
                      className='h-14 w-14 rounded-full object-cover transition-transform group-hover:scale-105'
                      onError={(e) => {
                        e.currentTarget.src = '/avatar-image.svg'
                      }}
                    />
                    {isSelected && (
                      <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-primary p-1'>
                        <Check className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </div>
                  <span className='text-[10px] text-muted-foreground'>
                    {preset.label}
                  </span>
                </button>
              )
            })}
          </div>
          <p className='text-xs text-muted-foreground'>
            Upload a custom image (max 5MB) or select a preset avatar.
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/gif,image/webp'
          onChange={handleFileChange}
          className='hidden'
        />

        {/* Reset Button */}
        <div className='flex items-center gap-2 border-t pt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleResetToInitials}
            disabled={isLoading || currentAvatarType === 'initials'}
            className='gap-2'
          >
            <RotateCcw className='h-4 w-4' />
            Reset to Initials
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AvatarSettings
