'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Session } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Video, Edit, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogSessionModal } from './LogSessionModal'

interface TutorSessionListProps {
  refreshTrigger?: number
}

export function TutorSessionList({ refreshTrigger }: TutorSessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  const loadSessions = async () => {
    try {
      const data = await api.getTutorSessions()
      setSessions(data)
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const openLogModal = (session: Session) => {
    setSelectedSession(session)
    setLogModalOpen(true)
  }

  const handleRefresh = () => {
    loadSessions()
  }

  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const pastSessions = sessions
    .filter(s => s.status !== 'SCHEDULED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

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
      header: 'Enrollment ID',
      cell: (session: Session) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{session.enrollmentId}</code>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (session: Session) => (
        <div className="flex gap-2">
          {session.zoomLink && session.status === 'SCHEDULED' && (
            <Button variant="primary" size="sm" asChild>
              <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Video className="h-4 w-4" />
                Join
              </a>
            </Button>
          )}
          {session.status === 'SCHEDULED' && (
            <Button
              size="sm"
              onClick={() => openLogModal(session)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Log Session
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Sessions</h2>

        {upcomingSessions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Upcoming Sessions</h3>
            <DataTable
              data={upcomingSessions}
              columns={columns}
              loading={loading}
              emptyState={{
                icon: Clock,
                title: "No upcoming sessions",
                description: "Your scheduled sessions will appear here",
              }}
            />
          </div>
        )}

        {pastSessions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Past Sessions</h3>
            <DataTable
              data={pastSessions}
              columns={columns}
              loading={loading}
              emptyState={{
                icon: Clock,
                title: "No past sessions",
                description: "Completed sessions will appear here",
              }}
            />
          </div>
        )}

        {sessions.length === 0 && !loading && (
          <DataTable
            data={[]}
            columns={columns}
            loading={false}
            emptyState={{
              icon: Clock,
              title: "No sessions",
              description: "Your tutoring sessions will appear here",
            }}
          />
        )}
      </div>

      <LogSessionModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        session={selectedSession}
        onSuccess={handleRefresh}
      />
    </>
  )
}
