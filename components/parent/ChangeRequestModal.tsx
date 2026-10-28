'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Enrollment, EnrollmentChangeRequest, ChangeRequestStatus } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface ChangeRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: Enrollment | null
  onSuccess: () => void
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

export function ChangeRequestModal({ open, onOpenChange, enrollment, onSuccess }: ChangeRequestModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [changeRequests, setChangeRequests] = useState<EnrollmentChangeRequest[]>([])
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    sessionFrequency: '',
    availableDays: [] as string[],
    preferredStartHour: 0,
    preferredEndHour: 0,
  })

  useEffect(() => {
    if (open && enrollment) {
      loadChangeRequests()
      // Pre-fill with current values
      setFormData({
        startDate: enrollment.startDate ? enrollment.startDate.split('T')[0] : '',
        endDate: enrollment.endDate ? enrollment.endDate.split('T')[0] : '',
        sessionFrequency: enrollment.sessionFrequency || '',
        availableDays: enrollment.availableDays || [],
        preferredStartHour: enrollment.preferredStartHour || 9,
        preferredEndHour: enrollment.preferredEndHour || 17,
      })
    }
  }, [open, enrollment])

  const loadChangeRequests = async () => {
    if (!enrollment) return
    try {
      const data = await api.getParentChangeRequests(enrollment.id)
      setChangeRequests(data)
    } catch (err) {
      console.error('Failed to load change requests:', err)
    }
  }

  const hasPendingRequest = changeRequests.some(r => r.status === 'PENDING')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollment) return

    setLoading(true)
    try {
      await api.createChangeRequest(enrollment.id, {
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        availableDays: formData.availableDays.length > 0 ? formData.availableDays : undefined,
        preferredStartHour: formData.preferredStartHour,
        preferredEndHour: formData.preferredEndHour,
      })
      toast({
        title: 'Change Request Submitted',
        description: 'Your schedule change request has been submitted for admin approval.',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast({
        title: 'Request Failed',
        description: err instanceof Error ? err.message : 'Failed to submit change request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      await api.cancelChangeRequest(requestId)
      toast({
        title: 'Request Cancelled',
        description: 'Your change request has been cancelled.',
      })
      loadChangeRequests()
    } catch (err) {
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel the request',
        variant: 'destructive',
      })
    }
  }

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  if (!enrollment) return null

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Request Schedule Change"
      description="Request changes to your enrollment schedule. Subject and billing changes are not allowed here."
    >
      <div className="space-y-6 pt-2">
        {/* Pending Request Banner */}
        {hasPendingRequest && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-400">Change Request Pending Approval</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your current request is being reviewed by the admin team. You can cancel it while pending.
                </p>
                {changeRequests.filter(r => r.status === 'PENDING').map(req => (
                  <Button
                    key={req.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(req.id)}
                    className="mt-2 text-xs"
                  >
                    Cancel Request
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Request History */}
        {changeRequests.length > 0 && (
          <div className="space-y-2">
            <Label>Request History</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {changeRequests.map(req => (
                <div key={req.id} className="p-3 rounded-lg border border-border/50 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {req.status === 'APPROVED' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-xs">Approved</span>
                        </>
                      )}
                      {req.status === 'REJECTED' && (
                        <>
                          <XCircle className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 text-xs">Rejected</span>
                        </>
                      )}
                      {req.status === 'PENDING' && (
                        <>
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span className="text-amber-400 text-xs">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  {req.rejectionReason && (
                    <p className="text-xs text-red-400 mt-1">
                      Admin reason: {req.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change Request Form */}
        {!hasPendingRequest && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionFrequency">Session Frequency</Label>
              <Select
                value={formData.sessionFrequency}
                onValueChange={value => setFormData({ ...formData, sessionFrequency: value })}
              >
                <SelectTrigger id="sessionFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TWICE_WEEKLY">Twice Weekly</SelectItem>
                  <SelectItem value="THRICE_WEEKLY">Thrice Weekly</SelectItem>
                  <SelectItem value="FIVE_TIMES_WEEKLY">Five Times Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <Checkbox
                      id={day}
                      checked={formData.availableDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <label htmlFor={day} className="text-sm cursor-pointer">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredStartHour">Preferred Start Hour</Label>
                <Select
                  value={formData.preferredStartHour.toString()}
                  onValueChange={value => setFormData({ ...formData, preferredStartHour: parseInt(value) })}
                >
                  <SelectTrigger id="preferredStartHour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredEndHour">Preferred End Hour</Label>
                <Select
                  value={formData.preferredEndHour.toString()}
                  onValueChange={value => setFormData({ ...formData, preferredEndHour: parseInt(value) })}
                >
                  <SelectTrigger id="preferredEndHour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 9).map(hour => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Only schedule changes are allowed here. Subject and billing changes require admin contact.
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
