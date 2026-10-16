'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Session, SessionStatus } from '@/lib/types'
import { Search, Calendar, Clock, Users, Video, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AdminSessionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadSessions()
  }, [router, page, statusFilter])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminSessions({
        status: statusFilter !== 'ALL' ? statusFilter as SessionStatus : undefined,
        page,
        limit,
      })
      setSessions(data.data || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to load sessions:', err)
      setSessions([])
      setTotal(0)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load sessions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadSessions()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDurationLabel = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Sessions</h1>
          <p className="text-sm text-gray-400">View and manage all tutoring sessions</p>
        </div>
        <Button
          onClick={loadSessions}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-brand-gold/30">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by student, tutor, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-brand-dark/30 border-brand-gold/30 text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-brand-dark/30 border-brand-gold/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="MISSED">Missed</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-brand-gold/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brand-gold" />
              <div>
                <p className="text-2xl font-bold text-white">{total}</p>
                <p className="text-xs text-gray-400">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Sessions Found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="p-0">
              <div className="divide-y divide-brand-gold/10">
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 hover:bg-brand-gold/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={session.status} />
                          <span className="text-xs text-gray-400">ID: {session.id.slice(0, 8)}...</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-brand-gold" />
                            <span className="text-white">{formatDateTime(session.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-brand-gold" />
                            <span className="text-white">{getDurationLabel(session.durationMinutes)}</span>
                          </div>
                          {session.enrollment && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-brand-gold" />
                                <span className="text-white">
                                  Student: {session.enrollment.student?.fullName || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-brand-gold" />
                                <span className="text-white">
                                  Subject: {session.enrollment.subject?.name || 'Unknown'}
                                </span>
                              </div>
                            </>
                          )}
                          {session.tutor && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-brand-gold" />
                              <span className="text-white">
                                Tutor: {session.tutor.fullName || 'Unknown'}
                              </span>
                            </div>
                          )}
                          {session.createdBy && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-brand-gold" />
                              <span className="text-white">
                                Created by: {session.createdBy}
                              </span>
                            </div>
                          )}
                          {session.zoomMeetingId && (
                            <div className="flex items-center gap-2 text-sm">
                              <Video className="h-4 w-4 text-brand-gold" />
                              <span className="text-white">Zoom Meeting: {session.zoomMeetingId}</span>
                            </div>
                          )}
                          {session.zoomLink && (
                            <a
                              href={session.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-brand-gold hover:underline"
                            >
                              Open Zoom Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
