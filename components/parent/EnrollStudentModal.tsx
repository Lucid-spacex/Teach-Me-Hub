'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { CreateEnrollmentRequest, Enrollment, Student, Subject } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'

interface EnrollStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Student[]
  onSuccess: () => void
}

export function EnrollStudentModal({ open, onOpenChange, students, onSuccess }: EnrollStudentModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'enroll' | 'payment'>('enroll')
  const [formData, setFormData] = useState<CreateEnrollmentRequest>({
    studentId: '',
    subjectId: '',
    frequency: 'WEEKLY',
    startDate: '',
    endDate: '',
  })
  const [paymentAmount, setPaymentAmount] = useState('')
  const [createdEnrollment, setCreatedEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadSubjects()
    }
  }, [open])

  const loadSubjects = async () => {
    setSubjectsLoading(true)
    try {
      const data = await api.getSubjects()
      setSubjects(data)
    } catch (err) {
      console.error('Failed to load subjects:', err)
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      })
    } finally {
      setSubjectsLoading(false)
    }
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const enrollment = await api.createEnrollment(formData)
      setCreatedEnrollment(enrollment)
      setStep('payment')
      toast({
        title: "Enrollment Created",
        description: "Please complete payment to activate",
      })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create enrollment'
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      
      if (error.includes('Validation failed')) {
        if (error.includes('studentId')) setErrors(prev => ({ ...prev, studentId: 'Please select a student' }))
        if (error.includes('subjectId')) setErrors(prev => ({ ...prev, subjectId: 'Invalid subject ID' }))
        if (error.includes('frequency')) setErrors(prev => ({ ...prev, frequency: 'Invalid frequency' }))
        if (error.includes('startDate')) setErrors(prev => ({ ...prev, startDate: 'Invalid start date' }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createdEnrollment || !paymentAmount) {
      toast({
        title: "Error",
        description: "Please enter payment amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulate successful payment
      toast({
        title: "Payment Successful",
        description: "Your enrollment has been activated successfully",
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to process payment'
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('enroll')
    setFormData({
      studentId: '',
      subjectId: '',
      frequency: 'WEEKLY',
      startDate: '',
      endDate: '',
    })
    setPaymentAmount('')
    setCreatedEnrollment(null)
    setErrors({})
    onOpenChange(false)
  }

  if (students.length === 0) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Enroll Student"
        description="You need to add a student first before creating an enrollment"
        footer={
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        }
      >
        <div className="text-center py-4">
          <p className="text-muted-foreground">Please add a student to your account first</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={step === 'enroll' ? 'Enroll Student' : 'Complete Payment'}
      description={step === 'enroll' ? 'Create a new enrollment for your child' : 'Initiate payment for the enrollment'}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="default"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          {step === 'enroll' ? (
            <Button type="submit" form="enroll-form" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Continue to Payment
            </Button>
          ) : (
            <Button type="submit" form="payment-form" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Initiate Payment
            </Button>
          )}
        </div>
      }
    >
      {step === 'enroll' ? (
        <form id="enroll-form" onSubmit={handleEnrollSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) => setFormData({ ...formData, studentId: value })}
            >
              <SelectTrigger className={errors.studentId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && <p className="text-sm text-red-500">{errors.studentId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
              disabled={subjectsLoading}
            >
              <SelectTrigger className={errors.subjectId ? 'border-red-500' : ''}>
                <SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select a subject"} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.gradeBand})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectId && <p className="text-sm text-red-500">{errors.subjectId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
               className={`text-black ${errors.startDate ? 'border-red-500' : ''}`}
            />
            {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="text-black"
            />
          </div>
        </form>
      ) : (
        <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Enrollment Details</p>
            <p className="text-xs text-muted-foreground mt-1">
              Student: {students.find(s => s.id === formData.studentId)?.fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              Subject: {subjects.find(s => s.id === formData.subjectId)?.name || formData.subjectId}
            </p>
            <p className="text-xs text-muted-foreground">
              Frequency: {formData.frequency}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={paymentAmount}
              className="text-black"
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />

          </div>
        </form>
      )}
    </Modal>
  )
}
