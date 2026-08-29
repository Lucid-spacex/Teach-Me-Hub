'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Session, Enrollment } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Video } from 'lucide-react'
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
    return enrollment ? `Subject: ${enrollment.subjectId}` : 'Unknown'
  }

  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const columns = [
    {
      key: 'dateTime',
      header: 'Date & Time',
      cell: (session: Session) => new Date(session.scheduledAt).toLocaleString(),
    },
    {
      key: 'duration',
      header: 'Duration',
      cell: (session: Session) => `${session.durationMinutes} min`,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (session: Session) => (
        <StatusBadge status={session.status} />
      ),
    },
    {
      key: 'enrollment',
      header: 'Enrollment',
      cell: (session: Session) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{getEnrollmentInfo(session.enrollmentId)}</code>
      ),
    },
    {
      key: 'zoom',
      header: 'Zoom Link',
      cell: (session: Session) => (
        session.zoomLink ? (
          <Button variant="default" size="sm" asChild>
            <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="gap-2">
              <Video className="h-4 w-4" />
              Join
            </a>
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">Not available</span>
        )
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Upcoming Sessions</h2>

      <DataTable
        data={upcomingSessions}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: Video,
          title: "No upcoming sessions",
          description: "Your scheduled sessions will appear here",
        }}
      />
    </div>
  )
}
