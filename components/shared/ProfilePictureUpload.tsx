'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface ProfilePictureUploadProps {
  currentPictureUrl?: string | null
  fullName: string
  onPictureChange: (url: string | null) => void
  disabled?: boolean
}

export function ProfilePictureUpload({
  currentPictureUrl,
  fullName,
  onPictureChange,
  disabled = false
}: ProfilePictureUploadProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPictureUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      })
      return
    }

    // Max 5MB
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    uploadPicture(file)
  }

  const uploadPicture = async (file: File) => {
    setUploading(true)
    try {
      const result = await api.uploadProfilePicture(file)
      onPictureChange(result.profilePictureUrl)
      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been uploaded successfully',
      })
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload profile picture',
        variant: 'destructive',
      })
      // Revert preview on error
      setPreviewUrl(currentPictureUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      await api.deleteProfilePicture()
      setPreviewUrl(null)
      onPictureChange(null)
      toast({
        title: 'Profile picture removed',
        description: 'Your profile picture has been removed',
      })
    } catch (error) {
      console.error('Failed to remove profile picture:', error)
      toast({
        title: 'Removal failed',
        description: error instanceof Error ? error.message : 'Failed to remove profile picture',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-gold/30 bg-brand-dark/50 flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`${fullName}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`${getAvatarColor(fullName)} w-full h-full flex items-center justify-center`}>
              <span className="text-3xl font-bold text-white">
                {getInitials(fullName)}
              </span>
            </div>
          )}
        </div>

        {!disabled && (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            {previewUrl ? 'Change' : 'Upload'}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
