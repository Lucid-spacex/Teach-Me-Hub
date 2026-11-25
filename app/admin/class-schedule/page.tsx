'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Clock, User, AlertCircle, ArrowLeft, Filter } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { ClassScheduleItem, ClassScheduleStatus } from '@/lib/types'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useNotifications } from '@/components/shared/NotificationProvider'

export default function AdminClassSchedulePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { byCategory } = useNotifications()
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>([])
  const [unscheduledCount, setUnscheduledCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'sessions' | 'enrollments'>('sessions')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({
    tutorId: '',
    subjectId: '',
    status: '' as ClassScheduleStatus | '',
    fromDate: '',
    toDate: '',
    search: '',
  })
  const [tutorList, setTutorList] = useState<{ id: string; name: string }[]>([])
  const [subjectList, setSubjectList] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Load tutors and subjects for dropdown filters
    Promise.all([
      api.getApprovedTutorsForAssignment().catch(() => []),
      api.getSubjects().catch(() => []),
    ]).then(([tutorsData, subjectsData]) => {
      setTutorList(tutorsData.map(t => ({ id: t.id, name: t.fullName || t.email })))
      setSubjectList(subjectsData.map(s => ({ id: s.id, name: s.name })))
    })
  }, [])

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadSchedule()
  }, [router, filters])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      if (mode === 'sessions') {
        const response = await api.getAdminClassSchedule({
          fromDate: filters.fromDate || new Date().toISOString().split('T')[0],
          toDate: filters.toDate,
          tutorId: filters.tutorId || undefined,
          status: filters.status || undefined,
        })
        setSchedule(response.data)
        setUnscheduledCount(response.unscheduledWithin24hCount)
      } else {
        // Enrollments mode
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        }
        if (filters.tutorId) params.tutorId = filters.tutorId
        if (filters.subjectId) params.subjectId = filters.subjectId
        if (filters.status) params.status = filters.status
        if (filters.fromDate) params.from = filters.fromDate
        if (filters.toDate) params.to = filters.toDate
        if (filters.search) params.search = filters.search

        const response = await api.getAdminClassSchedule(params)
        setEnrollments(response.data || [])
        setPagination({
          page: response.page || 1,
          limit: response.limit || 20,
          total: response.total || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load class schedule:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load class schedule',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ClassScheduleStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="default" className="bg-green-600">Scheduled</Badge>
      case 'UNSCHEDULED':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Unscheduled</Badge>
      case 'MISSED':
        return <Badge variant="destructive">Missed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Class Schedule</h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'sessions' ? 'View all students with their next class' : 'View student enrollment schedules'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              size="sm"
              variant={mode === 'sessions' ? 'default' : 'ghost'}
              onClick={() => setMode('sessions')}
              className="text-xs"
            >
              Sessions
            </Button>
            <Button
              size="sm"
              variant={mode === 'enrollments' ? 'default' : 'ghost'}
              onClick={() => setMode('enrollments')}
              className="text-xs"
            >
              Student Schedules
            </Button>
          </div>
          {mode === 'sessions' && unscheduledCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {unscheduledCount} classes unscheduled within 24h
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-brand-gold/30 mb-6">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand-gold" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {mode === 'enrollments' && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Search</label>
                  <Input
                    placeholder="Student name..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="bg-background border-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
                  <Select
                    value={filters.subjectId || 'ALL'}
                    onValueChange={(val) => setFilters({ ...filters, subjectId: val === 'ALL' ? '' : val })}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All subjects</SelectItem>
                      {subjectList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tutor</label>
              <Select
                value={filters.tutorId || 'ALL'}
                onValueChange={(val) => setFilters({ ...filters, tutorId: val === 'ALL' ? '' : val })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="All tutors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All tutors</SelectItem>
                  {tutorList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value as ClassScheduleStatus | '' })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="UNSCHEDULED">Unscheduled</SelectItem>
                  <SelectItem value="MISSED">Missed</SelectItem>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Date From</label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="bg-background border-input"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Date To</label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="bg-background border-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Schedule List */}
        {mode === 'sessions' ? (
          schedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No classes found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                There are no classes matching your current filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedule.map((item) => (
                <Card key={`${item.studentId}-${item.enrollmentId}`} className="bg-card border-brand-gold/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-foreground">{item.studentName}</h3>
                          {getStatusBadge(item.status)}
                          {item.unscheduledWithin24h && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Within 24h
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Tutor</span>
                              <p className="text-foreground font-medium">{item.tutorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Subject</span>
                              <p className="text-foreground font-medium">{item.subjectName}</p>
                            </div>
                          </div>
                          {item.nextClassDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="text-muted-foreground block">Next Class</span>
                                <p className="text-foreground font-medium">
                                  {new Date(item.nextClassDate).toLocaleDateString()}
                                  {item.nextClassTime && ` at ${item.nextClassTime}`}
                                </p>
                                {item.timezone && (
                                  <p className="text-xs text-muted-foreground">{item.timezone}</p>
                                )}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground block">Enrollment ID</span>
                            <p className="text-foreground font-medium">{item.enrollmentId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Enrollments mode - student schedules
          enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No enrollments found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                There are no enrollments matching your current filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((item) => (
                <Card key={item.id} className="bg-card border-brand-gold/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-foreground">{item.student?.fullName}</h3>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Tutor</span>
                              <p className="text-foreground font-medium">{item.tutor?.fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-muted-foreground block">Subject</span>
                              <p className="text-foreground font-medium">{item.subject?.name}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Start Date</span>
                            <p className="text-foreground font-medium">
                              {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Sessions Scheduled</span>
                            <p className="text-foreground font-medium">{item.sessionsScheduledCount || 0}</p>
                          </div>
                        </div>
                        {/* Schedule Details */}
                        <div className="mt-4 p-3 rounded-lg bg-background border border-brand-gold/20">
                          <div className="grid md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Days of Week</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.availableDays && item.availableDays.length > 0 ? (
                                  item.availableDays.map((day: string) => (
                                    <span key={day} className="px-2 py-0.5 rounded bg-brand-gold/10 text-brand-gold text-xs">
                                      {day}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">Not set</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Time Window</p>
                              <p className="text-foreground">
                                {item.preferredStartHour !== undefined && item.preferredEndHour !== undefined
                                  ? `${item.preferredStartHour}:00 - ${item.preferredEndHour}:00`
                                  : 'Not set'}
                                {item.scheduleTimezone && (
                                  <span className="text-muted-foreground text-xs ml-1">({item.scheduleTimezone})</span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Next Expected Class</p>
                              <p className="text-foreground">
                                {item.nextExpectedClass?.scheduledAt
                                  ? new Date(item.nextExpectedClass.scheduledAt).toLocaleString()
                                  : 'Not scheduled'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* Pagination for enrollments mode */}
        {mode === 'enrollments' && pagination.total > pagination.limit && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page * pagination.limit >= pagination.total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
  )
}
