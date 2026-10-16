'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StudentList } from '@/components/parent/StudentList'
import { AddStudentModal } from '@/components/parent/AddStudentModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Plus, Sparkles, RefreshCw } from 'lucide-react'

export default function ParentStudentsPage() {
  const router = useRouter()
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">My Children</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
                Profiles
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Manage your children&apos;s profiles, student codes, and individual academic portfolios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            className="h-10 rounded-xl px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Refresh Children"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setAddStudentModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Add Child
          </Button>
        </div>
      </div>

      {/* Student List */}
      <StudentList
        onAddStudent={() => setAddStudentModalOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      <AddStudentModal
        open={addStudentModalOpen}
        onOpenChange={setAddStudentModalOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
