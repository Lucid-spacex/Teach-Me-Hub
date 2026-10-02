'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { SessionList } from '@/components/parent/SessionList'
import { Enrollment } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Video, RefreshCw, BookOpen } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ParentSessionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'PARENT') {
      router.push('/login')
      return
    }

    loadEnrollments()
  }, [router])

  const loadEnrollments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getEnrollments()
      setEnrollments(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load enrollments'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
    loadEnrollments()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-[#D4A017] animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Loading tutoring sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 rounded-2xl bg-card border border-red-500/30">
          <div className="text-red-400 mb-3 font-semibold">Failed to load sessions</div>
          <p className="text-xs text-zinc-400 mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
            className="bg-primary hover:bg-secondary text-black font-semibold rounded-xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-muted via-muted to-muted border border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Live Tutoring Sessions</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
                Live Classes
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              View scheduled live classes, Zoom meeting links, and session attendance history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-white/5 h-10 px-3 rounded-xl"
            title="Refresh Sessions"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/parent/enrollments">
            <Button
              variant="outline"
              className="border-primary/40 bg-muted text-secondary hover:bg-primary/10 hover:border-primary font-semibold h-10 px-4 rounded-xl flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Enrollments
            </Button>
          </Link>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-card border border-border max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border text-zinc-500 flex items-center justify-center mx-auto">
            <Video className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Sessions Scheduled</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Enroll your children in subjects to get matched with certified tutors and schedule weekly live sessions.
            </p>
          </div>
          <Link href="/parent/enrollments">
            <Button className="bg-primary hover:bg-secondary text-black font-semibold rounded-xl text-xs h-9 px-4">
              Explore Enrollments
            </Button>
          </Link>
        </div>
      ) : (
        <SessionList enrollments={enrollments} refreshTrigger={refreshTrigger} />
      )}
    </div>
  )
}