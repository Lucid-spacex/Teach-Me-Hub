'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { AllTutorsList } from '@/components/admin/AllTutorsList'
import { Button } from '@/components/ui/button'
import { ArrowLeft, GraduationCap, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function AdminAllTutorsPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
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
              onClick={() => router.push('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tutor Directory</h1>
                <p className="text-sm text-muted-foreground">View all tutors across the platform</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={refreshData} 
            variant="primary" 
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <AllTutorsList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
