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
import { TutorStudent, Session, TutorDocument, HighestQualification, TutorLevel, HowHeardSource } from '@/lib/types'
import { ArrowLeft, RefreshCw, Mail, Phone, Users, Calendar, Info, FileText, Check, X, Download, AlertCircle, MessageSquare } from 'lucide-react'

export default function AdminTutorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [tutorData, setTutorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions' | 'grades' | 'reports'>('overview')
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [unapproveModalOpen, setUnapproveModalOpen] = useState(false)
  const [unapproveReason, setUnapproveReason] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    if (params.id) {
      loadTutorData(params.id as string)
    }
  }, [router, params.id])

  const loadTutorData = async (tutorId: string) => {
    setLoading(true)
    setDetailLoading(true)
    try {
      // Load tutor details from new API
      const detail = await api.getTutorDetail(tutorId)
      setTutorData(detail)

      // Load tutor's students and sessions
      const [studentsData, sessionsData] = await Promise.all([
        api.getAdminTutorStudents(tutorId).catch(() => []),
        api.getAdminTutorSessions(tutorId).catch(() => []),
      ])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
    } catch (err) {
      console.error('Failed to load tutor data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load tutor details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setDetailLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this tutor?')) return

    setActionLoading(true)
    try {
      await api.updateTutorVetting(params.id as string, { vettingStatus: 'APPROVED' })
      toast({
        title: 'Tutor Approved',
        description: 'The tutor has been approved successfully',
      })
      loadTutorData(params.id as string)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to approve tutor',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(true)
    try {
      await api.updateTutorVetting(params.id as string, { vettingStatus: 'REJECTED', reason: rejectReason })
      toast({
        title: 'Tutor Rejected',
        description: 'The tutor has been rejected',
      })
      setRejectModalOpen(false)
      setRejectReason('')
      loadTutorData(params.id as string)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to reject tutor',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnapprove = async () => {
    if (!unapproveReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for unapproval',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(true)
    try {
      await api.updateTutorVetting(params.id as string, { vettingStatus: 'REJECTED', reason: unapproveReason })
      toast({
        title: 'Tutor Unapproved',
        description: 'The tutor has been unapproved and can no longer take new students',
      })
      setUnapproveModalOpen(false)
      setUnapproveReason('')
      loadTutorData(params.id as string)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to unapprove tutor',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenDocument = async (doc: TutorDocument) => {
    try {
      window.open(doc.signedUrl, '_blank')
    } catch (err) {
      console.error('Failed to open document:', err)
      toast({
        title: 'Error',
        description: 'Failed to open document. Please try refreshing the page.',
        variant: 'destructive',
      })
      // Refresh detail to get new signed URL if expired
      loadTutorData(params.id as string)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" className="text-brand-gold" />
      </div>
    )
  }

  if (!tutorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-12">
          <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/tutors')}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tutors
          </Button>
        </div>
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <p className="text-gray-400">Tutor not found</p>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  const { user, application, profile, metrics } = tutorData
  const applicationStatus = application?.applicationStatus || 'DRAFT'

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
            onClick={() => router.push('/admin/tutors')}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tutors
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Tutor Profile</h1>
            <p className="text-sm text-gray-400">{user?.fullName || 'Tutor'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/admin/messages')}
            variant="outline"
            size="sm"
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Message Tutor
          </Button>
          {applicationStatus === 'SUBMITTED' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4 mr-2" />}
                Approve
              </Button>
              <Button
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : <X className="h-4 w-4 mr-2" />}
                Reject
              </Button>
            </>
          )}
          {user?.status === 'APPROVED' && (
            <Button
              onClick={() => setUnapproveModalOpen(true)}
              disabled={actionLoading}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
            >
              {actionLoading ? <LoadingSpinner size="sm" /> : <X className="h-4 w-4 mr-2" />}
              Unapprove
            </Button>
          )}
          <Button
            onClick={() => loadTutorData(params.id as string)}
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
          {/* Header Card */}
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar
                  fullName={user?.fullName || 'Tutor'}
                  profilePictureUrl={user?.profilePictureUrl}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{user?.fullName || 'Tutor'}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </span>
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={user?.status || 'UNKNOWN'} />
                    {profile?.availabilityStatus && (
                      <StatusBadge status={profile.availabilityStatus} />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          {application && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-brand-gold" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">First Name</p>
                    <p className="text-white">{application.firstName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Name</p>
                    <p className="text-white">{application.lastName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Middle Name</p>
                    <p className="text-white">{application.middleName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{application.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Birthday</p>
                    <p className="text-white">{application.birthday || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Location</p>
                    <p className="text-white">{application.city}, {application.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Qualification</p>
                    <p className="text-white">{application.highestQualification || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Years of Experience</p>
                    <p className="text-white">{application.yearsOfExperience || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Subjects</p>
                  <p className="text-white text-sm">{application.subjects?.join(', ') || 'None'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Levels</p>
                  <p className="text-white text-sm">{application.levels?.join(', ') || 'None'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Why Teach</p>
                  <p className="text-white text-sm">{application.whyTeach || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">How Heard</p>
                  <p className="text-white text-sm">{application.howHeard || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">About You</p>
                  <p className="text-white text-sm whitespace-pre-wrap">{application.aboutYou || '-'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {application?.documents && application.documents.length > 0 && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-gold" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc: TutorDocument) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-brand-dark/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc.fileName}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDocument(doc)}
                        className="gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile */}
          {profile && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-brand-gold" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Bio</p>
                    <p className="text-white">{profile.bio || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Hourly Rate</p>
                    <p className="text-white">${profile.hourlyRate || 0}/hr</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Availability Status</p>
                    <StatusBadge status={profile.availabilityStatus || 'NOT_SET'} />
                  </div>
                  <div>
                    <p className="text-gray-400">Max Students</p>
                    <p className="text-white">{profile.maxStudents || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Students</p>
                    <p className="text-white">{metrics?.currentStudents || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status Note</p>
                    <p className="text-white">{profile.statusNote || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <div className="flex gap-2">
                {(['overview', 'students', 'sessions', 'grades', 'reports'] as const).map(tab => (
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
              {activeTab === 'students' && (
                <div className="space-y-2">
                  {students.length === 0 ? (
                    <p className="text-sm text-gray-400">No students assigned</p>
                  ) : (
                    students.map((ts) => (
                      <div key={ts.enrollment.id} className="p-3 bg-brand-dark/30 rounded-lg">
                        <p className="text-white text-sm">{ts.student.fullName}</p>
                        <p className="text-xs text-gray-400">{ts.student.actualGrade} • {ts.enrollment.subject?.name || 'No subject'}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'sessions' && (
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-400">No sessions scheduled</p>
                  ) : (
                    sessions.slice(0, 10).map((session) => (
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
                <p className="text-sm text-gray-400">Grades data would be loaded from paginated sub-resource</p>
              )}
              {activeTab === 'reports' && (
                <p className="text-sm text-gray-400">Reports data would be loaded from paginated sub-resource</p>
              )}
              {activeTab === 'overview' && metrics && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Sessions</p>
                    <p className="text-white">{metrics.totalSessions || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Students</p>
                    <p className="text-white">{metrics.totalStudents || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        title="Reject Tutor Application"
        description="Please provide a reason for rejecting this application"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={actionLoading} className="bg-destructive hover:bg-destructive/90">
              {actionLoading ? <LoadingSpinner size="sm" /> : 'Reject'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <p className="text-sm text-amber-500">This action cannot be undone</p>
          </div>
          <div>
            <label className="text-sm font-medium">Reason for Rejection *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full mt-2 bg-brand-dark/30 border border-brand-gold/30 rounded-lg p-3 text-white"
              placeholder="Explain why the application is being rejected..."
            />
          </div>
        </div>
      </Modal>

      {/* Unapprove Modal */}
      <Modal
        open={unapproveModalOpen}
        onOpenChange={setUnapproveModalOpen}
        title="Unapprove Tutor"
        description="This tutor will no longer be able to take new students"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setUnapproveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnapprove} disabled={actionLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {actionLoading ? <LoadingSpinner size="sm" /> : 'Unapprove'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <p className="text-sm text-orange-500">This action will prevent the tutor from accepting new students. Existing enrollments will not be affected.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Reason for Unapproval *</label>
            <textarea
              value={unapproveReason}
              onChange={(e) => setUnapproveReason(e.target.value)}
              rows={4}
              className="w-full mt-2 bg-brand-dark/30 border border-brand-gold/30 rounded-lg p-3 text-white"
              placeholder="Explain why the tutor is being unapproved..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
