'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Session, Enrollment } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Video, Download, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface SessionListProps {
  enrollments: Enrollment[]
  refreshTrigger?: number
}

export function SessionList({ enrollments, refreshTrigger }: SessionListProps) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRecording, setLoadingRecording] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  const loadSessions = async () => {
    try {
      const data = await api.getSessions()
      setSessions(data)
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentInfo = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId)
    if (enrollment?.subject) {
      return enrollment.subject.name
    }
    return enrollment ? `Subject: ${enrollment.subjectId}` : 'Unknown'
  }

  const handleViewRecording = async (sessionId: string) => {
    setLoadingRecording(sessionId)
    try {
      const recording = await api.getSessionRecording(sessionId)
      if (recording.recordingUrl) {
        window.open(recording.recordingUrl, '_blank')
      } else {
        toast({
          title: 'Recording Not Available',
          description: 'The recording is not yet available or has been removed.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to view this recording.',
          variant: 'destructive',
        })
      } else if (status === 404) {
        toast({
          title: 'Recording Not Found',
          description: 'This recording does not exist or has been removed.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Failed to Load Recording',
          description: err instanceof Error ? err.message : 'An error occurred while loading the recording.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoadingRecording(null)
    }
  }

  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const completedSessions = sessions
    .filter(s => s.status === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const columns = [
    {
      key: 'dateTime',
      header: 'Date & Time',
      cell: (session: Session) => (
        <div className="text-gray-300">{new Date(session.scheduledAt).toLocaleString()}</div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      cell: (session: Session) => (
        <div className="text-gray-300">{session.durationMinutes} min</div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (session: Session) => (
        <div className="text-gray-300">{getEnrollmentInfo(session.enrollmentId)}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (session: Session) => (
        <StatusBadge status={session.status} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (session: Session) => (
        <div className="flex gap-2">
          {session.meetLink && session.status === 'SCHEDULED' && (
            <Button variant="outline" size="sm" asChild className="border-brand-gold text-brand-gold hover:bg-brand-gold/10">
              <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Video className="h-4 w-4" />
                Join
              </a>
            </Button>
          )}
          {session.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewRecording(session.id)}
              disabled={loadingRecording === session.id}
              className="border-brand-gold text-brand-gold hover:bg-brand-gold/10 gap-2"
            >
              {loadingRecording === session.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Recording
                </>
              )}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-card border-brand-gold/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-gold" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={upcomingSessions}
            columns={columns}
            loading={loading}
            emptyState={{
              icon: Calendar,
              title: "No upcoming sessions",
              description: "Your scheduled sessions will appear here",
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-brand-gold/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-brand-gold" />
            Completed Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={completedSessions}
            columns={columns}
            loading={loading}
            emptyState={{
              icon: Video,
              title: "No completed sessions",
              description: "Completed sessions with recordings will appear here",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
