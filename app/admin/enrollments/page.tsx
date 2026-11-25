'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { UnmatchedEnrollmentsList } from '@/components/admin/UnmatchedEnrollmentsList'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function AdminEnrollmentsPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Enrollment Management</h1>
                <p className="text-sm text-muted-foreground">Assign tutors to unmatched enrollments</p>
              </div>
            </div>
          </div>
          <Button
            onClick={refreshData}
            variant="default"
            size="sm"
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <UnmatchedEnrollmentsList onUpdate={refreshData} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
