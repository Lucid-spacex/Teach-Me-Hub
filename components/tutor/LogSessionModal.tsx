'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Session, UpdateSessionRequest } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      setFormData({
        status: 'COMPLETED',
        tutorNotes: session.tutorNotes || '',
        homeworkAssigned: session.homeworkAssigned || '',
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)

    try {
      await api.updateSession(session.id, formData)
      toast({
        title: "Success",
        description: "Session logged successfully",
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to log session',
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
      title="Log Session"
      description="Record session details and homework"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="default"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="log-session-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Log Session
          </Button>
        </div>
      }
    >
      <form id="log-session-form" onSubmit={handleSubmit} className="space-y-4">
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
      </form>
    </Modal>
  )
}
