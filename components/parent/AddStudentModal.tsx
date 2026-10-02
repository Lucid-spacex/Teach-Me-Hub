'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { CreateStudentRequest, ActualGrade, Gender } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, GraduationCap, School, User, Mail, Hash } from 'lucide-react'

interface AddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ACTUAL_GRADES: { value: ActualGrade; label: string }[] = [
  { value: 'PRESCHOOL', label: 'Preschool' },
  { value: 'KINDERGARTEN', label: 'Kindergarten' },
  { value: 'GRADE_1', label: 'Grade 1' },
  { value: 'GRADE_2', label: 'Grade 2' },
  { value: 'GRADE_3', label: 'Grade 3' },
  { value: 'GRADE_4', label: 'Grade 4' },
  { value: 'GRADE_5', label: 'Grade 5' },
  { value: 'GRADE_6', label: 'Grade 6' },
  { value: 'GRADE_7', label: 'Grade 7' },
  { value: 'GRADE_8', label: 'Grade 8' },
  { value: 'GRADE_9', label: 'Grade 9' },
  { value: 'GRADE_10', label: 'Grade 10' },
  { value: 'GRADE_11', label: 'Grade 11' },
  { value: 'GRADE_12', label: 'Grade 12' },
]

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

export function AddStudentModal({ open, onOpenChange, onSuccess }: AddStudentModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateStudentRequest>({
    fullName: '',
    dateOfBirth: '',
    actualGrade: 'GRADE_1',
    gradeLevel: '',
    gender: 'PREFER_NOT_TO_SAY',
    school: '',
    notes: '',
    email: '',
    preferredStartDate: '',
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
        description: "Student added successfully. Credentials have been sent to your email.",
      })
      setFormData({
        fullName: '',
        dateOfBirth: '',
        actualGrade: 'GRADE_1',
        gradeLevel: '',
        gender: 'PREFER_NOT_TO_SAY',
        school: '',
        notes: '',
        email: '',
        preferredStartDate: '',
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
        if (error.includes('fullName')) setErrors(prev => ({ ...prev, fullName: 'Invalid name' }))
        if (error.includes('dateOfBirth')) setErrors(prev => ({ ...prev, dateOfBirth: 'Invalid date' }))
        if (error.includes('actualGrade')) setErrors(prev => ({ ...prev, actualGrade: 'Invalid grade' }))
        if (error.includes('gradeLevel')) setErrors(prev => ({ ...prev, gradeLevel: 'Invalid grade level' }))
        if (error.includes('gender')) setErrors(prev => ({ ...prev, gender: 'Invalid gender' }))
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
      className="sm:max-w-[700px]"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-brand-gold text-brand-gold hover:bg-brand-gold/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-student-form"
            disabled={loading}
            className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Add Student
          </Button>
        </div>
      }
    >
      <form id="add-student-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-gold" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter child's full name"
              className={`bg-background border-input ${errors.fullName ? 'border-destructive' : ''}`}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-gray-300 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-gold" />
              Date of Birth *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className={`bg-background border-input ${errors.dateOfBirth ? 'border-destructive' : ''}`}
            />
            {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actualGrade" className="text-gray-300 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand-gold" />
              Actual Grade *
            </Label>
            <Select
              value={formData.actualGrade}
              onValueChange={(value) => setFormData({ ...formData, actualGrade: value as ActualGrade })}
            >
              <SelectTrigger className={`bg-background border-input ${errors.actualGrade ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {ACTUAL_GRADES.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.actualGrade && <p className="text-sm text-destructive">{errors.actualGrade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeLevel" className="text-gray-300 flex items-center gap-2">
              <School className="h-4 w-4 text-brand-gold" />
              Grade Level *
            </Label>
            <Input
              id="gradeLevel"
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              placeholder="e.g., 5th Grade, Springfield Elementary"
              className={`bg-background border-input ${errors.gradeLevel ? 'border-destructive' : ''}`}
            />
            {errors.gradeLevel && <p className="text-sm text-destructive">{errors.gradeLevel}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-gold" />
              Gender *
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
            >
              <SelectTrigger className={`bg-background border-input ${errors.gender ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="school" className="text-gray-300 flex items-center gap-2">
              <School className="h-4 w-4 text-brand-gold" />
              School
            </Label>
            <Input
              id="school"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              placeholder="School name"
              className="bg-background border-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-gold" />
            Student's Email (Optional)
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@example.com"
            className="bg-background border-input"
          />
          <p className="text-xs text-gray-500">For notifications only — this is not used to log in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferredStartDate" className="text-gray-300 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-gold" />
              Preferred Start Date
            </Label>
            <Input
              id="preferredStartDate"
              type="date"
              value={formData.preferredStartDate}
              onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
              className="bg-background border-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-gray-300 flex items-center gap-2">
            <Hash className="h-4 w-4 text-brand-gold" />
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information about your child"
            rows={3}
            className="bg-background border-input"
          />
        </div>
      </form>
    </Modal>
  )
}
