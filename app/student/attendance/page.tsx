'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { StudentAttendance } from '@/lib/types'
import { Calendar, CheckCircle2, XCircle, Clock, ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

export default function StudentAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [attendanceData, setAttendanceData] = useState<{ attendanceRate: number; sessions: StudentAttendance[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadAttendance()
  }, [router])

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const data = await api.getStudentAttendanceSummary()
      setAttendanceData(data)
    } catch (err) {
      console.error('Failed to load attendance:', err)
      toast({
        title: 'Error',
        description: 'Failed to load attendance records',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const sessions = attendanceData?.sessions || []
  const attendanceRate = attendanceData?.attendanceRate ?? 0
  const attendedCount = sessions.filter(s => s.attended).length
  const missedCount = sessions.length - attendedCount

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
              <h1 className="text-3xl font-serif font-bold text-white">Attendance Log</h1>
              <p className="text-sm text-gray-400">Detailed record of attended and scheduled tutoring sessions</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAttendance}
            disabled={loading}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-card border-brand-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-extrabold ${
                  attendanceRate >= 80 ? 'text-green-400' : attendanceRate >= 60 ? 'text-brand-gold' : 'text-red-400'
                }`}>
                  {attendanceRate}%
                </span>
                <div className="p-3 bg-brand-gold/15 rounded-full text-brand-gold">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Attended Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-green-400">
                  {attendedCount}
                </span>
                <div className="p-3 bg-green-500/15 rounded-full text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Missed / Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-red-400">
                  {missedCount}
                </span>
                <div className="p-3 bg-red-500/15 rounded-full text-red-400">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Session History */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-gold" />
              Lesson Attendance History
            </CardTitle>
            <CardDescription className="text-gray-400">
              Complete list of recorded class attendance sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" className="text-brand-gold" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No attendance records have been registered yet. Attendance will be recorded as your classes take place.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((record, index) => (
                  <div
                    key={record.sessionId || index}
                    className="flex items-center justify-between p-4 rounded-lg bg-brand-dark/60 border border-brand-gold/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        record.attended ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {record.attended ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {new Date(record.sessionDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(record.sessionDate).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      record.attended
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.attended ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
