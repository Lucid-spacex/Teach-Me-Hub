'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Session } from '@/lib/types'
import { Calendar, Clock, Video, BookOpen, RefreshCw, ArrowLeft, Users, AlertCircle } from 'lucide-react'

export default function StudentSchedulePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadSchedule()
  }, [router])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const data = await api.getStudentSchedule()
      setSchedule(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load schedule:', err)
      toast({
        title: 'Error',
        description: 'Failed to load class schedule',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const now = Date.now()
  const upcomingSessions = schedule
    .filter(s => new Date(s.scheduledAt).getTime() >= now && s.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const pastSessions = schedule
    .filter(s => new Date(s.scheduledAt).getTime() < now || s.status === 'COMPLETED' || s.status === 'MISSED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const activeList = tab === 'UPCOMING' ? upcomingSessions : pastSessions

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Class Schedule</h1>
              <p className="text-sm text-gray-400">View upcoming live tutoring sessions and past lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-card border border-brand-gold/20 p-1">
              <Button
                variant={tab === 'UPCOMING' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTab('UPCOMING')}
                className={tab === 'UPCOMING' ? 'bg-brand-gold text-brand-dark text-xs font-semibold' : 'text-gray-400 text-xs'}
              >
                Upcoming ({upcomingSessions.length})
              </Button>
              <Button
                variant={tab === 'PAST' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTab('PAST')}
                className={tab === 'PAST' ? 'bg-brand-gold text-brand-dark text-xs font-semibold' : 'text-gray-400 text-xs'}
              >
                Past ({pastSessions.length})
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSchedule}
              disabled={loading}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : activeList.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">
                {tab === 'UPCOMING' ? 'No Upcoming Sessions' : 'No Past Sessions'}
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                {tab === 'UPCOMING'
                  ? 'Your upcoming tutoring sessions will appear here as soon as they are scheduled by your tutor.'
                  : 'You have not attended any completed sessions yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeList.map((session) => {
              const sessionDate = new Date(session.scheduledAt)
              const isToday = sessionDate.toDateString() === new Date().toDateString()
              return (
                <Card key={session.id} className="bg-card border-brand-gold/25 hover:border-brand-gold/40 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${
                        session.status === 'SCHEDULED' ? 'bg-brand-gold/20 text-brand-gold' :
                        session.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {session.status}
                      </span>
                      {isToday && session.status === 'SCHEDULED' && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold animate-pulse">
                          Today
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-gold" />
                      {sessionDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {sessionDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="text-xs text-gray-400">
                      Duration: <span className="text-white font-medium">{session.durationMinutes} minutes</span>
                    </div>

                    {session.tutorNotes && (
                      <div className="bg-brand-dark/50 p-2.5 rounded border border-brand-gold/15 text-xs text-gray-300">
                        <span className="text-brand-gold font-medium block mb-0.5">Tutor Notes:</span>
                        {session.tutorNotes}
                      </div>
                    )}

                    {session.homeworkAssigned && (
                      <div className="bg-brand-dark/50 p-2.5 rounded border border-brand-gold/15 text-xs text-gray-300">
                        <span className="text-brand-gold font-medium block mb-0.5">Homework:</span>
                        {session.homeworkAssigned}
                      </div>
                    )}

                    {session.status === 'SCHEDULED' && session.zoomLink ? (
                      <Button
                        size="sm"
                        asChild
                        className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold mt-2"
                      >
                        <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <Video className="h-4 w-4" />
                          Join Live Class
                        </a>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
  )
}
