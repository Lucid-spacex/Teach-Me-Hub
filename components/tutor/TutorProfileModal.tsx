'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { CreateTutorProfileRequest, UpdateTutorProfileRequest, TutorProfile } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'

interface TutorProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingProfile: TutorProfile | null
  onSuccess: () => void
}

export function TutorProfileModal({ open, onOpenChange, existingProfile, onSuccess }: TutorProfileModalProps) {
  const { toast } = useToast()
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<CreateTutorProfileRequest>({
    subjects: [],
    bio: '',
    credentialsUrl: '',
    hourlyRate: 0,
    availability: {},
  })
  const [availabilityText, setAvailabilityText] = useState('')
  const [subjectsText, setSubjectsText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existingProfile) {
      setIsEditMode(true)
      const subjects = Array.isArray(existingProfile.subjects) ? existingProfile.subjects : []
      setFormData({
        subjects: subjects,
        bio: existingProfile.bio || '',
        credentialsUrl: existingProfile.credentialsUrl || '',
        hourlyRate: existingProfile.hourlyRate || 0,
        availability: existingProfile.availability || {},
      })
      setSubjectsText(subjects.join(', '))
      setAvailabilityText(JSON.stringify(existingProfile.availability || {}, null, 2))
    } else {
      setIsEditMode(false)
      setFormData({
        subjects: [],
        bio: '',
        credentialsUrl: '',
        hourlyRate: 0,
        availability: {},
      })
      setSubjectsText('')
      setAvailabilityText('{}')
    }
  }, [existingProfile, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse subjects from comma-separated text
      const subjectsArray = subjectsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Parse availability from JSON text
      let availabilityObj = {}
      try {
        availabilityObj = JSON.parse(availabilityText)
      } catch {
        toast({
          title: "Error",
          description: "Invalid JSON format for availability",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const submitData = {
        ...formData,
        subjects: subjectsArray,
        availability: availabilityObj,
      }

      if (isEditMode) {
        // In edit mode, only update availability
        const updateData: UpdateTutorProfileRequest = {
          availability: availabilityObj,
        }
        await api.updateTutorProfile(updateData)
        toast({
          title: "Success",
          description: "Availability updated successfully",
        })
      } else {
        // Create new profile
        await api.createTutorProfile(submitData)
        toast({
          title: "Success",
          description: "Profile created successfully",
        })
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save profile',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit Availability' : 'Create Tutor Profile'}
      description={isEditMode 
        ? 'Update your availability. Note: Subjects, bio, and rate cannot be edited after profile creation.'
        : 'Set up your tutor profile to start receiving students'
      }
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="profile-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            {isEditMode ? 'Save Availability' : 'Create Profile'}
          </Button>
        </div>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects *</Label>
              <Input
                id="subjects"
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
                placeholder="e.g., Mathematics, Physics, Chemistry"
              />
              <p className="text-xs text-muted-foreground">Enter subjects separated by commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell students about your teaching style and experience..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentialsUrl">Credentials URL (optional)</Label>
              <Input
                id="credentialsUrl"
                value={formData.credentialsUrl}
                onChange={(e) => setFormData({ ...formData, credentialsUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                placeholder="50.00"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="availability">Availability *</Label>
          <Textarea
            id="availability"
            value={availabilityText}
            onChange={(e) => setAvailabilityText(e.target.value)}
            placeholder='{"monday": ["9:00-12:00", "14:00-17:00"], "tuesday": []}'
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter availability as JSON. Example: {`{"monday": ["9:00-12:00"], "tuesday": []}`}
          </p>
        </div>

        {isEditMode && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Due to backend limitations, only availability can be edited after profile creation. To change subjects, bio, or rate, please contact support.
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}
