'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { CreateStudentRequest } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'

interface AddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddStudentModal({ open, onOpenChange, onSuccess }: AddStudentModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateStudentRequest>({
    fullName: '',
    dateOfBirth: '',
    gradeLevel: '',
    school: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await api.createStudent(formData)
      toast({
        title: "Success",
        description: "Student added successfully",
      })
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gradeLevel: '',
        school: '',
        notes: '',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add student'
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      
      // Parse validation errors if any
      if (error.includes('Validation failed')) {
        // Simple error parsing - in real app would be more sophisticated
        if (error.includes('fullName')) setErrors(prev => ({ ...prev, fullName: 'Invalid name' }))
        if (error.includes('dateOfBirth')) setErrors(prev => ({ ...prev, dateOfBirth: 'Invalid date' }))
        if (error.includes('gradeLevel')) setErrors(prev => ({ ...prev, gradeLevel: 'Invalid grade' }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Student"
      description="Add a new child to your account"
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
          <Button type="submit" form="add-student-form" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Add Student
          </Button>
        </div>
      }
    >
      <form id="add-student-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter child's full name"
             className={`text-black ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
             className={`text-black ${errors.dateOfBirth ? 'border-red-500' : ''}`}
          />
          {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gradeLevel">Grade Level *</Label>
          <Input
            id="gradeLevel"
            value={formData.gradeLevel}
            onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
            placeholder="e.g., 5th Grade, 10th Grade"
            className={`text-black ${errors.gradeLevel ? 'border-red-500' : ''}`}
          />
          {errors.gradeLevel && <p className="text-sm text-red-500">{errors.gradeLevel}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">School</Label>
          <Input
            id="school"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            placeholder="School name"
            className='text-black'
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information"
            rows={3}
            className='text-white'
          />
        </div>
      </form>
    </Modal>
  )
}
