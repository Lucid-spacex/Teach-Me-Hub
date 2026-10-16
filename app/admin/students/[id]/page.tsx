'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Avatar } from '@/components/shared/Avatar'
import { Modal } from '@/components/shared/Modal'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { AdminStudentDetail, Enrollment, Session, Grade, Assignment, SuggestedTutor } from '@/lib/types'
import { ArrowLeft, RefreshCw, Users, Calendar, BookOpen, Award, BarChart3, FileText, TrendingUp, UserCheck, Mail, Phone, Clock, AlertCircle } from 'lucide-react'

export default function AdminStudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [studentData, setStudentData] = useState<AdminStudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'sessions' | 'grades' | 'attendance' | 'assignments' | 'reports' | 'performance'>('overview')
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [suggestedTutors, setSuggestedTutors] = useState<SuggestedTutor[]>([])
  const [selectedTutor, setSelectedTutor] = useState<string>('')
  const [assigning, setAssigning] = useState(false)
  const [regeneratePinConfirm, setRegeneratePinConfirm] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    if (params.id) {
      loadStudentData(params.id as string)
    }
  }, [router, params.id])

  const loadStudentData = async (studentId: string) => {
    setLoading(true)
    setDetailLoading(true)
    try {
      const data = await api.getStudentDetail(studentId)
      setStudentData(data)
    } catch (err) {
      console.error('Failed to load student data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load student details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setDetailLoading(false)
    }
  }

  const handleAssignTutor = async (enrollmentId: string, tutorId: string) => {
    setAssigning(true)
    try {
      await api.assignTutor(enrollmentId, { tutorId })
      toast({
        title: 'Tutor Assigned',
        description: 'Tutor has been assigned successfully',
      })
      setAssignModalOpen(false)
      setSelectedEnrollment(null)
      setSelectedTutor('')
      loadStudentData(params.id as string)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to assign tutor',
        variant: 'destructive',
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleOpenAssignModal = async (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setAssignModalOpen(true)
    try {
      const tutors = await api.getSuggestedTutors(enrollment.id)
      setSuggestedTutors(tutors)
    } catch (err) {
      console.error('Failed to load suggested tutors:', err)
    }
  }

  const handleRegeneratePin = async () => {
    if (!confirm('Are you sure you want to regenerate the student PIN?')) return

    try {
      await api.adminRegenerateStudentPin(params.id as string)
      toast({
        title: 'PIN Regenerated',
        description: 'The student PIN has been regenerated',
      })
      setRegeneratePinConfirm(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to regenerate PIN',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" className="text-brand-gold" />
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-12">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/students')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </Button>
          </div>
          <Card className="bg-card border-brand-gold/30 text-center py-16">
            <CardContent>
              <p className="text-gray-400">Student not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { student, parent, tutors, enrollments, sessions, attendance, grades, assignments, progressReports, performance } = studentData

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/students')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Student Details</h1>
              <p className="text-sm text-gray-400">{student.fullName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setRegeneratePinConfirm(true)}
              variant="outline"
              size="sm"
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              Regenerate PIN
            </Button>
            <Button
              onClick={() => loadStudentData(params.id as string)}
              variant="outline"
              size="sm"
              disabled={detailLoading}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Card */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar
                    fullName={student.fullName}
                    profilePictureUrl={student.profilePictureUrl}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{student.fullName}</h3>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-400">Grade</p>
                        <p className="text-white">{student.actualGrade}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">School</p>
                        <p className="text-white">{student.school || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date of Birth</p>
                        <p className="text-white">{student.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Gender</p>
                        <p className="text-white">{student.gender}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Card */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-brand-gold" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar
                    fullName={parent.fullName}
                    profilePictureUrl={parent.profilePictureUrl}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{parent.fullName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {parent.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {parent.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Tutors */}
            {tutors && tutors.length > 0 && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-gold" />
                    Assigned Tutors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutors.map((tutor) => (
                      <div key={tutor.id} className="p-4 bg-brand-dark/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Avatar
                            fullName={tutor.fullName}
                            profilePictureUrl={tutor.profilePictureUrl}
                            size="md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{tutor.fullName}</h4>
                            <p className="text-xs text-gray-400 mt-1">{tutor.email}</p>
                            <p className="text-xs text-gray-400">{tutor.phone}</p>
                            {tutor.bio && (
                              <p className="text-xs text-gray-300 mt-2 line-clamp-2">{tutor.bio}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-gray-400">Subjects: {tutor.subjects?.join(', ') || 'None'}</p>
                            </div>
                            {tutor.availabilityStatus && (
                              <div className="mt-2">
                                <StatusBadge status={tutor.availabilityStatus} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {(['overview', 'enrollments', 'sessions', 'grades', 'attendance', 'assignments', 'reports', 'performance'] as const).map(tab => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab)}
                      className={activeTab === tab ? 'bg-brand-gold text-brand-dark' : ''}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-brand-dark/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Enrollments</p>
                      <p className="text-2xl font-bold text-white">{enrollments?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-brand-dark/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Sessions</p>
                      <p className="text-2xl font-bold text-white">{sessions?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-brand-dark/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Average Grade</p>
                      <p className="text-2xl font-bold text-white">
                        {grades && grades.length > 0
                          ? `${Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'enrollments' && (
                  <div className="space-y-3">
                    {!enrollments || enrollments.length === 0 ? (
                      <p className="text-sm text-gray-400">No enrollments</p>
                    ) : (
                      enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="p-4 bg-brand-dark/30 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{enrollment.subject?.name || 'Unknown Subject'}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Status: <StatusBadge status={enrollment.status} />
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {enrollment.sessionFrequency} • {new Date(enrollment.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAssignModal(enrollment)}
                            className="gap-1"
                          >
                            {enrollment.tutorId ? 'Reassign Tutor' : 'Assign Tutor'}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div className="space-y-2">
                    {!sessions || sessions.length === 0 ? (
                      <p className="text-sm text-gray-400">No sessions</p>
                    ) : (
                      sessions.slice(0, 20).map((session) => (
                        <div key={session.id} className="p-3 bg-brand-dark/30 rounded-lg flex justify-between">
                          <div>
                            <p className="text-white text-sm">{new Date(session.scheduledAt).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">{session.durationMinutes} min</p>
                          </div>
                          <StatusBadge status={session.status} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'grades' && (
                  <div className="space-y-2">
                    {!grades || !Array.isArray(grades) || grades.length === 0 ? (
                      <p className="text-sm text-gray-400">No grades yet</p>
                    ) : (
                      grades.map((grade) => (
                        <div key={grade.id} className="p-3 bg-brand-dark/30 rounded-lg flex justify-between">
                          <div>
                            <p className="text-white text-sm">{grade.assignment?.title || 'Unknown Assignment'}</p>
                            <p className="text-xs text-gray-400">{grade.score}/{grade.maxScore}</p>
                          </div>
                          <StatusBadge status={grade.status} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-2">
                    {!attendance || !Array.isArray(attendance) || attendance.length === 0 ? (
                      <p className="text-sm text-gray-400">No attendance records yet</p>
                    ) : (
                      attendance.map((att) => (
                        <div key={att.sessionId} className="p-3 bg-brand-dark/30 rounded-lg flex justify-between">
                          <div>
                            <p className="text-white text-sm">{new Date(att.sessionDate).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={att.attended ? 'Present' : 'Absent'} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-2">
                    {!assignments || assignments.length === 0 ? (
                      <p className="text-sm text-gray-400">No assignments</p>
                    ) : (
                      assignments.map((assignment) => (
                        <div key={assignment.id} className="p-3 bg-brand-dark/30 rounded-lg">
                          <p className="text-white text-sm">{assignment.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()} • Status: {assignment.status}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-2">
                    {!progressReports || progressReports.length === 0 ? (
                      <p className="text-sm text-gray-400">No progress reports</p>
                    ) : (
                      progressReports.map((report) => (
                        <div key={report.id} className="p-3 bg-brand-dark/30 rounded-lg">
                          <p className="text-white text-sm">{report.period}</p>
                          <p className="text-xs text-gray-400 mt-1">{report.summary}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'performance' && performance && (
                  <div className="space-y-4">
                    <div className="p-4 bg-brand-dark/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Average Grade</p>
                      <p className="text-2xl font-bold text-white">
                        {performance.averageGrade && performance.averageGrade.percentage !== null && performance.averageGrade.percentage !== undefined
                          ? `${performance.averageGrade.percentage.toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-brand-dark/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Attendance Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {performance.attendance && performance.attendance.rate !== null && performance.attendance.rate !== undefined
                          ? `${performance.attendance.rate.toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Assign Tutor Modal */}
      <Modal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        title="Assign Tutor"
        description={`Assign a tutor to ${selectedEnrollment?.subject?.name || 'this enrollment'}`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedEnrollment && selectedTutor && handleAssignTutor(selectedEnrollment.id, selectedTutor)}
              disabled={assigning || !selectedTutor}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {assigning ? <LoadingSpinner size="sm" /> : 'Assign'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {suggestedTutors.length === 0 ? (
            <p className="text-sm text-gray-400">No tutors available</p>
          ) : (
            <div className="space-y-2">
              {suggestedTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  onClick={() => setSelectedTutor(tutor.id)}
                  className={`p-3 rounded-lg cursor-pointer border ${
                    selectedTutor === tutor.id
                      ? 'bg-brand-gold/20 border-brand-gold'
                      : 'bg-brand-dark/30 border-transparent hover:border-brand-gold/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{tutor.fullName}</p>
                      <p className="text-xs text-gray-400">{tutor.subjects?.map(s => s.name).join(', ') || 'No subjects'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{tutor.currentStudents}/{tutor.maxStudents} students</p>
                      <StatusBadge status={tutor.availabilityStatus || 'UNKNOWN'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Regenerate PIN Modal */}
      <Modal
        open={regeneratePinConfirm}
        onOpenChange={setRegeneratePinConfirm}
        title="Regenerate Student PIN"
        description="This will generate a new PIN for the student. The old PIN will no longer work."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRegeneratePinConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegeneratePin} className="bg-destructive hover:bg-destructive/90">
              Regenerate
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <p className="text-sm text-amber-500">The student will need to use the new PIN to log in. Make sure to communicate this to the parent.</p>
        </div>
      </Modal>
    </div>
  )
}
