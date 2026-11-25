'use client'

import { useMemo } from 'react'

interface AvatarProps {
  fullName: string
  profilePictureUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ fullName, profilePictureUrl, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-accent-indigo text-background',
      'bg-accent-teal text-background',
      'bg-accent-coral text-background',
      'bg-primary text-primary-foreground',
      'bg-accent-teal text-background',
      'bg-accent-indigo text-background',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-16 text-lg',
  }

  const initials = useMemo(() => getInitials(fullName), [fullName])
  const colorClass = useMemo(() => getAvatarColor(fullName), [fullName])

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${colorClass} ${className}`}>
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={`${fullName}'s avatar`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-bold text-white">
          {initials}
        </span>
      )}
    </div>
  )
}
