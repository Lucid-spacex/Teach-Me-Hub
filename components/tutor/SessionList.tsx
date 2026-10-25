'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Session } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Video, Edit, Clock, Calendar, Trash2, Loader2, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogSessionModal } from './LogSessionModal'
import { CreateSessionModal } from './CreateSessionModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface TutorSessionListProps {
  refreshTrigger?: number
}

function TutorSessionListContent({ refreshTrigger }: TutorSessionListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<string | null>(null)
  const [prefillData, setPrefillData] = useState<any>(null)

  useEffect(() => {
    loadSessions()

    // Check for prefill data from URL
    const prefill = searchParams.get('prefill')
    if (prefill) {
      try {
        const data = JSON.parse(prefill)
        setPrefillData(data)
        setCreateModalOpen(true)
        // Clear URL params
        router.replace('/tutor/sessions')
      } catch (err) {
        console.error('Failed to parse prefill data:', err)
      }
    }
  }, [refreshTrigger, searchParams, router])

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

  const openLogModal = (session: Session, isReschedule = false) => {
    setSelectedSession(session)
    setLogModalOpen(true)
    // We'll pass the reschedule mode through the modal state
    if (isReschedule) {
      // The modal will detect this and set isRescheduling state
    }
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
        <div className="flex items-center gap-2">
          <StatusBadge status={session.status} />
          {session.needsReschedule && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Reschedule
            </Badge>
          )}
        </div>
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
              onClick={() => openLogModal(session)}
              className="gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10"
            >
              <Edit className="h-4 w-4" />
              Mark Attendance
            </Button>
          )}
          {session.createdBy === 'TUTOR' && session.status === 'SCHEDULED' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSession(session)
                  // Set a flag to indicate reschedule mode
                  const updatedSession = { ...session, _rescheduleMode: true }
                  setSelectedSession(updatedSession as any)
                  setLogModalOpen(true)
                }}
                className="gap-2 text-brand-gold hover:bg-brand-gold/10"
              >
                <Edit className="h-4 w-4" />
                Reschedule
              </Button>
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
            </>
          )}
          {session.createdBy !== 'TUTOR' && session.status === 'SCHEDULED' && (
            <span className="text-xs text-muted-foreground italic">
              Session created by admin
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Card className="bg-card border-brand-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-gold" />
              My Sessions
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </div>
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
        onOpenChange={(open) => {
          setLogModalOpen(open)
          if (!open) setSelectedSession(null)
        }}
        session={selectedSession}
        onSuccess={handleRefresh}
        initialReschedule={false}
      />
      <CreateSessionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        prefillData={prefillData}
        onSuccess={handleRefresh}
      />
    </>
  )
}

export function TutorSessionList({ refreshTrigger }: TutorSessionListProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>}>
      <TutorSessionListContent refreshTrigger={refreshTrigger} />
    </Suspense>
  )
}
