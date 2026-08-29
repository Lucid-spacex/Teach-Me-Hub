'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { CreateProgressReportRequest, Enrollment } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'

interface ProgressReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollments: Enrollment[]
  onSuccess: () => void
}

export function ProgressReportModal({ open, onOpenChange, enrollments, onSuccess }: ProgressReportModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateProgressReportRequest>({
    enrollmentId: '',
    period: '',
    summary: '',
    strengths: '',
    areasToImprove: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.createProgressReport(formData)
      toast({
        title: "Success",
        description: "Progress report submitted successfully",
      })
      setFormData({
        enrollmentId: '',
        period: '',
        summary: '',
        strengths: '',
        areasToImprove: '',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit progress report',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (enrollments.length === 0) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Submit Progress Report"
        description="You need an active enrollment to submit a progress report"
        footer={
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        }
      >
        <div className="text-center py-4">
          <p className="text-muted-foreground">No active enrollments available</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Submit Progress Report"
      description="Record student progress and feedback"
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
          <Button type="submit" form="progress-report-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Submit Report
          </Button>
        </div>
      }
    >
      <form id="progress-report-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="enrollment">Enrollment *</Label>
          <Select
            value={formData.enrollmentId}
            onValueChange={(value) => setFormData({ ...formData, enrollmentId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an enrollment" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.map((enrollment) => (
                <SelectItem key={enrollment.id} value={enrollment.id}>
                  Subject: {enrollment.subjectId} (ID: {enrollment.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Period *</Label>
          <Input
            id="period"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            placeholder="e.g., Week 1, Month 1, Q1 2024"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Overall summary of student progress..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strengths">Strengths *</Label>
          <Textarea
            id="strengths"
            value={formData.strengths}
            onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
            placeholder="Student's strengths and achievements..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areasToImprove">Areas to Improve *</Label>
          <Textarea
            id="areasToImprove"
            value={formData.areasToImprove}
            onChange={(e) => setFormData({ ...formData, areasToImprove: e.target.value })}
            placeholder="Areas where the student needs improvement..."
            rows={3}
          />
        </div>
      </form>
    </Modal>
  )
}
