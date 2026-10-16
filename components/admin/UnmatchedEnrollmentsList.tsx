'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Enrollment, TutorWithProfile, SuggestedTutor } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { UserCheck, ClipboardList, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Modal } from '@/components/shared/Modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

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
  const [suggestedTutors, setSuggestedTutors] = useState<SuggestedTutor[]>([])
  const [tutorsLoading, setTutorsLoading] = useState(false)
  const [forceAssignment, setForceAssignment] = useState(false)

  const [includeUnpaid, setIncludeUnpaid] = useState(false)

  useEffect(() => {
    loadEnrollments()
  }, [refreshTrigger, includeUnpaid])

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

  const openAssignModal = async (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setTutorId('')
    setForceAssignment(false)
    setTutorsLoading(true)
    setAssignModalOpen(true)

    try {
      const data = await api.getSuggestedTutors(enrollment.id)
      setSuggestedTutors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load suggested tutors:', err)
      setSuggestedTutors([])
      toast({
        title: "Warning",
        description: "Could not load suggested tutors. All approved tutors will be shown.",
        variant: "default",
      })
    } finally {
      setTutorsLoading(false)
    }
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

    // Check if force assignment is needed
    const selectedTutor = suggestedTutors.find(t => t.id === tutorId)
    if (!forceAssignment && selectedTutor && (selectedTutor.availabilityStatus === 'UNAVAILABLE' || selectedTutor.currentStudents >= selectedTutor.maxStudents)) {
      toast({
        title: "Warning",
        description: "This tutor is at capacity or unavailable. Check 'Force assignment' to proceed anyway.",
        variant: "default",
      })
      return
    }

    setActionLoading(true)

    try {
      await api.assignTutorWithForce(selectedEnrollment.id, { tutorId, force: forceAssignment })
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
            <label className="text-sm font-medium text-gray-300">Suggested Tutors *</label>
            {tutorsLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : suggestedTutors.length === 0 ? (
              <div className="text-sm text-gray-400 py-2">No suggested tutors available for this enrollment</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedTutors.map((tutor) => {
                  const isUnavailable = tutor.availabilityStatus === 'UNAVAILABLE'
                  const atCapacity = tutor.currentStudents >= tutor.maxStudents
                  const needsWarning = isUnavailable || atCapacity

                  return (
                    <div
                      key={tutor.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        tutorId === tutor.id
                          ? 'border-brand-gold bg-brand-gold/10'
                          : needsWarning
                            ? 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50'
                            : 'border-brand-gold/20 bg-brand-dark/30 hover:border-brand-gold/40'
                      }`}
                      onClick={() => setTutorId(tutor.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{tutor.fullName}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {tutor.subjects.map(s => s.name).join(', ')}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-gray-400">
                              {tutor.currentStudents}/{tutor.maxStudents} students
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className={`${
                              tutor.availabilityStatus === 'AVAILABLE' ? 'text-green-400' :
                              tutor.availabilityStatus === 'LIMITED' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {tutor.availabilityStatus}
                            </span>
                          </div>
                        </div>
                        {needsWarning && (
                          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 ml-2" />
                        )}
                        {tutorId === tutor.id && !needsWarning && (
                          <CheckCircle className="h-5 w-5 text-brand-gold shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {suggestedTutors.some(t => t.availabilityStatus === 'UNAVAILABLE' || t.currentStudents >= t.maxStudents) && (
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="force"
                checked={forceAssignment}
                onCheckedChange={(checked) => setForceAssignment(checked === true)}
              />
              <label
                htmlFor="force"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Force assignment (override capacity/availability warnings)
              </label>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
