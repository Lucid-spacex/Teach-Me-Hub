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
  const [filters, setFilters] = useState({
    tutorId: '',
    status: '' as ClassScheduleStatus | '',
    fromDate: '',
    toDate: '',
  })

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
      const dateStr = filters.fromDate || new Date().toISOString().split('T')[0]
      const response = await api.getAdminClassSchedule(dateStr)
      setSchedule(response.data)
      setUnscheduledCount(response.unscheduledWithin24hCount)
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
        <div className="mb-8 flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-foreground">Class Schedule</h1>
              <p className="text-muted-foreground mt-2">View all students with their next class</p>
            </div>
          </div>
          {unscheduledCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {unscheduledCount} classes unscheduled within 24h
            </Badge>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tutor ID</label>
                <Input
                  placeholder="Enter tutor ID"
                  value={filters.tutorId}
                  onChange={(e) => setFilters({ ...filters, tutorId: e.target.value })}
                  className="bg-background border-input"
                />
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
        {schedule.length === 0 ? (
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
        )}
      </div>
    </div>
  )
}
