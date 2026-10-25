'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Clock, AlertCircle, ArrowLeft, Video, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { UpcomingClass, ClassScheduleStatus } from '@/lib/types'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'

export default function TutorUpcomingClassesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [classes, setClasses] = useState<UpcomingClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadClasses()
  }, [router])

  const loadClasses = async () => {
    setLoading(true)
    try {
      const data = await api.getTutorUpcomingClasses()
      setClasses(data)
    } catch (error) {
      console.error('Failed to load upcoming classes:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load upcoming classes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = (classItem: UpcomingClass) => {
    if (classItem.sessionData && classItem.sessionData.id) {
      // Session already exists, go to sessions page
      router.push('/tutor/sessions')
    } else {
      // Prefill session form with class data
      router.push(`/tutor/sessions?prefill=${JSON.stringify({
        enrollmentId: classItem.enrollmentId,
        studentId: classItem.studentId,
        studentName: classItem.studentName,
        subjectName: classItem.subjectName,
        scheduledDate: classItem.nextScheduledDate,
        scheduledTime: classItem.nextScheduledTime,
      })}`)
    }
  }

  const getStatusBadge = (status: ClassScheduleStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="default" className="bg-green-600">Scheduled</Badge>
      case 'UNSCHEDULED':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Needs Session</Badge>
      case 'MISSED':
        return <Badge variant="destructive">Missed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tutor')}
            className="gap-2 text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Upcoming Classes</h1>
            <p className="text-muted-foreground mt-2">View and manage your upcoming tutoring sessions</p>
          </div>
        </div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No upcoming classes</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              You don't have any scheduled classes at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <Card
                key={`${classItem.enrollmentId}-${classItem.studentId}`}
                className={`bg-card border-brand-gold/30 ${classItem.within24h ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-foreground">{classItem.studentName}</h3>
                        {getStatusBadge(classItem.status)}
                        {classItem.within24h && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Within 24h
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block">Subject</span>
                            <p className="text-foreground font-medium">{classItem.subjectName}</p>
                          </div>
                        </div>
                        {classItem.nextScheduledDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Next Class</span>
                              <p className="text-foreground font-medium">
                                {new Date(classItem.nextScheduledDate).toLocaleDateString()}
                                {classItem.nextScheduledTime && ` at ${classItem.nextScheduledTime}`}
                              </p>
                              {classItem.timezone && (
                                <p className="text-xs text-muted-foreground">{classItem.timezone}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {classItem.sessionData && classItem.sessionData.meetLink && (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Google Meet</span>
                              <a
                                href={classItem.sessionData.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-gold hover:underline"
                              >
                                Join Meeting
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {classItem.status === 'UNSCHEDULED' ? (
                        <Button
                          size="sm"
                          onClick={() => handleCreateSession(classItem)}
                          className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Session
                        </Button>
                      ) : classItem.sessionData ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/tutor/sessions')}
                          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                        >
                          View Session
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
