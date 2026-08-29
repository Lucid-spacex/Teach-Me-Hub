'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { SessionList } from '@/components/parent/SessionList'
import { Enrollment } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Video } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ParentSessionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setEnrollments(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load enrollments'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" text="Loading sessions..." />
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
              <p className="font-medium">Failed to load sessions</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={loadEnrollments} className="gap-2">
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
        <div className="mb-8 flex items-center gap-4">
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
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
              <p className="text-sm text-muted-foreground">View and manage tutoring sessions</p>
            </div>
          </div>
        </div>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-lg p-8 max-w-md mx-auto">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Enroll your child in a tutoring program to start scheduling sessions.
              </p>
              <Button onClick={() => router.push('/parent/enrollments')}>
                View Enrollments
              </Button>
            </div>
          </div>
        ) : (
          <SessionList enrollments={enrollments} />
        )}
      </div>
    </div>
  )
}