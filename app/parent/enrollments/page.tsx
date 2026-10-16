'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { EnrollmentList } from '@/components/parent/EnrollmentList'
import { EnrollStudentModal } from '@/components/parent/EnrollStudentModal'
import { Student } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, RefreshCw, CreditCard, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ParentEnrollmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'PARENT') {
      router.push('/login')
      return
    }

    loadStudents()
  }, [router])

  const loadStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getStudents()
      setStudents(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students'
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

  const refreshEnrollments = () => {
    setRefreshTrigger((prev) => prev + 1)
    loadStudents()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-[#D4A017] animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Loading enrollments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 rounded-2xl bg-card border border-red-500/30">
          <div className="text-red-400 mb-3 font-semibold">Failed to load enrollments</div>
          <p className="text-xs text-zinc-400 mb-4">{error}</p>
          <Button
            onClick={refreshEnrollments}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Enrollments</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
                Courses
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review active courses, tutor assignments, monthly tuition status, and enrollment approvals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={refreshEnrollments}
            variant="ghost"
            className="h-10 rounded-xl px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/parent/payments">
            <Button
              variant="outline"
              className="border-primary/40 bg-muted text-secondary hover:bg-primary/10 hover:border-primary font-semibold h-10 px-4 rounded-xl flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Pay Fees
            </Button>
          </Link>
          <Button
            onClick={() => setEnrollModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Enroll Subject
          </Button>
        </div>
      </div>

      <EnrollmentList
        students={students}
        onEnrollStudent={() => setEnrollModalOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      <EnrollStudentModal
        open={enrollModalOpen}
        onOpenChange={setEnrollModalOpen}
        students={students}
        onSuccess={refreshEnrollments}
      />
    </div>
  )
}
