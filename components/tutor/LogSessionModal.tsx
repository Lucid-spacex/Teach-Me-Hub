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
  initialReschedule?: boolean
  initialAttendanceOnly?: boolean
}

export function LogSessionModal({ open, onOpenChange, session, onSuccess, initialReschedule = false, initialAttendanceOnly = false }: LogSessionModalProps) {
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
  const [isRescheduling, setIsRescheduling] = useState(initialReschedule)
  const [showAttendancePrompt, setShowAttendancePrompt] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  const [isAttendanceOnly, setIsAttendanceOnly] = useState(false)

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
      
      // If session is already COMPLETED and we're opening for attendance only
      if (session.status === 'COMPLETED' && session.participants && session.participants.length > 0) {
        setIsAttendanceOnly(true)
        setShowAttendancePrompt(true)
        // Initialize attendance data from existing session data
        const initialAttendance: Record<string, boolean> = {}
        session.participants.forEach((p: any) => {
          initialAttendance[p.enrollmentId] = p.attended ?? true
        })
        setAttendanceData(initialAttendance)
      }
    }
  }, [session])

  useEffect(() => {
    setIsRescheduling(initialReschedule)
    setIsAttendanceOnly(initialAttendanceOnly)
  }, [initialReschedule, initialAttendanceOnly])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    // Show attendance prompt when completing a session with participants
    if (!isRescheduling && !isAttendanceOnly && formData.status === 'COMPLETED' && session.participants && session.participants.length > 0 && !showAttendancePrompt) {
      setShowAttendancePrompt(true)
      // Initialize attendance data (all present by default)
      const initialAttendance: Record<string, boolean> = {}
      session.participants.forEach((p: any) => {
        initialAttendance[p.enrollmentId] = true
      })
      setAttendanceData(initialAttendance)
      return
    }

    setLoading(true)

    try {
      if (isRescheduling) {
        // Show backend error if not authorized
        if (session.createdBy !== 'TUTOR') {
          throw new Error('You can only reschedule sessions you created')
        }
        await api.rescheduleTutorSession(session.id, {
          scheduledAt: new Date(rescheduleData.scheduledAt).toISOString(),
          durationMinutes: rescheduleData.durationMinutes,
        })
        toast({
          title: "Success",
          description: "Session rescheduled successfully",
        })
      } else if (isAttendanceOnly) {
        // Update attendance only for already completed sessions
        const updateData: UpdateSessionRequest = {
          status: session.status,
          tutorNotes: session.tutorNotes || '',
          homeworkAssigned: session.homeworkAssigned || '',
          participants: session.participants?.map((p: any) => ({
            enrollmentId: p.enrollmentId,
            attended: attendanceData[p.enrollmentId] ?? true,
          })),
        }
        await api.updateSession(session.id, updateData)
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        })
      } else {
        const updateData: UpdateSessionRequest = {
          ...formData,
          participants: session.participants?.map((p: any) => ({
            enrollmentId: p.enrollmentId,
            attended: attendanceData[p.enrollmentId] ?? true,
          })),
        }
        await api.updateSession(session.id, updateData)
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
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) {
          setIsRescheduling(false)
          setShowAttendancePrompt(false)
          setIsAttendanceOnly(false)
        }
      }}
      title={isRescheduling ? "Reschedule Session" : (showAttendancePrompt ? "Mark Attendance" : "Log Session")}
      description={isRescheduling ? "Change the date, time, and duration of this session" : (showAttendancePrompt ? "Mark attendance for each student in this session" : "Record session details and homework")}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              onOpenChange(false)
              setIsRescheduling(false)
              setShowAttendancePrompt(false)
              setIsAttendanceOnly(false)
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="log-session-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            {isRescheduling ? 'Reschedule Session' : (showAttendancePrompt ? 'Save Attendance' : 'Log Session')}
          </Button>
        </div>
      }
    >
      <form id="log-session-form" onSubmit={handleSubmit} className="space-y-4">
        {session?.createdBy === 'TUTOR' && session.status === 'SCHEDULED' && !isAttendanceOnly && (
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

        {showAttendancePrompt && session?.participants && session.participants.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Mark each student as present or absent:</p>
            {session.participants.map((p: any) => (
              <div key={p.enrollmentId} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div>
                  <p className="font-medium text-foreground">{p.student?.fullName || p.studentName || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{p.subject?.name || p.subjectName || 'Subject'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceData[p.enrollmentId] ?? true}
                      onChange={(e) => setAttendanceData({ ...attendanceData, [p.enrollmentId]: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Present</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : isRescheduling ? (
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
            {session?.status === 'COMPLETED' || session?.status === 'SCHEDULED' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    disabled={isAttendanceOnly}
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
                    disabled={isAttendanceOnly}
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
                    disabled={isAttendanceOnly}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                {isAttendanceOnly ? 'Attendance can only be marked for sessions with participants.' : 'Attendance can only be marked for completed sessions. This session is currently ' + session?.status + '.'}
              </div>
            )}
          </>
        )}
      </form>
    </Modal>
  )
}
