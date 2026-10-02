'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Enrollment, TutorWithProfile } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const [includeUnpaid, setIncludeUnpaid] = useState(false)

  useEffect(() => {
    loadEnrollments()
  }, [refreshTrigger, includeUnpaid])

  useEffect(() => {
    loadTutors()
  }, [])

  const loadEnrollments = async () => {
    setLoading(true)
    try {
      const data = await api.getUnmatchedEnrollments(includeUnpaid)
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
      const data = await api.getTutors('APPROVED')
      setTutors(Array.isArray(data) ? data : [])
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
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{enrollment.id}</code>
      ),
    },
    {
      key: 'studentName',
      header: 'Student',
      cell: (enrollment: Enrollment) => (
        enrollment.student ? (
          <div>
            <div className="font-medium text-white">{enrollment.student.fullName}</div>
            <div className="text-xs text-gray-400">{enrollment.student.actualGrade}</div>
          </div>
        ) : (
          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{enrollment.studentId}</code>
        )
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject',
      cell: (enrollment: Enrollment) => (
        enrollment.subject ? (
          <div>
            <div className="font-medium text-white">{enrollment.subject.name}</div>
            <div className="text-xs text-gray-400">{enrollment.subject.gradeBand}</div>
          </div>
        ) : (
          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{enrollment.subjectId}</code>
        )
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      cell: (enrollment: Enrollment) => (
        <div className="text-gray-300">{enrollment.sessionFrequency}</div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      cell: (enrollment: Enrollment) => (
        <div className="text-gray-300">{new Date(enrollment.startDate).toLocaleDateString()}</div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (enrollment: Enrollment) => (
        <Button
          size="sm"
          onClick={() => openAssignModal(enrollment)}
          className="gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
        >
          <UserCheck className="h-4 w-4" />
          Assign Tutor
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card className="bg-card border-brand-gold/30">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-gold" />
            Unmatched Enrollments
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={includeUnpaid ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeUnpaid(!includeUnpaid)}
              className={includeUnpaid 
                ? "bg-brand-gold text-brand-dark hover:bg-brand-goldLight text-xs" 
                : "border-brand-gold/40 text-gray-300 hover:text-white text-xs"}
            >
              {includeUnpaid ? "Showing Unpaid Included" : "Include Unpaid"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Modal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        title="Assign Tutor"
        description="Assign a tutor to this enrollment"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              disabled={actionLoading}
              className="border-brand-gold text-brand-gold hover:bg-brand-gold/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTutor}
              disabled={actionLoading}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Assign Tutor
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedEnrollment && (
            <div className="bg-brand-dark/50 border border-brand-gold/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-white">Enrollment Details</p>
              <p className="text-xs text-gray-400 mt-1">
                Enrollment ID: {selectedEnrollment.id}
              </p>
              <p className="text-xs text-gray-400">
                Student: {selectedEnrollment.student?.fullName || selectedEnrollment.studentId}
              </p>
              <p className="text-xs text-gray-400">
                Subject: {selectedEnrollment.subject?.name || selectedEnrollment.subjectId}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Tutor *</label>
            <Select
              value={tutorId}
              onValueChange={(value) => setTutorId(value)}
              disabled={tutorsLoading}
            >
              <SelectTrigger className="bg-background border-input">
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
