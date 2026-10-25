'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefillData?: any
  onSuccess: () => void
}

export function CreateSessionModal({ open, onOpenChange, prefillData, onSuccess }: CreateSessionModalProps) {
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [formData, setFormData] = useState({
    enrollmentId: '',
    scheduledAt: '',
    durationMinutes: 60,
  })

  useEffect(() => {
    if (open) {
      loadEnrollments()
      if (prefillData) {
        setFormData({
          enrollmentId: prefillData.enrollmentId || '',
          scheduledAt: prefillData.scheduledDate
            ? `${prefillData.scheduledDate}T${prefillData.scheduledTime || '12:00'}`
            : '',
          durationMinutes: 60,
        })
      } else {
        // Default to tomorrow at noon
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(12, 0, 0, 0)
        setFormData({
          enrollmentId: '',
          scheduledAt: tomorrow.toISOString().slice(0, 16),
          durationMinutes: 60,
        })
      }
    }
  }, [open, prefillData])

  const loadEnrollments = async () => {
    setLoadingEnrollments(true)
    try {
      const data = await api.getTutorStudents()
      // Flatten enrollments from all students
      const allEnrollments = data.flatMap((ts: any) =>
        ts.enrollment ? [ts.enrollment] : []
      )
      setEnrollments(allEnrollments)
    } catch (err) {
      console.error('Failed to load enrollments:', err)
      toast({
        title: 'Error',
        description: 'Failed to load enrollments',
        variant: 'destructive',
      })
    } finally {
      setLoadingEnrollments(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.enrollmentId || !formData.scheduledAt) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await api.createTutorSession({
        enrollmentId: formData.enrollmentId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: formData.durationMinutes,
      })
      toast({
        title: 'Success',
        description: 'Session created successfully',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      console.error('Failed to create session:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create session',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Session"
      description="Schedule a new tutoring session for one of your students"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-session-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Create Session
          </Button>
        </div>
      }
    >
      <form id="create-session-form" onSubmit={handleSubmit} className="space-y-4">
        {loadingEnrollments ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="enrollmentId">Student/Enrollment *</Label>
              <Select
                value={formData.enrollmentId}
                onValueChange={(value) => setFormData({ ...formData, enrollmentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((enrollment) => (
                    <SelectItem key={enrollment.id} value={enrollment.id}>
                      {enrollment.student?.fullName || 'Unknown'} - {enrollment.subject?.name || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="15"
                max="180"
                step="15"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">Standard durations: 30, 45, 60, 90, or 120 minutes</p>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
