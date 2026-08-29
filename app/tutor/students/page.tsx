'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { TutorStudentList } from '@/components/tutor/StudentList'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'

export default function TutorStudentsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tutor')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
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
