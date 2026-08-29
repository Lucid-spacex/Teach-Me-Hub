'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { EnrollmentList } from '@/components/parent/EnrollmentList'
import { EnrollStudentModal } from '@/components/parent/EnrollStudentModal'
import { Student } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, GraduationCap, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ParentEnrollmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setStudents(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshEnrollments = () => {
    loadStudents()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" text="Loading enrollments..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center max-w-md">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-4">
              <p className="font-medium">Failed to load enrollments</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={refreshEnrollments} className="gap-2">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/parent')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Enrollments</h1>
                <p className="text-sm text-muted-foreground">Manage tutoring enrollments</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setEnrollModalOpen(true)}
            className="gap-2"
            disabled={students.length === 0}
          >
            <Plus className="h-4 w-4" />
            Enroll Student
          </Button>
        </div>
        
        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-lg p-8 max-w-md mx-auto">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first child to start enrolling them in tutoring programs.
              </p>
              <Button onClick={() => router.push('/parent/students')}>
                Add Your First Child
              </Button>
            </div>
          </div>
        ) : (
          <EnrollmentList 
            students={students}
            onEnrollStudent={() => setEnrollModalOpen(true)}
          />
        )}
      </div>

      <EnrollStudentModal
        open={enrollModalOpen}
        onOpenChange={setEnrollModalOpen}
        students={students}
        onSuccess={refreshEnrollments}
      />
    </div>
  )
}
