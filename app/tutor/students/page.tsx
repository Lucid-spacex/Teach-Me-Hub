'use client'

import { useRouter } from 'next/navigation'
import { TutorStudentList } from '@/components/tutor/StudentList'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'

export default function TutorStudentsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tutor')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/20 p-2 rounded-lg border border-brand-gold/30">
              <Users className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Students</h1>
              <p className="text-sm text-muted-foreground">View assigned students and their progress</p>
            </div>
          </div>
        </div>

        <TutorStudentList />
      </div>
    </div>
  )
}
