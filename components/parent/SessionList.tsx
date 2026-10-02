'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Session, Enrollment } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Video, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionListProps {
  enrollments: Enrollment[]
  refreshTrigger?: number
}

export function SessionList({ enrollments, refreshTrigger }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

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

  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

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
          {session.zoomLink && session.status === 'SCHEDULED' && (
            <Button variant="outline" size="sm" asChild className="border-brand-gold text-brand-gold hover:bg-brand-gold/10">
              <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Video className="h-4 w-4" />
                Join
              </a>
            </Button>
          )}
          {session.recordingStatus === 'AVAILABLE' && session.recordingLink && (
            <Button variant="outline" size="sm" asChild className="border-brand-gold text-brand-gold hover:bg-brand-gold/10">
              <a href={session.recordingLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Download className="h-4 w-4" />
                Recording
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
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
  )
}
