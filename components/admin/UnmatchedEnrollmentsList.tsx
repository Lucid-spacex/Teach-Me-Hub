'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Enrollment, TutorWithProfile } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { UserCheck, ClipboardList } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Modal } from '@/components/shared/Modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UnmatchedEnrollmentsListProps {
  onUpdate: () => void
  refreshTrigger?: number
}

export function UnmatchedEnrollmentsList({ onUpdate, refreshTrigger }: UnmatchedEnrollmentsListProps) {
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [tutorId, setTutorId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [tutorsLoading, setTutorsLoading] = useState(false)

  useEffect(() => {
    loadEnrollments()
  }, [refreshTrigger])

  useEffect(() => {
    loadTutors()
  }, [])

  const loadEnrollments = async () => {
    try {
      const data = await api.getUnmatchedEnrollments()
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load unmatched enrollments:', err)
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  const loadTutors = async () => {
    setTutorsLoading(true)
    try {
      console.log('Loading tutors with status: APPROVED')
      const data = await api.getTutors('APPROVED')
      console.log('API Response - getTutors:', data)
      console.log('API Response - type:', typeof data)
      console.log('API Response - is array:', Array.isArray(data))
      console.log('API Response - length:', Array.isArray(data) ? data.length : 'N/A')
      
      setTutors(Array.isArray(data) ? data : [])
      console.log('Tutors state set to:', Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load tutors:', err)
      setTutors([])
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive",
      })
    } finally {
      setTutorsLoading(false)
    }
  }

  const openAssignModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setTutorId('')
    setAssignModalOpen(true)
  }

  const handleAssignTutor = async () => {
    if (!selectedEnrollment || !tutorId) {
      toast({
        title: "Error",
        description: "Please select a tutor",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    try {
      await api.assignTutor(selectedEnrollment.id, { tutorId })
      toast({
        title: "Success",
        description: "Tutor assigned successfully",
      })
      setAssignModalOpen(false)
      loadEnrollments()
      onUpdate()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to assign tutor',
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      key: 'enrollmentId',
      header: 'Enrollment ID',
      cell: (enrollment: Enrollment) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{enrollment.id}</code>
      ),
    },
    {
      key: 'studentName',
      header: 'Student',
      cell: (enrollment: Enrollment) => (
        enrollment.student ? (
          <div>
            <div className="font-medium">{enrollment.student.fullName}</div>
            <div className="text-xs text-muted-foreground">{enrollment.student.gradeLevel}</div>
          </div>
        ) : (
          <code className="text-xs bg-muted px-2 py-1 rounded">{enrollment.studentId}</code>
        )
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject',
      cell: (enrollment: Enrollment) => (
        enrollment.subject ? (
          <div>
            <div className="font-medium">{enrollment.subject.name}</div>
            <div className="text-xs text-muted-foreground">{enrollment.subject.gradeBand}</div>
          </div>
        ) : (
          <code className="text-xs bg-muted px-2 py-1 rounded">{enrollment.subjectId}</code>
        )
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      cell: (enrollment: Enrollment) => enrollment.frequency,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      cell: (enrollment: Enrollment) => new Date(enrollment.startDate).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (enrollment: Enrollment) => (
        <Button
          size="sm"
          onClick={() => openAssignModal(enrollment)}
          className="gap-2"
        >
          <UserCheck className="h-4 w-4" />
          Assign Tutor
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Unmatched Enrollments</h2>

        <DataTable
          data={enrollments}
          columns={columns}
          loading={loading}
          emptyState={{
            icon: ClipboardList,
            title: "No unmatched enrollments",
            description: "Enrollments awaiting tutor assignment will appear here",
          }}
        />
      </div>

      <Modal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        title="Assign Tutor"
        description="Assign a tutor to this enrollment"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="primary"
              onClick={() => setAssignModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTutor} disabled={actionLoading}>
              {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Assign Tutor
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedEnrollment && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium">Enrollment Details</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enrollment ID: {selectedEnrollment.id}
              </p>
              <p className="text-xs text-muted-foreground">
                Student: {selectedEnrollment.student?.fullName || selectedEnrollment.studentId}
              </p>
              <p className="text-xs text-muted-foreground">
                Subject: {selectedEnrollment.subject?.name || selectedEnrollment.subjectId}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Tutor *</label>
            <Select
              value={tutorId}
              onValueChange={(value) => setTutorId(value)}
              disabled={tutorsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={tutorsLoading ? "Loading tutors..." : "Select a tutor"} />
              </SelectTrigger>
              <SelectContent>
                {tutors.length === 0 ? (
                  <SelectItem value="" disabled>
                    No tutors available
                  </SelectItem>
                ) : (
                  tutors
                    .filter(tutor => tutor?.id)
                    .map((tutor) => {
                      const tutorId = tutor.id
                      const fullName = tutor.fullName
                      const subjects = Array.isArray(tutor.tutorProfile?.subjects) && tutor.tutorProfile.subjects.length > 0 
                        ? tutor.tutorProfile.subjects.join(', ') 
                        : 'No profile'
                      
                      return (
                        <SelectItem key={tutorId} value={tutorId}>
                          {fullName} ({subjects})
                        </SelectItem>
                      )
                    })
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </>
  )
}
