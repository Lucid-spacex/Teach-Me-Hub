'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Session } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Video, Edit, Clock, Calendar, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogSessionModal } from './LogSessionModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface TutorSessionListProps {
  refreshTrigger?: number
}

export function TutorSessionList({ refreshTrigger }: TutorSessionListProps) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

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

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    setDeletingSession(sessionId)
    try {
      await api.deleteSession(sessionId)
      toast({
        title: 'Session deleted',
        description: 'Session has been deleted successfully',
      })
      loadSessions()
    } catch (error) {
      console.error('Failed to delete session:', error)
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete session',
        variant: 'destructive',
      })
    } finally {
      setDeletingSession(null)
    }
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
      cell: (session: Session) => (
        <div className="text-muted-foreground">{new Date(session.scheduledAt).toLocaleString()}</div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      cell: (session: Session) => (
        <div className="text-muted-foreground">{session.durationMinutes} min</div>
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
      key: 'enrollment',
      header: 'Enrollment ID',
      cell: (session: Session) => (
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{session.enrollmentId}</code>
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
          {session.status === 'SCHEDULED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openLogModal(session)}
              className="gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10"
            >
              <Edit className="h-4 w-4" />
              Log Session
            </Button>
          )}
          {session.createdBy === 'TUTOR' && session.status === 'SCHEDULED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSession(session.id)}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={deletingSession === session.id}
            >
              {deletingSession === session.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Card className="bg-card border-brand-gold/30">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-gold" />
            My Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Sessions</h3>
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
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Sessions</h3>
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
        </CardContent>
      </Card>

      <LogSessionModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        session={selectedSession}
        onSuccess={handleRefresh}
      />
    </>
  )
}
