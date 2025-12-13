import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { User } from '@/redux/types/user'
import { AvatarType } from '@/utils/constants/user'

export interface AvatarProps {
  user: User | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Preset avatar files should be placed in /public/avatars/
const PRESET_AVATAR_PATH = '/avatars'

// Generate consistent color based on user's name
const getInitialsColor = (name: string): string => {
  const colors = [
    'bg-gradient-to-br from-purple-500 to-pink-500',
    'bg-gradient-to-br from-blue-500 to-cyan-500',
    'bg-gradient-to-br from-green-500 to-emerald-500',
    'bg-gradient-to-br from-orange-500 to-amber-500',
    'bg-gradient-to-br from-rose-500 to-red-500',
    'bg-gradient-to-br from-indigo-500 to-violet-500',
    'bg-gradient-to-br from-teal-500 to-cyan-500',
    'bg-gradient-to-br from-fuchsia-500 to-pink-500',
  ]

  // Generate consistent index from name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

const getInitials = (name: string): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  className,
}) => {
  const avatarType = user?.avatarType || 'initials'
  const avatarPreset = user?.avatarPreset
  const avatarUrl = user?.avatarUrl
  const name = user?.name || 'User'

  const initialsColor = useMemo(() => getInitialsColor(name), [name])
  const initials = useMemo(() => getInitials(name), [name])

  // Determine what to render
  const renderAvatar = () => {
    // Custom uploaded avatar
    if (avatarType === AvatarType.CUSTOM && avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size],
            className
          )}
        />
      )
    }

    // Preset avatar
    if (avatarType === AvatarType.PRESET && avatarPreset) {
      return (
        <img
          src={`${PRESET_AVATAR_PATH}/${avatarPreset}.png`}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size],
            className
          )}
          onError={(e) => {
            // Fallback to initials if preset image fails to load
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
      )
    }

    // Default: initials
    return null
  }

  const presetImage = renderAvatar()

  return (
    <div className='relative'>
      {presetImage}
      {/* Initials fallback - shown when no image or as hidden fallback */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold text-white shadow-sm',
          initialsColor,
          sizeClasses[size],
          presetImage ? 'hidden' : '',
          className
        )}
      >
        {initials}
      </div>
    </div>
  )
}

export default Avatar
