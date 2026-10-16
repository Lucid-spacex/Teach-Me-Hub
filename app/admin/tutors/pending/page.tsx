'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { TutorWithProfile, VettingStatus } from '@/lib/types'
import { UserCheck, ArrowLeft, RefreshCw, Users } from 'lucide-react'

export default function AdminPendingTutorsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadTutors()
  }, [router])

  const loadTutors = async () => {
    setLoading(true)
    try {
      const response = await api.getPendingTutors()
      const data = (response as any)?.data || response
      setTutors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load pending tutors:', err)
      setTutors([])
      toast({
        title: 'Error',
        description: 'Failed to load pending tutors',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVetting = async (tutorId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(tutorId)
    try {
      await api.updateTutorVetting(tutorId, { vettingStatus: status })
      toast({
        title: 'Success',
        description: `Tutor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      })
      loadTutors()
    } catch (err) {
      console.error('Failed to update vetting:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update vetting status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/20 p-2 rounded-lg border border-brand-gold/30">
              <UserCheck className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Pending Tutors</h1>
              <p className="text-sm text-gray-400">Review and approve tutor applications</p>
            </div>
          </div>
        </div>
        <Button
          onClick={loadTutors}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tutors List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : tutors.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Pending Tutors</h3>
            <p className="text-sm text-gray-400">All tutor applications have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id || tutor.tutorProfile?.id} className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">{tutor.fullName || tutor.user?.fullName || 'Tutor'}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">{tutor.email || tutor.user?.email || 'No email'}</p>
                  </div>
                  <StatusBadge status={tutor.tutorProfile?.vettingStatus || tutor.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Subjects</p>
                    <p className="text-white">{tutor.tutorProfile?.subjects?.join(', ') || 'No subjects listed'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Bio</p>
                    <p className="text-white text-sm">{tutor.tutorProfile?.bio || 'No bio provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Hourly Rate</p>
                    <p className="text-white">${tutor.tutorProfile?.hourlyRate || 0}/hour</p>
                  </div>
                  {tutor.tutorProfile?.credentialsUrl && (
                    <div>
                      <p className="text-sm text-gray-400">Credentials</p>
                      <a
                        href={tutor.tutorProfile.credentialsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-gold hover:underline text-sm"
                      >
                        View credentials
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleVetting(tutor.id || tutor.tutorProfile?.id || '', 'APPROVED')}
                      disabled={actionLoading === (tutor.id || tutor.tutorProfile?.id)}
                      className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                    >
                      {actionLoading === (tutor.id || tutor.tutorProfile?.id) ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    <Button
                      onClick={() => handleVetting(tutor.id || tutor.tutorProfile?.id || '', 'REJECTED')}
                      disabled={actionLoading === (tutor.id || tutor.tutorProfile?.id)}
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      {actionLoading === (tutor.id || tutor.tutorProfile?.id) ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Reject'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
