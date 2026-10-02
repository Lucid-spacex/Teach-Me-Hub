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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-muted via-muted to-muted border border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">My Children</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
                Profiles
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your children&apos;s profiles, student codes, and individual academic portfolios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-white/5 h-10 px-3 rounded-xl"
            title="Refresh Children"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setAddStudentModalOpen(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary/80 text-black font-bold h-10 px-4 rounded-xl shadow-[0_4px_16px_rgba(212,160,23,0.25)] flex items-center gap-2"
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
