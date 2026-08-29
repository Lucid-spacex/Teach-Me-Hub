'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { StudentList } from '@/components/parent/StudentList'
import { AddStudentModal } from '@/components/parent/AddStudentModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Plus } from 'lucide-react'

export default function ParentStudentsPage() {
  const router = useRouter()
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
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
              onClick={() => router.push('/parent')}
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
                <h1 className="text-2xl font-bold text-foreground">My Children</h1>
                <p className="text-sm text-muted-foreground">Manage your children's profiles</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setAddStudentModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Child
          </Button>
        </div>
        
        <StudentList 
          onAddStudent={() => setAddStudentModalOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <AddStudentModal
        open={addStudentModalOpen}
        onOpenChange={setAddStudentModalOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
