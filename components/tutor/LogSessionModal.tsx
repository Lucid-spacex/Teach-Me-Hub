'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Session, UpdateSessionRequest } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'

interface LogSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: Session | null
  onSuccess: () => void
}

export function LogSessionModal({ open, onOpenChange, session, onSuccess }: LogSessionModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<UpdateSessionRequest>({
    status: 'COMPLETED',
    tutorNotes: '',
    homeworkAssigned: '',
  })
  const [rescheduleData, setRescheduleData] = useState({
    scheduledAt: '',
    durationMinutes: 60,
  })
  const [loading, setLoading] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  useEffect(() => {
    if (session) {
      setFormData({
        status: 'COMPLETED',
        tutorNotes: session.tutorNotes || '',
        homeworkAssigned: session.homeworkAssigned || '',
      })
      const date = new Date(session.scheduledAt)
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
      setRescheduleData({
        scheduledAt: date.toISOString().slice(0, 16),
        durationMinutes: session.durationMinutes,
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)

    try {
      if (isRescheduling) {
        await api.rescheduleTutorSession(session.id, {
          scheduledAt: new Date(rescheduleData.scheduledAt).toISOString(),
          durationMinutes: rescheduleData.durationMinutes,
        })
        toast({
          title: "Success",
          description: "Session rescheduled successfully",
        })
      } else {
        await api.updateSession(session.id, formData)
        toast({
          title: "Success",
          description: "Session logged successfully",
        })
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : isRescheduling ? 'Failed to reschedule session' : 'Failed to log session',
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
      title={isRescheduling ? "Reschedule Session" : "Log Session"}
      description={isRescheduling ? "Change the date, time, and duration of this session" : "Record session details and homework"}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              onOpenChange(false)
              setIsRescheduling(false)
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="log-session-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            {isRescheduling ? 'Reschedule Session' : 'Log Session'}
          </Button>
        </div>
      }
    >
      <form id="log-session-form" onSubmit={handleSubmit} className="space-y-4">
        {session?.createdBy === 'TUTOR' && session.status === 'SCHEDULED' && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isRescheduling ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRescheduling(true)}
              className="flex-1"
            >
              Reschedule
            </Button>
            <Button
              type="button"
              variant={!isRescheduling ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRescheduling(false)}
              className="flex-1"
            >
              Log Session
            </Button>
          </div>
        )}

        {isRescheduling ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={rescheduleData.scheduledAt}
                onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledAt: e.target.value })}
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
                value={rescheduleData.durationMinutes}
                onChange={(e) => setRescheduleData({ ...rescheduleData, durationMinutes: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">Standard durations: 30, 45, 60, 90, or 120 minutes</p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="MISSED">Missed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tutorNotes">Tutor Notes</Label>
              <Textarea
                id="tutorNotes"
                value={formData.tutorNotes}
                onChange={(e) => setFormData({ ...formData, tutorNotes: e.target.value })}
                placeholder="Notes about the session..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework">Homework Assigned</Label>
              <Textarea
                id="homework"
                value={formData.homeworkAssigned}
                onChange={(e) => setFormData({ ...formData, homeworkAssigned: e.target.value })}
                placeholder="Homework for the student..."
                rows={3}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
